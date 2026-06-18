import os
from PIL import Image

def split_hanoi_mascot_for_gender(gender):
    if gender == 'male':
        input_path = "public/assets/images/hanoi/mascot/mascot_sheet.png"
    else:
        input_path = "public/assets/images/hanoi/mascot/mascot_sheet_female.png"
        
    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} not found.")
        return False
        
    img = Image.open(input_path).convert('RGBA')
    img_w, img_h = img.size
    
    # Grid parameters
    frame_w = 170
    frame_h = 204
    cols = 6
    rows = 5
    
    # We want to map each row of the grid to the corresponding action file
    actions = ['stand', 'run', 'slip', 'fly', 'beaten']
    
    # Background color to make transparent: (254, 254, 254)
    # We use floodfill starting from the boundaries of each frame cell
    def remove_bg(cell):
        w, h = cell.size
        pixels = cell.load()
        visited = set()
        queue = []
        
        # Add boundary pixels
        for x in range(w):
            queue.append((x, 0))
            queue.append((x, h - 1))
        for y in range(h):
            queue.append((0, y))
            queue.append((w - 1, y))
            
        bg_color = (254, 254, 254)
        threshold = 30.0
        
        while queue:
            x, y = queue.pop(0)
            if (x, y) in visited:
                continue
            visited.add((x, y))
            
            curr = pixels[x, y]
            # Calculate distance to background color
            dist = sum((a - b) ** 2 for a, b in zip(curr[:3], bg_color)) ** 0.5
            if dist < threshold:
                # Set transparent
                pixels[x, y] = (0, 0, 0, 0)
                # Neighbors
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        if (nx, ny) not in visited:
                            queue.append((nx, ny))
        return cell

    for row_idx, action in enumerate(actions):
        # Create a new sheet for this action: 6 frames of 170x204 = 1020x204
        action_sheet = Image.new('RGBA', (frame_w * cols, frame_h), (0, 0, 0, 0))
        
        for col_idx in range(cols):
            # If action is 'fly', we only have 2 source frames, so tile them: 0, 1, 0, 1, 0, 1
            src_col_idx = col_idx
            if action == 'fly':
                src_col_idx = col_idx % 2

            # Check if this cell is inactive (empty in the sheet)
            is_empty = False
            if action == 'slip' and col_idx >= 4:
                is_empty = True
                
            if is_empty:
                cell_transparent = Image.new('RGBA', (frame_w, frame_h), (0, 0, 0, 0))
            else:
                x0 = src_col_idx * frame_w
                y0 = row_idx * frame_h
                x1 = x0 + frame_w
                y1 = y0 + frame_h
                
                cell = img.crop((x0, y0, x1, y1))
                cell_transparent = remove_bg(cell)
            
            # Paste into action sheet
            action_sheet.paste(cell_transparent, (col_idx * frame_w, 0))
            
        out_path = f"public/assets/characters/player_{gender}_{action}.png"
        action_sheet.save(out_path)
        print(f"Saved {gender} {action}: {out_path}")
        
    return True

if __name__ == "__main__":
    split_hanoi_mascot_for_gender('male')
    split_hanoi_mascot_for_gender('female')
