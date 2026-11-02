import json

with open('server/data/db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Update photos with lookbook cropped assets
for p in db['products']:
    if p['id'] == 'prod-1':
        p['image'] = '/assets/lookbook_1_fiom.jpg'
        p['images'] = ['/assets/lookbook_1_fiom.jpg', '/assets/bag_video_clean.jpg']
    elif p['id'] == 'prod-2':
        p['image'] = '/assets/lookbook_2_clover.jpg'
        p['images'] = ['/assets/lookbook_2_clover.jpg', '/assets/bag_clover.jpg']
    elif p['id'] == 'prod-3':
        p['image'] = '/assets/lookbook_3_chocolate.jpg'
        p['images'] = ['/assets/lookbook_3_chocolate.jpg', '/assets/bag_brown_solid.jpg']
    elif p['id'] == 'prod-4':
        p['image'] = '/assets/lookbook_5_gold_crest.jpg'
        p['images'] = ['/assets/lookbook_5_gold_crest.jpg', '/assets/bag_monogram_gold.jpg']
    elif p['id'] == 'prod-1793647152080-757':
        p['image'] = '/assets/lookbook_4_handbag.jpg'
        p['images'] = ['/assets/lookbook_4_handbag.jpg', '/assets/brand_artwork.jpg']

# Also add facebook page URL to settings
db['settings']['facebookUrl'] = 'https://www.facebook.com/people/Masfeeh/61596179578624/?sk=photos'

with open('server/data/db.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print('Updated db.json with clean lookbook photos and Facebook URL!')
