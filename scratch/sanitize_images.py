import os
import re

def sanitize_filename(filename):
    # Remove accents
    import unicodedata
    filename = unicodedata.normalize('NFKD', filename).encode('ASCII', 'ignore').decode('ASCII')
    # Lowercase
    filename = filename.lower()
    # Replace spaces and special chars with underscores
    filename = re.sub(r'[^a-z0-9.]+', '_', filename)
    # Remove trailing/leading underscores
    filename = filename.strip('_')
    # Ensure it doesn't end with _png
    if filename.endswith('_png'):
        filename = filename[:-4] + '.png'
    return filename

base_path = r'c:\fontes\totalcelulares\img\products\apple'
for filename in os.listdir(base_path):
    old_file = os.path.join(base_path, filename)
    if os.path.isfile(old_file):
        new_name = sanitize_filename(filename)
        new_file = os.path.join(base_path, new_name)
        print(f"Renaming: {filename} -> {new_name}")
        os.rename(old_file, new_file)
