import os, re, json

content_path = "src/content/pages/"
curated_ammo = []

if not os.path.exists(content_path):
    print(f"Path {content_path} not found.")
    exit(1)

# Patterns
axiom_pattern = re.compile(r"^### (Axiom \d+ - .*?)$", re.MULTILINE)
plain_language_pattern = re.compile(r"\*\*Plain language\*\*\s*\n+(.*?)(?:\n|$)", re.MULTILINE)
bold_statement_pattern = re.compile(r"^\*\*(.*?)\*\*$", re.MULTILINE)

for file in os.listdir(content_path):
    if not file.endswith('.md'): continue
    slug = file.replace('.md', '')
    url = f"https://fractalisme.nl/{slug}"
    
    with open(os.path.join(content_path, file), 'r') as f:
        text = f.read()
        
        # 1. Axioms
        axioms = axiom_pattern.findall(text)
        for a in axioms:
            curated_ammo.append({"text": a.strip(), "url": url})
            
        # 2. Plain language
        plains = plain_language_pattern.findall(text)
        for p in plains:
            if p.strip():
                curated_ammo.append({"text": p.strip(), "url": url})
        
        # 3. Bold core statements
        bolds = bold_statement_pattern.findall(text)
        for b in bolds:
            cleaned = b.strip()
            # Filter out short things or menu items
            if 20 < len(cleaned) < 280:
                curated_ammo.append({"text": cleaned, "url": url})

# De-duplicate by text
seen = set()
final_ammo = []
for item in curated_ammo:
    if item['text'] not in seen:
        final_ammo.append(item)
        seen.add(item['text'])

# Final counts and save
with open("src/data/gatling_gun_ammo.json", "w") as f:
    json.dump(final_ammo, f, indent=2)

print(f"Refreshed ammo pool: {len(final_ammo)} rounds available.")
