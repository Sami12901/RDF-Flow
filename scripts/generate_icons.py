"""
RDF Flow - Icon & Brand Asset Generator
Generates pixel-perfect PNG icon sets and Windows multi-resolution .ico icon.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_gradient_color(t):
    """
    Interpolate cyber-acoustic gradient:
    t: 0.0 (top, cyan/green) -> 0.5 (middle, blue/azure) -> 1.0 (bottom, violet/purple)
    """
    # 0.0: #38EF7D (56, 239, 125)
    # 0.3: #00F2FE (0, 242, 254)
    # 0.7: #4FACFE (79, 172, 254)
    # 1.0: #7F00FF (127, 0, 255)
    if t < 0.3:
        p = t / 0.3
        r = int(56 * (1 - p) + 0 * p)
        g = int(239 * (1 - p) + 242 * p)
        b = int(125 * (1 - p) + 254 * p)
    elif t < 0.7:
        p = (t - 0.3) / 0.4
        r = int(0 * (1 - p) + 79 * p)
        g = int(242 * (1 - p) + 172 * p)
        b = int(254 * (1 - p) + 254 * p)
    else:
        p = (t - 0.7) / 0.3
        r = int(79 * (1 - p) + 127 * p)
        g = int(172 * (1 - p) + 0 * p)
        b = int(254 * (1 - p) + 255 * p)
    return (r, g, b)

def render_master_icon(size=1024):
    scale = size / 512.0
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Outer Glow effect layer
    glow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_margin = int(48 * scale)
    glow_radius = int(88 * scale)
    glow_draw.rounded_rectangle(
        [glow_margin, glow_margin, size - glow_margin, size - glow_margin],
        radius=glow_radius,
        fill=(0, 242, 254, 45)
    )
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(int(24 * scale)))
    img = Image.alpha_composite(img, glow_img)
    draw = ImageDraw.Draw(img)

    # 2. Base Squircle background with vertical dark-slate gradient
    squircle_margin = int(40 * scale)
    squircle_radius = int(84 * scale)
    base_box = [squircle_margin, squircle_margin, size - squircle_margin, size - squircle_margin]
    
    # Render background squircle mask
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(base_box, radius=squircle_radius, fill=255)

    # Fill background with gradient from #0f172a (15, 23, 42) to #030712 (3, 7, 18)
    bg_grad = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_grad)
    for y in range(size):
        t = y / float(size)
        r = int(15 * (1 - t) + 3 * t)
        g = int(23 * (1 - t) + 7 * t)
        b = int(42 * (1 - t) + 18 * t)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    
    img.paste(bg_grad, (0, 0), mask)
    draw = ImageDraw.Draw(img)

    # 3. Outer Border Stroke (Cyan to Violet)
    stroke_width = max(2, int(6 * scale))
    draw.rounded_rectangle(
        base_box,
        radius=squircle_radius,
        outline=(0, 242, 254, 180),
        width=stroke_width
    )

    # Inner subtle rim
    inner_box = [squircle_margin + stroke_width, squircle_margin + stroke_width, 
                 size - squircle_margin - stroke_width, size - squircle_margin - stroke_width]
    draw.rounded_rectangle(
        inner_box,
        radius=squircle_radius - stroke_width,
        outline=(255, 255, 255, 18),
        width=max(1, int(2 * scale))
    )

    # 4. Waveform Equalizer Bars (Acoustic Flow Motif)
    # Coordinates normalized on 512 grid:
    # Bar definitions: (center_x, y_top, y_bottom, width)
    bars_512 = [
        (127, 210, 302, 34), # Bar 1
        (183, 145, 367, 34), # Bar 2
        (239, 105, 407, 34), # Bar 3
        (295, 130, 382, 34), # Bar 4
        (351, 180, 332, 34), # Bar 5
        (407, 225, 287, 34)  # Bar 6
    ]

    # Pre-render bars with gradient
    bars_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bars_draw = ImageDraw.Draw(bars_img)

    for cx, y1, y2, w in bars_512:
        x_left = int((cx - w / 2.0) * scale)
        x_right = int((cx + w / 2.0) * scale)
        y_top = int(y1 * scale)
        y_bot = int(y2 * scale)
        bar_radius = int((w / 2.0) * scale)
        bar_height = y_bot - y_top

        # Draw vertical gradient rounded capsule
        for y in range(y_top, y_bot + 1):
            t = (y - y_top) / max(1, float(bar_height))
            col = create_gradient_color(t)
            # Clip horizontal span for rounded caps
            r_cap = bar_radius
            if y < y_top + r_cap:
                dy = (y_top + r_cap) - y
                dx = int(math.sqrt(max(0, r_cap * r_cap - dy * dy)))
                x1_line = int(cx * scale - dx)
                x2_line = int(cx * scale + dx)
            elif y > y_bot - r_cap:
                dy = y - (y_bot - r_cap)
                dx = int(math.sqrt(max(0, r_cap * r_cap - dy * dy)))
                x1_line = int(cx * scale - dx)
                x2_line = int(cx * scale + dx)
            else:
                x1_line = x_left
                x2_line = x_right
            
            bars_draw.line([(x1_line, y), (x2_line, y)], fill=(col[0], col[1], col[2], 255))

    # Glow layer for bars
    bar_glow = bars_img.filter(ImageFilter.GaussianBlur(int(10 * scale)))
    img = Image.alpha_composite(img, bar_glow)
    img = Image.alpha_composite(img, bars_img)

    return img

def main():
    assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets"))
    os.makedirs(assets_dir, exist_ok=True)
    print(f"Generating assets into: {assets_dir}")

    # Generate 1024 master icon
    print("Rendering 1024x1024 Master Icon...")
    icon_1024 = render_master_icon(1024)
    icon_1024.save(os.path.join(assets_dir, "icon-1024.png"), "PNG")

    # Generate multi-scale PNGs
    scales = [512, 256, 128, 64, 32]
    ico_images = []

    for s in scales:
        resized = icon_1024.resize((s, s), Image.Resampling.LANCZOS)
        resized.save(os.path.join(assets_dir, f"icon-{s}.png"), "PNG")
        if s == 512:
            resized.save(os.path.join(assets_dir, "icon.png"), "PNG")
        if s == 256:
            resized.save(os.path.join(assets_dir, "app-icon.png"), "PNG")

    # For ICO file: standard icon sizes (16, 24, 32, 48, 64, 128, 256)
    ico_sizes = [256, 128, 64, 48, 32, 24, 16]
    for s in ico_sizes:
        ico_images.append(icon_1024.resize((s, s), Image.Resampling.LANCZOS))

    ico_path = os.path.join(assets_dir, "icon.ico")
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[1:]
    )
    print(f"Generated multi-resolution Windows ICO: {ico_path}")

    # Verify generated files
    files = os.listdir(assets_dir)
    print("Assets directory contents:")
    for f in sorted(files):
        size_kb = os.path.getsize(os.path.join(assets_dir, f)) / 1024.0
        print(f"  - {f} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    main()
