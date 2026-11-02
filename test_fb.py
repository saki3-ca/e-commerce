import urllib.request
import re

for u in [
    'https://mbasic.facebook.com/people/Masfeeh/61596179578624/?sk=photos',
    'https://m.facebook.com/people/Masfeeh/61596179578624/?sk=photos',
    'https://www.facebook.com/61596179578624'
]:
    try:
        req = urllib.request.Request(
            u,
            headers={
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
            }
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            data = res.read().decode('utf-8', errors='ignore')
            print(u, 'Status: OK, Length:', len(data))
            links = re.findall(r'https://[^\s"\'<>]+\.fbcdn\.net/[^\s"\'<>]+', data)
            print('CDN links found:', len(links))
            for l in list(set(links))[:5]:
                print('  ', l)
    except Exception as e:
        print(u, 'Failed:', e)
