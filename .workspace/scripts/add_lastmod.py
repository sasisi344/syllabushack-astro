import os

root_dir = r"c:\Users\sasis\344dev\syllabushack-astro\src\data\post"
lastmod_line = "lastmod: 2026-02-17\n"

for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file == "index.md":
            filepath = os.path.join(subdir, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Check if lastmod already exists
            already_has_lastmod = any(line.startswith("lastmod:") for line in lines)
            if already_has_lastmod:
                continue
            
            # Find publishDate and insert lastmod after it
            new_lines = []
            for line in lines:
                new_lines.append(line)
                if line.startswith("publishDate:"):
                    new_lines.append(lastmod_line)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"Updated: {filepath}")
