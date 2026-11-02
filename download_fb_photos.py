import urllib.request
import re
import os
import html

os.makedirs('client/public/assets/fb_photos', exist_ok=True)

url = 'https://m.facebook.com/people/Masfeeh/61596179578624/?sk=photos'
req = urllib.request.Request(
    url,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.facebook.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    }
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        page_html = resp.read().decode('utf-8', errors='ignore')
        
        # Save page_html to inspect
        with open('fb_photos_page.html', 'w', encoding='utf-8') as f:
            f.write(page_html)

        # Regex search for all image links
        raw_urls = re.findall(r'https://scontent[^\s"\'<>&]+', page_html)
        urls = list(set([html.unescape(u).replace('&amp;', '&') for u in raw_urls]))
        print(f"Found {len(urls)} candidates in m.facebook.com")
        for u in urls:
            print("Candidate:", u[:100])
except Exception as e:
    print(f"Error: {e}")
