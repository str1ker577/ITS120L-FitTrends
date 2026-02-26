"""
Import all generated CSV data into MongoDB.
Handles Order + embedded OrderItems properly.

Usage:
  python import_to_mongodb.py

Requires: pymongo
  pip install pymongo
"""

import csv
import os
from pymongo import MongoClient
from collections import defaultdict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_URI = "mongodb://localhost:27017"
DB_NAME = "fittrends_db"

client = MongoClient(DB_URI)
db = client[DB_NAME]


def read_csv(filename):
    path = os.path.join(SCRIPT_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def import_simple(collection_name, filename, type_casts=None):
    """Import a simple CSV into a collection, applying type casts."""
    rows = read_csv(filename)
    if not rows:
        print(f"  ⚠ {filename} is empty, skipping")
        return

    for row in rows:
        # Rename _id
        if "_id" in row:
            row["_id"] = row["_id"]
        # Apply type casts
        if type_casts:
            for field, cast_fn in type_casts.items():
                if field in row:
                    row[field] = cast_fn(row[field])

    db[collection_name].drop()
    db[collection_name].insert_many(rows)
    print(f"  ✓ {collection_name} — {len(rows)} documents imported")


def import_orders():
    """Import orders with embedded OrderItems."""
    orders_raw = read_csv("orders.csv")
    items_raw = read_csv("order_items.csv")

    # Group items by orderId
    items_by_order = defaultdict(list)
    for item in items_raw:
        items_by_order[item["orderId"]].append({
            "productId": item["productId"],
            "quantity": int(item["quantity"]),
        })

    # Build order documents with embedded items
    order_docs = []
    for o in orders_raw:
        doc = {
            "_id": o["_id"],
            "buyerId": o["buyerId"],
            "platform": o["platform"],
            "orderDate": o["orderDate"],
            "deliveryDate": o["deliveryDate"],
            "grossAmount": float(o["grossAmount"]),
            "platformDiscount": float(o["platformDiscount"]),
            "netSales": float(o["netSales"]),
            "items": items_by_order.get(o["_id"], []),
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
