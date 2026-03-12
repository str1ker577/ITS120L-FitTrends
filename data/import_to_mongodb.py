import csv
import os
from pymongo import MongoClient
from collections import defaultdict
from bson.objectid import ObjectId

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "fittrends_db"

client = MongoClient(DB_URI)
db = client[DB_NAME]

def read_csv(filename):
    path = os.path.join(SCRIPT_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def import_simple(collection_name, filename, type_casts=None):
    rows = read_csv(filename)
    if not rows:
        print(f"  ⚠ {filename} is empty, skipping")
        return

    for row in rows:
        if "_id" in row:
            row["_id"] = ObjectId(row["_id"])
        
        if type_casts:
            for field, cast_fn in type_casts.items():
                if field in row:
                    row[field] = cast_fn(row[field])

    db[collection_name].drop()
    db[collection_name].insert_many(rows)
    print(f"  ✓ {collection_name} — {len(rows)} documents imported")


def import_orders():
    orders_raw = read_csv("orders.csv")
    items_raw = read_csv("order_items.csv")

    items_by_order = defaultdict(list)
    for item in items_raw:
        items_by_order[item["orderId"]].append({
            "productId": item["productId"],
            "quantity": int(item["quantity"]),
        })

    order_docs = []
    for o in orders_raw:
        doc = {
            "_id": ObjectId(o["_id"]),
            "buyerId": o["buyerId"],
            "platform": o["platform"],
            "orderDate": o["orderDate"],
            "deliveryDate": o["deliveryDate"],
            "grossAmount": float(o["grossAmount"]),
            "platformDiscount": float(o["platformDiscount"]),
            "netSales": float(o["netSales"]),
            "items": items_by_order.get(o["_id"], []),
            # Added empty fields so models map correctly
            "buyerName": "",
            "buyerAddress": "",
            "modeOfPayment": "Cash",
        }
        order_docs.append(doc)

    db["orders"].drop()
    db["orders"].insert_many(order_docs)
    print(f"  ✓ orders — {len(order_docs)} documents imported (with embedded items)")


print(f"Importing into MongoDB: {DB_URI}/{DB_NAME}\n")

import_simple("products", "products.csv")
import_simple("buyers", "buyers.csv")
import_simple("inventory", "inventory.csv", type_casts={
    "totalSold": int,
    "runningInventory": int,
})
import_simple("inventory_snapshots", "inventory_snapshots.csv", type_casts={
    "quantityOnHand": int,
})
import_orders()

print(f"\n✅ All data imported successfully!")
client.close()
