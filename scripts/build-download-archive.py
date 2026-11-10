from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

# Keep download integrity metadata current after rebuilding the archives.
import json, hashlib
root = Path('private-downloads')
with ZipFile(root / 'pumps/WaterQuest-Pump-Data-Sheets.zip', 'w', ZIP_DEFLATED) as archive:
    for file in sorted((root / 'pumps').glob('*.pdf')):
        archive.write(file, file.name)
catalogue_path = root / 'catalogue.json'
catalogue = json.loads(catalogue_path.read_text())
for key, metadata in catalogue.items():
    file = root / key
    if file.is_file():
        metadata['sha256'] = hashlib.sha256(file.read_bytes()).hexdigest()
catalogue_path.write_text(json.dumps(catalogue, indent=2) + '\n')
