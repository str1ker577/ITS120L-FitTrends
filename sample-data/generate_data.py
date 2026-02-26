"""
Generate 6 months of realistic sample data (July–December 2025)
for the FitTrends inventory management system.

Outputs: products.csv, inventory.csv, inventory_snapshots.csv,
         buyers.csv, orders.csv, order_items.csv
"""

import csv
import random
import os
from datetime import date, timedelta
from bson import ObjectId  # pip install pymongo if needed

# ── Fallback if pymongo not installed ──────────────────────────────────
try:
    from bson import ObjectId
    def new_id():
        return str(ObjectId())
except ImportError:
    import uuid
    def new_id():
        return uuid.uuid4().hex[:24]

random.seed(42)  # Reproducible data

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ══════════════════════════════════════════════════════════════════════
# 1. PRODUCTS — 5 designs × 4 sizes = 20 products
# ══════════════════════════════════════════════════════════════════════

DESIGNS = [
    ("AGAD-AGAD. HINDI REMAND-REMAND.", "Remand Nation", "Black"),
    ("WE DEMAND, YOU REMAND?!", "Remand Nation", "Dark Blue"),
    ("FORTHWITH IS MY PERSONALITY NOW", "The Forthwith Files", "White"),
    ("KEEP CALM AND PROCEED FORTHWITH", "The Forthwith Files", "Black"),
    ("FORTHWITH: DOING WHAT IS RIGHT, RIGHT AWAY", "The Forthwith Files", "Dark Blue"),
]
SIZES = ["S", "M", "L", "XL"]

# Size popularity weights for order generation (M and L sell more)
SIZE_WEIGHTS = {"S": 0.15, "M": 0.35, "L": 0.35, "XL": 0.15}

products = []
for design_name, collection, color in DESIGNS:
    for size in SIZES:
        products.append({
            "_id": new_id(),
            "productName": design_name,
            "collection": collection,
            "color": color,
            "size": size,
        })

with open(os.path.join(OUTPUT_DIR, "products.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["_id", "productName", "collection", "color", "size"])
    w.writeheader()
    w.writerows(products)

print(f"✓ products.csv — {len(products)} rows")

# ══════════════════════════════════════════════════════════════════════
# 2. BUYERS — ~70 realistic Filipino buyers
# ══════════════════════════════════════════════════════════════════════

FIRST_NAMES = [
    "Juan", "Maria", "Jose", "Ana", "Carlos", "Rosa", "Pedro", "Luz",
    "Miguel", "Carmen", "Rafael", "Elena", "Antonio", "Sofia", "Marco",
    "Isabella", "Gabriel", "Patricia", "Diego", "Camila", "Andres",
    "Valentina", "Luis", "Daniela", "Fernando", "Nicole", "Ricardo",
    "Angela", "Eduardo", "Beatriz", "Emilio", "Cristina", "Alejandro",
    "Monica", "Roberto", "Teresa", "Cesar", "Gloria", "Arturo", "Irene",
    "Juanito", "Maricel", "Francis", "Joy", "Mark", "Grace", "John",
    "Cherry", "Rodel", "Marites", "Jomar", "Aileen", "Benedict", "Lovely",
    "Kenneth", "Rhea", "Christian", "April", "Jerome", "Precious",
    "Vincent", "Faith", "Raymond", "Hope", "Aldrin", "Angel",
    "Jayson", "Kristine", "Nathaniel", "Charisse",
]
LAST_NAMES = [
    "Santos", "Reyes", "Cruz", "Bautista", "Del Rosario", "Gonzales",
    "Ramos", "Aquino", "Garcia", "Mendoza", "Torres", "Villanueva",
    "Lopez", "Castillo", "Rivera", "Fernandez", "Dela Cruz", "Pascual",
    "Soriano", "Navarro", "Martinez", "De Leon", "Flores", "Aguilar",
    "Corpuz", "Perez", "Santiago", "Domingo", "Manalo", "Mercado",
    "Salazar", "Dizon", "Lim", "Tan", "Chua", "Ong",
]
TOWNS_PROVINCES = [
    ("Quezon City", "Metro Manila"), ("Manila", "Metro Manila"),
    ("Makati", "Metro Manila"), ("Taguig", "Metro Manila"),
    ("Pasig", "Metro Manila"), ("Mandaluyong", "Metro Manila"),
    ("San Juan", "Metro Manila"), ("Marikina", "Metro Manila"),
    ("Caloocan", "Metro Manila"), ("Valenzuela", "Metro Manila"),
    ("Antipolo", "Rizal"), ("Cainta", "Rizal"),
    ("Taytay", "Rizal"), ("Binangonan", "Rizal"),
    ("Bacoor", "Cavite"), ("Imus", "Cavite"),
    ("Dasmarinas", "Cavite"), ("General Trias", "Cavite"),
    ("San Pedro", "Laguna"), ("Binan", "Laguna"),
    ("Santa Rosa", "Laguna"), ("Calamba", "Laguna"),
    ("Meycauayan", "Bulacan"), ("San Jose del Monte", "Bulacan"),
    ("Malolos", "Bulacan"), ("Angeles", "Pampanga"),
    ("San Fernando", "Pampanga"), ("Cebu City", "Cebu"),
    ("Mandaue", "Cebu"), ("Lapu-Lapu", "Cebu"),
    ("Davao City", "Davao del Sur"), ("Cagayan de Oro", "Misamis Oriental"),
    ("Iloilo City", "Iloilo"), ("Bacolod", "Negros Occidental"),
    ("Baguio", "Benguet"), ("Lipa", "Batangas"),
]

buyers = []
used_names = set()
while len(buyers) < 70:
    fn = random.choice(FIRST_NAMES)
    ln = random.choice(LAST_NAMES)
    full = f"{fn} {ln}"
    if full in used_names:
        continue
    used_names.add(full)
    town, province = random.choice(TOWNS_PROVINCES)
    buyers.append({
        "_id": new_id(),
        "buyerName": full,
        "town": town,
        "province": province,
    })

with open(os.path.join(OUTPUT_DIR, "buyers.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["_id", "buyerName", "town", "province"])
    w.writeheader()
    w.writerows(buyers)

print(f"✓ buyers.csv — {len(buyers)} rows")

# ══════════════════════════════════════════════════════════════════════
# 3. INVENTORY — one record per product (running state at end of Dec)
# ══════════════════════════════════════════════════════════════════════

# We'll compute inventory as we simulate orders month by month
# Initial stock per product at the start of July 2025
INITIAL_STOCK = {p["_id"]: random.randint(25, 50) for p in products}

# Track running inventory and total sold
running_inv = dict(INITIAL_STOCK)
total_sold = {p["_id"]: 0 for p in products}

# ══════════════════════════════════════════════════════════════════════
# 4. ORDERS + ORDER ITEMS — simulate 6 months of sales
# ══════════════════════════════════════════════════════════════════════

PLATFORMS = ["SHOPEE", "LAZADA"]
PLATFORM_WEIGHTS = [0.55, 0.45]  # Shopee slightly more popular

# Shirt base price
BASE_PRICE = 399.0
# Some designs are premium
DESIGN_PREMIUM = {
    "AGAD-AGAD. HINDI REMAND-REMAND.": 0,
    "WE DEMAND, YOU REMAND?!": 0,
    "FORTHWITH IS MY PERSONALITY NOW": 50,
    "KEEP CALM AND PROCEED FORTHWITH": 50,
    "FORTHWITH: DOING WHAT IS RIGHT, RIGHT AWAY": 100,
}

MONTHS = [
    (2025, 7), (2025, 8), (2025, 9),
    (2025, 10), (2025, 11), (2025, 12),
]

orders = []
order_items_rows = []
snapshots = []

# Inventory IDs (one per product)
inventory_ids = {p["_id"]: new_id() for p in products}

for month_idx, (year, month) in enumerate(MONTHS):
    # ── Restock on 1st of month ──
    if month_idx > 0:  # July starts with INITIAL_STOCK, no restock
        for p in products:
            restock_qty = random.randint(15, 40)
            running_inv[p["_id"]] += restock_qty

    # ── Take snapshot on 1st of month ──
    snapshot_date = date(year, month, 1)
    for p in products:
        snapshots.append({
            "_id": new_id(),
            "snapshotDate": snapshot_date.isoformat(),
            "inventoryId": inventory_ids[p["_id"]],
            "productId": p["_id"],
            "quantityOnHand": running_inv[p["_id"]],
        })

    # ── Generate orders for this month ──
    # More orders in Nov/Dec (holiday rush)
    if month in (11, 12):
        num_orders = random.randint(55, 80)
    elif month in (9, 10):
        num_orders = random.randint(40, 60)
    else:
        num_orders = random.randint(30, 50)

    # Days in month
    if month == 12:
        last_day = 31
    else:
        next_month = date(year, month + 1, 1)
        last_day = (next_month - timedelta(days=1)).day

    for _ in range(num_orders):
        order_day = random.randint(1, last_day)
        order_date = date(year, month, order_day)
        delivery_days = random.randint(2, 7)
        delivery_date = order_date + timedelta(days=delivery_days)

        platform = random.choices(PLATFORMS, PLATFORM_WEIGHTS)[0]
        buyer = random.choice(buyers)

        # 1–3 items per order
        num_items = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]

        # Pick products for this order (no duplicates)
        available = [p for p in products if running_inv[p["_id"]] > 0]
        if not available:
            continue
        chosen = random.sample(available, min(num_items, len(available)))

        items = []
        gross = 0.0
        for p in chosen:
            qty = random.randint(1, min(3, running_inv[p["_id"]]))
            price = BASE_PRICE + DESIGN_PREMIUM.get(p["productName"], 0)
            gross += price * qty
            items.append({
                "productId": p["_id"],
                "quantity": qty,
            })
            running_inv[p["_id"]] -= qty
            total_sold[p["_id"]] += qty

        # Platform discount (0-15% sometimes)
        if random.random() < 0.4:
            discount = round(gross * random.uniform(0.03, 0.15), 2)
        else:
            discount = 0.0
        net_sales = round(gross - discount, 2)

        order_id = new_id()
        orders.append({
            "_id": order_id,
            "buyerId": buyer["_id"],
            "platform": platform,
            "orderDate": order_date.isoformat(),
            "deliveryDate": delivery_date.isoformat(),
            "grossAmount": gross,
            "platformDiscount": discount,
            "netSales": net_sales,
        })

        for item in items:
            order_items_rows.append({
                "orderId": order_id,
                "productId": item["productId"],
                "quantity": item["quantity"],
            })

# Sort orders by date
orders.sort(key=lambda o: o["orderDate"])

# Write orders CSV
with open(os.path.join(OUTPUT_DIR, "orders.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=[
        "_id", "buyerId", "platform", "orderDate", "deliveryDate",
        "grossAmount", "platformDiscount", "netSales"
    ])
    w.writeheader()
    w.writerows(orders)
print(f"✓ orders.csv — {len(orders)} rows")

# Write order items CSV
with open(os.path.join(OUTPUT_DIR, "order_items.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["orderId", "productId", "quantity"])
    w.writeheader()
    w.writerows(order_items_rows)
print(f"✓ order_items.csv — {len(order_items_rows)} rows")

# ══════════════════════════════════════════════════════════════════════
# 5. INVENTORY — final state after 6 months
# ══════════════════════════════════════════════════════════════════════

inventory_rows = []
for p in products:
    inventory_rows.append({
        "_id": inventory_ids[p["_id"]],
        "productId": p["_id"],
        "totalSold": total_sold[p["_id"]],
        "runningInventory": running_inv[p["_id"]],
    })

with open(os.path.join(OUTPUT_DIR, "inventory.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["_id", "productId", "totalSold", "runningInventory"])
    w.writeheader()
    w.writerows(inventory_rows)
print(f"✓ inventory.csv — {len(inventory_rows)} rows")

# ══════════════════════════════════════════════════════════════════════
# 6. INVENTORY SNAPSHOTS
# ══════════════════════════════════════════════════════════════════════

with open(os.path.join(OUTPUT_DIR, "inventory_snapshots.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=[
        "_id", "snapshotDate", "inventoryId", "productId", "quantityOnHand"
    ])
    w.writeheader()
    w.writerows(snapshots)
print(f"✓ inventory_snapshots.csv — {len(snapshots)} rows")

# ══════════════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════════════

print(f"\n{'='*50}")
print(f"ALL FILES SAVED TO: {OUTPUT_DIR}")
print(f"{'='*50}")
print(f"  products.csv            — {len(products):>4} rows")
print(f"  buyers.csv              — {len(buyers):>4} rows")
print(f"  orders.csv              — {len(orders):>4} rows")
print(f"  order_items.csv         — {len(order_items_rows):>4} rows")
print(f"  inventory.csv           — {len(inventory_rows):>4} rows")
print(f"  inventory_snapshots.csv — {len(snapshots):>4} rows")
print(f"{'='*50}")
print(f"\nTo import into MongoDB:")
print(f'  mongoimport --db fittrends_db --collection products --type csv --headerline --file products.csv')
print(f'  mongoimport --db fittrends_db --collection buyers --type csv --headerline --file buyers.csv')
print(f'  mongoimport --db fittrends_db --collection inventory --type csv --headerline --file inventory.csv')
print(f'  mongoimport --db fittrends_db --collection inventory_snapshots --type csv --headerline --file inventory_snapshots.csv')
print(f'  (For orders + embedded items, use the import_orders.py script)')
