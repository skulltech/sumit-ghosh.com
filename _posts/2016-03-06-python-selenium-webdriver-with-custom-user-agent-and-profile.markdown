---
comments: true
date: 2016-03-06 15:55:52+00:00
title: Python - Starting Up Selenium Webdriver, with Custom User-Agent and Profile
gh-repo: SkullTech/webdriver-start
gh-badge: [star, watch, fork, follow]
tags:
- Programming
- Python
- Automation
- Selenium
- Github
---

I've been playing around with Selenium Webdriver in Python, and one of the most annoying thing I had to do again and again is looking up how to start a specific Webdriver with a custom user-agent or with a custom profile. So I decided to make this module which will take care of all the little inner workings involved while starting up a Webdriver.

[The code is here](https://github.com/SkullTech/webdriver-start) - https://github.com/SkullTech/webdriver-start

You'll just have to use the `start_webdriver` function, and it will do all the magic and return the required Webdriver.


### Example Usage

```python
import wdstart
driver = wdstart.start_webdriver(driver_name='Chrome', user_agent='Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19(KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19', profile_path='C:\Users\SkullTech\AppData\Local\Google\Chrome\User Data')
```

Although in most cases you won't have to worry about what's happening under the hood (they are not at all important and can be found out with a simple Google search), but still if you want you can read the code thoroughly and use part of it in your code.

Please leave a comment if this helped you or you've faced any problem. Thanks.
