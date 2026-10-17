import os
import shutil
from PIL import Image

def prepare_assets():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dist_src = os.path.join(base_dir, "dist")
    assets_dest = os.path.join(base_dir, "android", "app", "src", "main", "assets", "dist")

    # 1. Copy web dist
    if os.path.exists(assets_dest):
        shutil.rmtree(assets_dest)
    shutil.copytree(dist_src, assets_dest)
    print(f"Copied web dist to: {assets_dest}")

    # 2. Generate mipmap launcher icons
    icon_master_path = os.path.join(base_dir, "assets", "icon-1024.png")
    master_img = Image.open(icon_master_path)

    mipmap_sizes = {
        "mipmap-mdpi": (48, 48),
        "mipmap-hdpi": (72, 72),
        "mipmap-xhdpi": (96, 96),
        "mipmap-xxhdpi": (144, 144),
        "mipmap-xxxhdpi": (192, 192),
    }

    res_dir = os.path.join(base_dir, "android", "app", "src", "main", "res")
    for folder, size in mipmap_sizes.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        resized = master_img.resize(size, Image.Resampling.LANCZOS)
        resized.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        print(f"Generated {folder}/ic_launcher.png {size}")

    print("Android assets prepared successfully!")

if __name__ == "__main__":
    prepare_assets()
