import subprocess
import os
import json

# List of queries and failure modes to generate dataset
dataset_queries = [
    ("What is 80 + 20?", "none"),
    ("What is 15% of 200?", "none"),
    ("What is 100 / 4?", "none"),
    ("What is 50 + 30?", "1"),   # Controlled Failure 1: Wrong Retrieved Value
    ("What is 75 - 25?", "2"),   # Controlled Failure 2: Wrong Calculation
    ("What is 60 * 2?", "3"),    # Controlled Failure 3: Wrong Tool Selection
    ("What is 90 / 3?", "4"),    # Controlled Failure 4: Incorrect LLM Decision
    ("What is 250 + 750?", "none"),
    ("What is 10% of 500?", "2"), # Controlled Failure 2: Wrong Calculation
    ("What is 40 * 5?", "1"),     # Controlled Failure 1: Wrong Retrieved Value
]

# Create output folder
output_folder = "dataset"
os.makedirs(output_folder, exist_ok=True)

print("=" * 60)
print("       GENERATING BLACK BOX TRAINING DATASET")
print("=" * 60)

for idx, (query, fail_mode) in enumerate(dataset_queries, 1):
    filename = f"{output_folder}/trace_{idx}_fail_{fail_mode}.json"
    print(f"\nGenerating Trace {idx} | Query: '{query}' | Fail Mode: {fail_mode}")
    
    cmd = [
        "python3", "agent.py",
        "--query", query,
        "--fail", fail_mode,
        "--output", filename
    ]
    
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
            status = data.get("status", "unknown").upper()
            fail_type = data.get("failure_type", "none")
            print(f"  -> Saved: {filename} | Status: {status} | Fail Type: {fail_type}")

print("\n" + "=" * 60)
print(f"✅ DATASET CREATED! {len(dataset_queries)} JSON traces stored in '{output_folder}/'.")
print("=" * 60)