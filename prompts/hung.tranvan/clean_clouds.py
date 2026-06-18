"""
VTI KAIZEN JOURNEY - IMAGE CLEANUP & ART ASSETS SPECIFICATION
============================================================
Tệp tin này chứa:
1. Kịch bản Python tự động xóa nền màu tối/checkerboard giả lập từ ảnh tải về.
2. Bộ hướng dẫn và Prompt tạo ảnh bằng Stitch / Midjourney sạch nền cho game 2D.

Được phát triển cho: hung.tranvan
"""

import os
from PIL import Image

def clean_image_background(
    input_path: str,
    output_path: str,
    r_threshold: int = 90,
    g_threshold: int = 90,
    b_threshold: int = 100
):
    """
    Hàm tự động lọc bỏ nền màu tối / checkerboard màu xanh đen giả lập từ ảnh gốc,
    giúp tạo ảnh trong suốt (transparent) hoàn toàn phục vụ làm mây/vật phẩm game.
    """
    if not os.path.exists(input_path):
        print(f"Error: File không tồn tại tại {input_path}")
        return

    # Mở ảnh và chuyển sang hệ RGBA
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    removed_count = 0
    kept_count = 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0:
                # Nếu màu nằm trong ngưỡng màu nền tối (ví dụ xanh đen: r < 90, g < 90, b < 100)
                if r < r_threshold and g < g_threshold and b < b_threshold:
                    pixels[x, y] = (0, 0, 0, 0)  # Chuyển thành trong suốt hoàn toàn
                    removed_count += 1
                else:
                    kept_count += 1

    # Lưu lại ảnh mới
    img.save(output_path, "PNG")
    print(f"Xử lý hoàn tất!")
    print(f"- Đã loại bỏ: {removed_count} điểm ảnh nền tối.")
    print(f"- Đã giữ lại: {kept_count} điểm ảnh vật thể.")
    print(f"- Tệp mới lưu tại: {output_path}")


# ==============================================================================
# HƯỚNG DẪN PROMPT SINH ẢNH GAME 2D SẠCH NỀN (STITCH / MIDJOURNEY / DALL-E)
# ==============================================================================
"""
Để tránh việc ảnh sinh ra bị dính nền giả (Checkerboard) hoặc dính viền răng cưa đen trắng,
hãy áp dụng các cấu trúc Prompt chuyên dụng cho Game Asset dưới đây:

1. HƯỚNG DẪN THIẾT LẬP NỀN (BACKGROUND SPECIFICATION)
------------------------------------------------------
*   Khuyến khích sinh ảnh trên nền trắng tinh khiết hoặc nền đen thuần túy để dễ tách bằng phần mềm:
    - Thêm vào prompt: "isolated on a clean solid white background, 2d vector art"
    - Hoặc: "flat colors, isolated on solid white background, no gradients, no shadows"
*   TUYỆT ĐỐI KHÔNG dùng từ khóa "transparent background" hoặc "png transparent" trong prompt chính
    vì AI thường hiểu nhầm và vẽ trực tiếp lưới ô vuông màu xám trắng (checkerboard) vào ảnh.

2. BỘ PROMPT MẪU (RECOMMENDED PROMPTS)
--------------------------------------
*   Tạo Mây Hà Nội (Hanoi Peach/Golden Clouds):
    "Beautiful stylized floating clouds, peach and golden yellow color palette, premium semi-flat 2d runner game art, clean outlines, smooth shading, high contrast, isolated on a solid white background, no shadows, game asset --v 6.0"

*   Tạo Kẻ địch (Bug Enemy):
    "A cute mechanical cyber bug enemy, side scrolling 2d view, vibrant cyan and magenta lights, solid flat colors, thick dark outlines, isolated on a solid white background, game sprite asset --v 6.0"

*   Tạo Boss Deadline:
    "Cyberpunk style digital clock boss monster, glowing red numbers, dark metallic gear body, premium 2d arcade style, thick clean outlines, isolated on solid white background, game asset --v 6.0"

3. TIỂU CẢNH VÀ HIỆU ỨNG TÁCH NỀN BẰNG PYTHON (NỀN TRẮNG)
----------------------------------------------------------
Nếu bạn sinh ảnh trên nền trắng thuần (solid white background), bạn có thể dùng hàm dưới đây
trong Python để chuyển màu trắng tinh thành trong suốt hoàn toàn:

def remove_white_background(img_path, output_path):
    img = Image.open(img_path).convert("RGBA")
    pixels = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            # Nếu màu là màu trắng tinh hoặc rất gần trắng (ví dụ > 250 ở cả 3 kênh)
            if r > 250 and g > 250 and b > 250:
                pixels[x, y] = (0, 0, 0, 0)
    img.save(output_path, "PNG")
"""


# Ví dụ chạy thử trực tiếp trên mây Hà Nội
if __name__ == "__main__":
    hanoi_clouds_path = r"c:\Users\hungt\Downloads\kaizen-journey-docs-update-core-gameplay\public\assets\backgrounds\hanoi_v2\clouds_floating.png"
    print("--- Đang khởi chạy quy trình xử lý nền mây ---")
    clean_image_background(hanoi_clouds_path, hanoi_clouds_path)
