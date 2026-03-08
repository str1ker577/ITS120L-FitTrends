"""
FitTrends ML Forecast Server
Reads live data from MongoDB and runs the VotingRegressor ensemble
from machine.ipynb to predict next-month sales per SKU.

Run:
    python forecast.py

Endpoint:
    GET http://localhost:5000/forecast
"""

from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import numpy as np
from sklearn.preprocessing import PolynomialFeatures, StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import VotingRegressor
from sklearn.compose import ColumnTransformer

app = Flask(__name__)
CORS(app)  # Allow requests from React (port 5173) and Spring Boot (port 8080)

# ─── MongoDB connection ───────────────────────────────────────────────────────
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "fittrends_db"

def get_mongo_data():
    """Pull inventory_snapshots, inventory, and products from MongoDB.

    IMPORTANT: We must NOT exclude _id from inventory and products because
    inventory_snapshots.inventoryId references inventory._id, and
    inventory_snapshots.productId references products._id.
    """
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]

    # Exclude _id from snapshots (not needed for merging)
    snapshots = list(db["inventory_snapshots"].find({}, {"_id": 0}))

    # Include _id for inventory and products (needed as merge keys)
    inventory = list(db["inventory"].find({}))
    products  = list(db["products"].find({}))

    # Convert ObjectId -> str so pandas/JSON can handle them
    def stringify_ids(docs):
        for doc in docs:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        return docs

    inventory = stringify_ids(inventory)
    products  = stringify_ids(products)

    client.close()
    return snapshots, inventory, products


# ─── Data preparation (mirrors machine.ipynb) ────────────────────────────────
def prepare_dataframe(snapshots, inventory, products):
    """
    MongoDB field names (camelCase from Spring Data):
      inventory_snapshots: id, snapshotDate, inventoryId, productId, quantityOnHand
      inventory:           id, productId, totalSold, runningInventory
      products:            id, productName, collection, color, size

    We replicate the notebook's join logic using the actual camelCase field names.
    """

    df_snap = pd.DataFrame(snapshots)
    df_inv  = pd.DataFrame(inventory)
    df_prod = pd.DataFrame(products)

    if df_snap.empty or df_inv.empty or df_prod.empty:
        raise ValueError("One or more collections returned empty data from MongoDB.")

    # inventory._id  <-- becomes 'inventoryId' (the key inventory_snapshots.inventoryId points to)
    # products._id   <-- becomes 'productId'   (the key inventory_snapshots.productId points to)
    df_inv  = df_inv.rename(columns={"_id": "inventoryId"})
    df_prod = df_prod.rename(columns={"_id": "productId"})

    # Merge snapshots <- inventory on inventoryId
    temp = pd.merge(df_snap, df_inv, on="inventoryId", how="left", suffixes=("", "_inv"))

    # productId may exist from both sides; snap's productId takes precedence
    if "productId_inv" in temp.columns:
        temp["productId"] = temp["productId"].fillna(temp["productId_inv"])
        temp.drop(columns=["productId_inv"], inplace=True)

    # Merge <- products on productId
    df = pd.merge(temp, df_prod, on="productId", how="left")

    # Rename camelCase -> snake_case for the rest of the model code
    df = df.rename(columns={
        "snapshotDate":     "snapshot_date",
        "quantityOnHand":   "quantity_on_hand",
        "totalSold":        "total_sold",
        "runningInventory":  "running_inventory",
        "productName":      "product_name",
    })

    # Drop ID columns no longer needed
    drop_cols = [c for c in ["id", "inventoryId", "productId"] if c in df.columns]
    df.drop(columns=drop_cols, inplace=True)

    # Parse date and extract month
    df["snapshot_date"] = pd.to_datetime(df["snapshot_date"])
    df["s_year"]  = df["snapshot_date"].dt.year
    df["s_month"] = df["snapshot_date"].dt.month

    df = df.sort_values(["product_name", "size", "snapshot_date"])
    return df


# ─── Feature engineering (mirrors machine.ipynb) ─────────────────────────────
def create_features(df):
    sku_cols = ["product_name", "size"]

    df["sales_lag_1"] = df.groupby(sku_cols)["total_sold"].shift(1)
    df["target"]      = df.groupby(sku_cols)["total_sold"].shift(-1)

    df = df.dropna().reset_index(drop=True)
    return df


# ─── Model (VotingRegressor — identical to machine.ipynb) ────────────────────
def build_model(numeric_features, categorical_features):
    numeric_transform = Pipeline([
        ("scaler", StandardScaler()),
        ("poly",   PolynomialFeatures(degree=2, include_bias=False)),
    ])
    categorical_transform = OneHotEncoder(handle_unknown="ignore")

    preprocessor = ColumnTransformer([
        ("num", numeric_transform,    numeric_features),
        ("cat", categorical_transform, categorical_features),
    ])

    poly_model = Pipeline([("pre", preprocessor), ("linreg", LinearRegression())])
    knn_model  = Pipeline([("pre", preprocessor), ("knn",    KNeighborsRegressor(n_neighbors=3))])
    tree_model = Pipeline([("pre", preprocessor), ("tree",   DecisionTreeRegressor(max_depth=3, random_state=42))])

    return VotingRegressor([("poly", poly_model), ("knn", knn_model), ("tree", tree_model)])


# ─── Forecast endpoint ────────────────────────────────────────────────────────
@app.route("/forecast", methods=["GET"])
def forecast():
    try:
        # 1. Load live data
        snapshots, inventory, products = get_mongo_data()

        if not snapshots or not inventory or not products:
            return jsonify({"error": "No data found in MongoDB. Make sure the database is seeded."}), 404

        # 2. Prepare dataframe
        df = prepare_dataframe(snapshots, inventory, products)
        df_feat = create_features(df.copy())

        if df_feat.empty:
            return jsonify({"error": "Not enough historical data to generate a forecast (need at least 2 months per SKU)."}), 422

        # 3. Train model
        numeric_features     = ["total_sold", "quantity_on_hand", "sales_lag_1"]
        categorical_features = ["product_name", "size"]

        # Guard: make sure all needed columns exist
        for col in numeric_features + categorical_features + ["target"]:
            if col not in df_feat.columns:
                return jsonify({"error": f"Missing expected column: {col}"}), 500

        model = build_model(numeric_features, categorical_features)
        X = df_feat[numeric_features + categorical_features]
        y = df_feat["target"]
        model.fit(X, y)

        # 4. Predict demand
        df_feat["pred_demand"] = model.predict(X).clip(min=0)

        # 5. Inventory simulation (base-stock policy)
        z            = 1.28   # 90th-percentile safety factor
        holding_cost = 1
        penalty_cost = 5

        sku_std = (
            df_feat.groupby(["product_name", "size"])["total_sold"]
            .transform("std")
            .fillna(0)
        )
        df_feat["base_stock"]   = df_feat["pred_demand"] + z * sku_std
        df_feat["inventory"]    = df_feat["quantity_on_hand"].copy()
        df_feat["reorder_qty"]  = np.maximum(0, df_feat["base_stock"] - df_feat["inventory"])
        df_feat["inventory"]   += df_feat["reorder_qty"]
        df_feat["sales"]        = df_feat[["inventory", "target"]].min(axis=1)
        df_feat["lost_sales"]   = np.maximum(0, df_feat["target"] - df_feat["inventory"])
        df_feat["inventory"]   -= df_feat["sales"]
        df_feat["holding_cost"] = df_feat["inventory"] * holding_cost
        df_feat["penalty_cost"] = df_feat["lost_sales"] * penalty_cost
        df_feat["total_cost"]   = df_feat["holding_cost"] + df_feat["penalty_cost"]

        # 6. Compute per-SKU confidence (inverse of relative MAE, capped 70–99 %)
        df_feat["abs_err"] = abs(df_feat["target"] - df_feat["pred_demand"])
        sku_mae = df_feat.groupby(["product_name", "size"])["abs_err"].mean()
        sku_mean = df_feat.groupby(["product_name", "size"])["total_sold"].mean()

        def confidence_pct(product_name, size):
            mae  = sku_mae.get((product_name, size), 0)
            mean = sku_mean.get((product_name, size), 1)
            rel_err = mae / max(mean, 1)
            conf = round((1 - rel_err) * 100)
            return max(70, min(99, conf))

        # 7. Aggregate to latest snapshot per SKU
        latest = (
            df_feat
            .sort_values("snapshot_date")
            .groupby(["product_name", "size"])
            .last()
            .reset_index()
        )

        results = []
        for _, row in latest.iterrows():
            results.append({
                "productName":     row["product_name"],
                "size":            row["size"],
                "collection":      row.get("collection", ""),
                "color":           row.get("color", ""),
                "snapshotDate":    str(row["snapshot_date"].date()),
                "currentStock":    int(row["quantity_on_hand"]),
                "totalSold":       int(row["total_sold"]),
                "predictedDemand": round(float(row["pred_demand"]), 1),
                "reorderQty":      max(0, round(float(row["reorder_qty"]))),
                "lostSales":       round(float(row["lost_sales"]), 2),
                "totalCost":       round(float(row["total_cost"]), 2),
                "confidence":      confidence_pct(row["product_name"], row["size"]),
            })

        # Sort by reorderQty descending (most urgent first)
        results.sort(key=lambda x: x["reorderQty"], reverse=True)

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 60)
    print("  FitTrends ML Forecast Server")
    print("  Listening on http://localhost:5000")
    print("  Endpoint: GET /forecast")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=True)
