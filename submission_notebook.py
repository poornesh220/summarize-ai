import sqlite3
import pandas as pd
import json
import os

db_path = "summarize_ai.sqlite"
if not os.path.exists(db_path):
    print("Error: Database not found. Please process files in the web app first.")
    exit()

conn = sqlite3.connect(db_path)
print("--- Generating Unified Project Report ---")

# 1. Load data
df = pd.read_sql_query("SELECT * FROM extractions", conn)

# 2. Flatten AI JSON into separate Excel columns
def flatten_ai_data(row):
    try:
        return pd.Series(json.loads(row['structured_data']))
    except:
        return pd.Series({})

structured_df = df.apply(flatten_ai_data, axis=1)
final_df = pd.concat([df.drop('structured_data', axis=1), structured_df], axis=1)

# 3. Save to Excel
final_df.to_excel("final_data_export.xlsx", index=False)
print(f"✅ Created 'final_data_export.xlsx' with {len(final_df)} rows.")

# 4. Print SQL Queries for Project Requirements
queries = {
    "1. Entry Counts": "SELECT type, COUNT(*) FROM extractions GROUP BY type",
    "2. All Extracted Topics": "SELECT filename, summary FROM extractions WHERE type IN ('pdf', 'voice')",
    "3. Financials (Receipts)": "SELECT filename, structured_data FROM extractions WHERE type='image' AND summary LIKE '%Total%'",
    "4. Search 'India'": "SELECT type, filename FROM extractions WHERE summary LIKE '%India%'"
}

for title, sql in queries.items():
    print(f"\n--- {title} ---")
    print(pd.read_sql_query(sql, conn).to_string(index=False))

conn.close()