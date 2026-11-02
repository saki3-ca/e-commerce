import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1920, 720
img = Image.new('RGB', (W, H), color='#191514')
draw = ImageDraw.Draw(img)

# 1. Warm radial luxury gradient
for y in range(H):
    ratio = y / H
    r = int(24 + (38 - 24) * ratio)
    g = int(20 + (30 - 20) * ratio)
    b = int(18 + (26 - 18) * ratio)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Ambient warm gold glow
glow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)
glow_draw.ellipse([50, -50, 850, 750], fill=(212, 175, 55, 30))
glow_draw.ellipse([1150, 80, 1900, 700], fill=(230, 184, 162, 35))
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(70))
img.paste(glow_layer, (0, 0), glow_layer)

# 2. Golden frame border
draw.rectangle([25, 25, W - 25, H - 25], outline=(197, 155, 39), width=2)
draw.rectangle([32, 32, W - 32, H - 32], outline=(75, 62, 54), width=1)

# Corner accents
corner_len = 45
corners = [
    (25, 25, 25 + corner_len, 25, 25, 25 + corner_len),
    (W - 25, 25, W - 25 - corner_len, 25, W - 25, 25 + corner_len),
    (25, H - 25, 25 + corner_len, H - 25, 25, H - 25 - corner_len),
    (W - 25, H - 25, W - 25 - corner_len, H - 25, W - 25, H - 25 - corner_len)
]
for c in corners:
    draw.line([(c[0], c[1]), (c[2], c[3])], fill=(212, 175, 55), width=4)
    draw.line([(c[0], c[1]), (c[4], c[5])], fill=(212, 175, 55), width=4)

# 3. Paste Brand Artwork on the Left
brand_art_path = 'client/public/assets/brand_artwork.jpg'
if os.path.exists(brand_art_path):
    brand_art = Image.open(brand_art_path).convert('RGBA')
    art_size = 530
    brand_art = brand_art.resize((art_size, art_size), Image.Resampling.LANCZOS)
    
    mask = Image.new('L', (art_size, art_size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, art_size, art_size], radius=28, fill=255)
    
    border_bg = Image.new('RGBA', (art_size + 12, art_size + 12), (212, 175, 55, 240))
    border_mask = Image.new('L', (art_size + 12, art_size + 12), 0)
    ImageDraw.Draw(border_mask).rounded_rectangle([0, 0, art_size + 12, art_size + 12], radius=32, fill=255)
    
    img.paste(border_bg, (90 - 6, 95 - 6), border_mask)
    img.paste(brand_art, (90, 95), mask)

# 4. Paste Products on the Right
bag1_path = 'client/public/assets/lookbook_1_fiom.jpg'
if os.path.exists(bag1_path):
    b1 = Image.open(bag1_path).convert('RGBA')
    b1 = b1.resize((370, 440), Image.Resampling.LANCZOS)
    b1_mask = Image.new('L', (370, 440), 0)
    ImageDraw.Draw(b1_mask).rounded_rectangle([0, 0, 370, 440], radius=20, fill=255)
    b1_border = Image.new('RGBA', (380, 450), (212, 175, 55, 220))
    b1_bmask = Image.new('L', (380, 450), 0)
    ImageDraw.Draw(b1_bmask).rounded_rectangle([0, 0, 380, 450], radius=24, fill=255)
    img.paste(b1_border, (1485, 135), b1_bmask)
    img.paste(b1, (1490, 140), b1_mask)

bag2_path = 'client/public/assets/lookbook_2_clover.jpg'
if os.path.exists(bag2_path):
    b2 = Image.open(bag2_path).convert('RGBA')
    b2 = b2.resize((320, 320), Image.Resampling.LANCZOS)
    b2_mask = Image.new('L', (320, 320), 0)
    ImageDraw.Draw(b2_mask).rounded_rectangle([0, 0, 320, 320], radius=18, fill=255)
    b2_border = Image.new('RGBA', (330, 330), (230, 184, 162, 220))
    b2_bmask = Image.new('L', (330, 330), 0)
    ImageDraw.Draw(b2_bmask).rounded_rectangle([0, 0, 330, 330], radius=22, fill=255)
    img.paste(b2_border, (1235, 255), b2_bmask)
    img.paste(b2, (1240, 260), b2_mask)

# 5. Clean Typography
font_title = None
font_sub = None
font_body = None
font_small = None
font_tiny = None

for font_name in ['georgia.ttf', 'times.ttf', 'arial.ttf']:
    try:
        font_title = ImageFont.truetype(font_name, 68)
        font_sub = ImageFont.truetype(font_name, 22)
        font_body = ImageFont.truetype(font_name, 26)
        font_small = ImageFont.truetype(font_name, 19)
        font_tiny = ImageFont.truetype(font_name, 16)
        break
    except:
        pass

if not font_title:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_body = ImageFont.load_default()
    font_small = ImageFont.load_default()
    font_tiny = ImageFont.load_default()

# Header Badge
draw.rounded_rectangle([660, 115, 960, 145], radius=15, fill=(45, 38, 34), outline=(197, 155, 39))
draw.text((680, 122), "PREMIUM BOUTIQUE 2026", fill=(212, 175, 55), font=font_tiny)

# Main Brand Name
draw.text((660, 160), "Masfeeh", fill=(255, 250, 245), font=font_title)

# Tagline
draw.text((660, 250), "A C C E S S O R I Z E   Y O U R   W O R L D", fill=(230, 200, 156), font=font_sub)

# Slogan
draw.text((660, 300), "Little Things... Big Happiness", fill=(255, 225, 185), font=font_body)

# Narrative Quotes
draw.text((660, 355), "\"We believe in premium, authentic & timeless beauty.", fill=(215, 205, 200), font=font_small)
draw.text((660, 385), "Every detail matters. Every choice reflects elegance.\"", fill=(215, 205, 200), font=font_small)

# Category Badges (No missing glyphs)
cat_y = 440
categories = [
    "Bags (Dual Belt Included)",
    "Hair Accessories",
    "Fake Nails",
    "Rings & Jewelry",
    "Bangles & More"
]

cat_x = 660
for cat in categories:
    w = 230 if len(cat) > 15 else 180
    draw.rounded_rectangle([cat_x, cat_y, cat_x + w, cat_y + 38], radius=8, fill=(35, 30, 28), outline=(212, 175, 55))
    draw.text((cat_x + 14, cat_y + 10), cat, fill=(240, 230, 220), font=font_tiny)
    cat_x += w + 14
    if cat_x > 1180:
        cat_x = 660
        cat_y += 48

# Trust Badges Bar
draw.line([(660, 560), (1450, 560)], fill=(75, 65, 60), width=1)
draw.text((660, 580), "* Fast Delivery All Over Bangladesh", fill=(212, 175, 55), font=font_tiny)
draw.text((1050, 580), "* Trusted Shop - Bashundhara R/A, Dhaka", fill=(212, 175, 55), font=font_tiny)
draw.text((660, 615), "* Hotline / WhatsApp: 01303-662891", fill=(235, 225, 215), font=font_tiny)
draw.text((1050, 615), "* Cash on Delivery & bKash Available", fill=(235, 225, 215), font=font_tiny)

dest_path = 'client/public/assets/banner_redesigned.jpg'
img.save(dest_path, quality=95)
print("Redesigned cover saved clean without glyph errors!")
