---
title: Downloading File With Progress Bar in Python
date: Feb 07 2018
---

Below is a Python function I recently wrote which downloads a file from a remote URL, and shows a progress bar while doing it. Here's the [code](https://gist.github.com/SkullTech/4510a5613c9aae89105fd1b6c424d0a0) —

```python
import sys
import requests


def download(url, filename):
    with open(filename, 'wb') as f:
        response = requests.get(url, stream=True)
        total = response.headers.get('content-length')

        if total is None:
            f.write(response.content)
        else:
            downloaded = 0
            total = int(total)
            for data in response.iter_content(chunk_size=max(int(total/1000), 1024*1024)):
                downloaded += len(data)
                f.write(data)
                done = int(50*downloaded/total)
                sys.stdout.write('\r[{}{}]'.format('█' * done, '.' * (50-done)))
                sys.stdout.flush()
    sys.stdout.write('\n')

```

Here's a little demo of it in action —

```console
$ python3 demo.py
[*] Downloading test file of size 100 MB...
[█████.............................................]
```

The contents of `demo.py` file being —

```python
from dl import download


print('[*] Downloading test file of size 100 MB...')
download('https://speed.hetzner.de/100MB.bin', '100MB.bin')
print('[*] Done!')
```

Pretty neat right? Hope this comes in useful for you. Till next time.
