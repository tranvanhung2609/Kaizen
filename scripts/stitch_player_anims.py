import os
import numpy as np
from PIL import Image

def stitch_character(gender):
    print(f"Stitching mascot animations for {gender.upper()} with auto-centering...")
    
    # Grid sizes for standard spritesheet
    frame_w = 170
    frame_h = 204
    cols = 6
    rows = 5
    
    # Create empty transparent canvas: 1024x1024
    combined = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    
    # Row order matching PreloadScene.ts animation mapping:
    # Row 0: Idle/Stand
    # Row 1: Run
    # Row 2: Slip (crouch / jump / slide)
    # Row 3: Fly
    # Row 4: Beaten/Hit
    actions = ['stand', 'run', 'slip', 'fly', 'beaten']
    
    for row_idx, action in enumerate(actions):
        filepath = f"public/assets/characters/player_{gender}_{action}.png"
        if not os.path.exists(filepath):
            print(f"Error: File not found: {filepath}")
            return False
            
        action_img = Image.open(filepath).convert('RGBA')
        img_w, img_h = action_img.size
        
        print(f"  - Action '{action}': source size = {img_w}x{img_h}")
        
        # Calculate column width based on image width and number of columns
        col_width_float = img_w / cols
        
        for col_idx in range(cols):
            # Equal partition boundaries
            x0 = int(col_idx * col_width_float)
            x1 = int((col_idx + 1) * col_width_float)
            y0 = 0
            y1 = img_h
            
            # Crop the cell from the source sheet
            cell = action_img.crop((x0, y0, x1, y1))
            
            # Find non-transparent bounding box within the cropped cell
            cell_data = np.array(cell)
            alpha = cell_data[:, :, 3]
            nonzero = np.argwhere(alpha > 0)
            
            if len(nonzero) > 0:
                y_min, x_min = nonzero.min(axis=0)
                y_max, x_max = nonzero.max(axis=0)
                
                # Crop the tight bounding box of the character
                char_crop = cell.crop((x_min, y_min, x_max + 1, y_max + 1))
                char_w = x_max - x_min + 1
                char_h = y_max - y_min + 1
                
                # Center horizontally inside the 170px destination cell
                x_dest = col_idx * frame_w + (frame_w - char_w) // 2
                
                # Align to the bottom of the 204px destination cell
                y_dest = row_idx * frame_h + (frame_h - char_h)
                
                combined.paste(char_crop, (x_dest, y_dest))
            else:
                print(f"    Warning: Frame {col_idx} in '{action}' is completely transparent")

    out_path = f"public/assets/characters/player_{gender}.png"
    combined.save(out_path)
    print(f"Successfully saved centered combined spritesheet to: {out_path}\n")
    return True

if __name__ == "__main__":
    success_male = stitch_character('male')
    success_female = stitch_character('female')
    if success_male and success_female:
        print("All mascot animations stitched and centered successfully!")
    else:
        print("An error occurred during spritesheet composites.")
