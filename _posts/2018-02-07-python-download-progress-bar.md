---
layout: post
comments: true
date: 'Wed Feb 07 2018 22:25:00 GMT+0530 (India Standard Time)'
title: Downloading file with progress bar in Python
tags:
  - Python
  - Coding
published: true
-----

Below is a Python function I recently wrote which downloads a file from a remote URL, and shows a progress bar while doing it. Here's the [code](https://gist.github.com/SkullTech/4510a5613c9aae89105fd1b6c424d0a0)

{% gist 4510a5613c9aae89105fd1b6c424d0a0 %}

Here's a little demo of it in action.

```console
$ python3 demo.py
[*] Downloading test file of size 100 MB...
[█████.............................................]
```

The contents of `demo.py` file being

```python
from dl import download


print('[*] Downloading test file of size 100 MB...')
download('https://speed.hetzner.de/100MB.bin', '100MB.bin')
print('[*] Done!')
```

Pretty neat right? Hope this comes in useful for you. Till next time.
