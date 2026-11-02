import urllib.request
import re

url = 'https://www.facebook.com/people/Masfeeh/61596179578624/?sk=photos'
req = urllib.request.Request(
    url,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    }
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print(f"Fetched {len(content)} bytes")
        with open('fb_page.html', 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Look for image URLs
        cdn_urls = set(re.findall(r'https://[^\s"\'<>]+\.fbcdn\.net/[^\s"\'<>]+', content))
        print(f"Found {len(cdn_urls)} fbcdn URLs")
        for u in list(cdn_urls)[:15]:
            print(u)
except Exception as e:
    print(f"Error fetching URL: {e}")
