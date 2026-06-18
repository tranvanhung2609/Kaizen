import os
import numpy as np
from PIL import Image

def process_individual_action(gender, action):
    filepath = f"public/assets/characters/player_{gender}_{action}.png"
    if not os.path.exists(filepath):
        print(f"Error: File not found: {filepath}")
        return False
        
    img = Image.open(filepath).convert('RGBA')
    img_w, img_h = img.size
    
    # Destination dimensions per frame
    frame_w = 170
    frame_h = 204
    cols = 6
    
    # New image will be 1020 x 204 (6 frames of 170x204)
    processed = Image.new('RGBA', (frame_w * cols, frame_h), (0, 0, 0, 0))
    
    col_width_float = img_w / cols
    
    print(f"Processing '{gender}' - '{action}' ({img_w}x{img_h})...")
    
    for col_idx in range(cols):
        # Determine column boundaries in the raw source sheet
        x0 = int(col_idx * col_width_float)
        x1 = int((col_idx + 1) * col_width_float)
        
        # Crop the raw column
        cell = img.crop((x0, 0, x1, img_h))
        
        # Find non-transparent bounding box within the column crop
        cell_data = np.array(cell)
        alpha = cell_data[:, :, 3]
        nonzero = np.argwhere(alpha > 0)
        
        if len(nonzero) > 0:
            y_min, x_min = nonzero.min(axis=0)
            y_max, x_max = nonzero.max(axis=0)
            
            # Crop the character tightly
            char_crop = cell.crop((x_min, y_min, x_max + 1, y_max + 1))
            char_w = x_max - x_min + 1
            char_h = y_max - y_min + 1
            
            # Center horizontally inside the 170px frame
            x_dest = col_idx * frame_w + (frame_w - char_w) // 2
            
            # Bottom align inside the 204px frame
            y_dest = frame_h - char_h
            
            processed.paste(char_crop, (x_dest, y_dest))
        else:
            print(f"  Warning: Frame {col_idx} in '{action}' is completely transparent")
            
    # Save the processed image back over the original path
    processed.save(filepath)
    print(f"Successfully processed and overwrote: {filepath}\n")
    return True

if __name__ == "__main__":
    genders = ['male', 'female']
    actions = ['stand', 'run', 'slip', 'fly', 'beaten']
    
    all_success = True
    for gender in genders:
        for action in actions:
            success = process_individual_action(gender, action)
            if not success:
                all_success = False
                
    if all_success:
        print("All individual action files processed successfully!")
    else:
        print("Some errors occurred during processing.")
