from collections import deque
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "assets" / "images" / "hanoi"
OUT = SRC / "generated"

def remove_white_background(cell: Image.Image, threshold: int = 34) -> Image.Image:
    """Remove JPEG sheet background from edges without eating bright VFX cores."""
    img = cell.convert("RGBA")
    pixels = img.load()
    width, height = img.size
    queue: deque[tuple[int, int]] = deque()
    seen: set[tuple[int, int]] = set()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen:
            continue
        seen.add((x, y))

        r, g, b, a = pixels[x, y]
        if a == 0:
            continue

        if abs(r - 255) <= threshold and abs(g - 255) <= threshold and abs(b - 255) <= threshold:
            pixels[x, y] = (255, 255, 255, 0)
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in seen:
                    queue.append((nx, ny))

    return img

def get_tight_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    """Find the bounding box of non-transparent and non-white pixels."""
    pixels = img.load()
    width, height = img.size
    min_x, min_y = width, height
    max_x, max_y = -1, -1
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            is_bg = (a < 10) or (abs(r - 255) <= 30 and abs(g - 255) <= 30 and abs(b - 255) <= 30)
            if not is_bg:
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
                
    if max_x == -1:
        return (0, 0, width, height)
    return (min_x, min_y, max_x, max_y)

def scale_to_fit(img: Image.Image, max_w: int, max_h: int) -> Image.Image:
    """Scale image down keeping aspect ratio if it exceeds max dimensions."""
    w, h = img.size
    ratio = min(max_w / w, max_h / h)
    if ratio < 1.0:
        new_w = int(w * ratio)
        new_h = int(h * ratio)
        return img.resize((new_w, new_h), Image.LANCZOS)
    return img

def save_strip(path: Path, frames: list[Image.Image], frame_width: int, frame_height: int) -> None:
    strip = Image.new("RGBA", (frame_width * len(frames), frame_height), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        strip.paste(frame, (i * frame_width, 0), frame)
    strip.save(path)
    print(f"saved {path.relative_to(ROOT)}")

def process_ground_bug(source_path: Path) -> None:
    """Ground bug sheet has a standard grid of cells with a Y offset of 1 row. We extract 8 walk frames and 2 death frames, scale them down."""
    sheet = Image.open(source_path).convert("RGBA")
    cell_size = 256
    
    # We want 8 walk frames (indices 0-7) and 2 death frames (indices 10-11)
    frames_to_extract = [0, 1, 2, 3, 4, 5, 6, 7, 10, 11]
    processed_frames = []
    
    for idx in frames_to_extract:
        col = idx % 4
        row = idx // 4
        
        # Crop with standard 256x256 grids and 5px padding, offset row by 1 (y=0 to 256 is blank padding)
        x0 = col * cell_size + 5
        x1 = (col + 1) * cell_size - 5
        y0 = (row + 1) * cell_size + 5
        y1 = (row + 2) * cell_size - 5
        
        cell = sheet.crop((x0, y0, x1, y1))
        
        # Erase the label number in the top-left (e.g. 50x50 area relative to cell)
        cell_pixels = cell.load()
        for ey in range(min(50, cell.height)):
            for ex in range(min(50, cell.width)):
                cell_pixels[ex, ey] = (255, 255, 255, 255)
                
        # Remove white background
        no_bg = remove_white_background(cell, threshold=34)
        
        # Get tight bounding box
        bx0, by0, bx1, by1 = get_tight_bbox(no_bg)
        tight = no_bg.crop((bx0, by0, bx1, by1))
        
        # Scale to fit nicely inside 128x128 (max size 108x108)
        scaled = scale_to_fit(tight, 108, 108)
        
        # Flip horizontally
        flipped = ImageOps.mirror(scaled)
        
        # Center horizontally and bottom-align inside 128x128 frame
        frame = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        fx = (128 - flipped.width) // 2
        fy = 128 - flipped.height
        frame.paste(flipped, (fx, fy), flipped)
        processed_frames.append(frame)
        
    save_strip(OUT / "ground_bug_walk.png", processed_frames[:8], 128, 128)
    save_strip(OUT / "ground_bug_death.png", processed_frames[8:], 128, 128)

def process_flying_bug(source_path: Path) -> None:
    """Flying bug sheet has custom layout: Row 0 has 3 fly sprites, Row 1 has 4 boxed sprites (2 fly, 2 death)."""
    sheet = Image.open(source_path).convert("RGBA")
    
    boxes = [
        (62, 78, 252, 268),
        (395, 125, 628, 259),
        (746, 76, 939, 297),
        (38, 413, 267, 610),
        (517, 413, 746, 610),
        (756, 413, 985, 610)
    ]
    
    processed_frames = []
    for box in boxes:
        cell = sheet.crop(box)
        no_bg = remove_white_background(cell, threshold=34)
        
        # Bbox
        bx0, by0, bx1, by1 = get_tight_bbox(no_bg)
        tight = no_bg.crop((bx0, by0, bx1, by1))
        
        # Scale to fit nicely inside 192x192 (max size 140x140)
        scaled = scale_to_fit(tight, 140, 140)
        
        # Flip horizontally
        flipped = ImageOps.mirror(scaled)
        
        # Center in 192x192 frame
        frame = Image.new("RGBA", (192, 192), (0, 0, 0, 0))
        fx = (192 - flipped.width) // 2
        fy = (192 - flipped.height) // 2
        frame.paste(flipped, (fx, fy), flipped)
        processed_frames.append(frame)
        
    save_strip(OUT / "flying_bug_fly.png", processed_frames[:4], 192, 192)
    save_strip(OUT / "flying_bug_death.png", processed_frames[4:], 192, 192)

def process_boss(source_path: Path) -> None:
    """Boss sheet has a 4x4 grid of 256x256 cells. We preserve alignment to keep the hover animation smooth."""
    sheet = Image.open(source_path).convert("RGBA")
    cell_size = 256
    
    processed_frames = []
    for idx in range(16):
        col = idx % 4
        row = idx // 4
        
        x0, y0 = col * cell_size + 5, row * cell_size + 5
        x1, y1 = (col + 1) * cell_size - 5, (row + 1) * cell_size - 5
        cell = sheet.crop((x0, y0, x1, y1))
        
        no_bg = remove_white_background(cell, threshold=34)
        
        frame = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        frame.paste(no_bg, (5, 5), no_bg)
        processed_frames.append(frame)
        
    save_strip(OUT / "boss_sheet.png", processed_frames, 256, 256)

def process_boss_projectile(source_path: Path) -> None:
    """Boss projectile is scaled down to fit 64x64 to make it sleeker."""
    sheet = Image.open(source_path).convert("RGBA")
    no_bg = remove_white_background(sheet, threshold=34)
    
    bx0, by0, bx1, by1 = get_tight_bbox(no_bg)
    tight = no_bg.crop((bx0, by0, bx1, by1))
    
    # Scale to fit 64x64
    scaled = scale_to_fit(tight, 64, 64)
    
    frame = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    fx = (128 - scaled.width) // 2
    fy = (128 - scaled.height) // 2
    frame.paste(scaled, (fx, fy), scaled)
    
    save_strip(OUT / "boss_projectiles_sheet.png", [frame], 128, 128)

def process_keyboard_projectiles(source_path: Path) -> None:
    """Keyboard projectiles are scaled to fit 120x60 (bullet) and 140x80 (explosion) inside 256x128 frames."""
    sheet = Image.open(source_path).convert("RGBA")
    cell_size = 512
    
    bullets = []
    explosions = []
    
    for r in range(2):
        for c in range(2):
            x0, y0 = c * cell_size + 10, r * cell_size + 10
            x1, y1 = (c + 1) * cell_size - 10, (r + 1) * cell_size - 10
            cell = sheet.crop((x0, y0, x1, y1))
            
            no_bg = remove_white_background(cell, threshold=34)
            bx0, by0, bx1, by1 = get_tight_bbox(no_bg)
            tight = no_bg.crop((bx0, by0, bx1, by1))
            
            if r == 0:
                # Bullet: Scale to max 120x60
                scaled = scale_to_fit(tight, 120, 60)
            else:
                # Explosion: Scale to max 140x80
                scaled = scale_to_fit(tight, 140, 80)
                
            frame = Image.new("RGBA", (256, 128), (0, 0, 0, 0))
            fx = (256 - scaled.width) // 2
            fy = (128 - scaled.height) // 2
            frame.paste(scaled, (fx, fy), scaled)
            
            if r == 0:
                bullets.append(frame)
            else:
                explosions.append(frame)
                
    save_strip(OUT / "keyboard_projectiles_sheet.png", bullets, 256, 128)
    save_strip(OUT / "keyboard_explosions_sheet.png", explosions, 256, 128)

def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    ground = SRC / "enemies" / "ground_bug_sheet.png"
    flying = SRC / "enemies" / "flying_bug_sheet.png"
    boss = SRC / "bosses" / "boss_sheet.png"
    boss_projectiles = SRC / "bosses" / "boss_projectiles_sheet.png"
    keyboard_projectiles = SRC / "items" / "keyboard_projectiles_sheet.png"

    print("Slicing ground bug...")
    process_ground_bug(ground)
    
    print("Slicing flying bug...")
    process_flying_bug(flying)
    
    print("Slicing boss...")
    process_boss(boss)
    
    print("Slicing boss projectile...")
    process_boss_projectile(boss_projectiles)
    
    print("Slicing keyboard projectiles...")
    process_keyboard_projectiles(keyboard_projectiles)

if __name__ == "__main__":
    main()
