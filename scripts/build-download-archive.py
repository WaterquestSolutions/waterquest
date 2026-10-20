from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

folder = Path('private-downloads/product-literature')
files = sorted(folder.glob('*.pdf'))
if len(files) != 57:
    raise RuntimeError(f'Expected 57 product literature PDFs, found {len(files)}')
with ZipFile(folder / 'WaterQuest-Solutions-Product-Literature.zip', 'w', ZIP_DEFLATED) as archive:
    for file in files:
        archive.write(file, file.name)
print('Built the gated product literature archive from 57 existing PDFs.')
