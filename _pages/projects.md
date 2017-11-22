---
permalink: /portfolio/
layout: page
title: Projects
subtitle: My excuses for avoiding social interactions
comments: true
published: false

---

This is a collection of projects that I worked/working on. I will try to keep this updated to my best effort, but the most recent record of my activities would of be [my Github](https://github.com/SkullTech), of course.

## Currently working on

- [__Kumbu Functional Test Suite__](https://www.getkumbu.com/): Currently I'm writing an extensive test-suite for the digital memories platform [Kumbu](https://www.getkumbu.com/), using `py.test` and `Selenium` as the technology stack.


## Script cum CLI tool cum small libraries

I built most of these for small freelancing gigs that I did through [Upwork](https://www.upwork.com/o/profiles/users/_~01a22be6196dbef5c6/). The story of these projects goes like this - it started as a script, maybe a task that a client or I myself wanted to be automated. Later on, sometime when I was feeling bored, I cleaned it up, added CLI functionalites, and in some cases, made a `pip`-installable library! There are a quite a number of them, and it's very easy to lose track of it. So I thought I should maintain a list of such small-but-useful projects in a clean way.

- [__JSON-CSV Converter__](https://github.com/SkullTech/json-csv-converter): The name is quite self-explanatory. It's a small CLI tool which converts CSV to JSON or vice-versa. You can find it [here](https://github.com/SkullTech/json-csv-converter).

- [__eBayookworm__](https://github.com/SkullTech/eBay-textbooks): It lets you grab info of books available on eBay through the eBay API. The name is a very sad attempt at Portmanteau, apologies.

- [__DeathByCaptcha CLI__](https://github.com/SkullTech/DeathByCaptcha-CLI): A CLI client for the DeathByCaptcha API.

- [__IITD ProxyUsage__](https://github.com/SkullTech/iitd-proxyusage): A command-line tool for IIT Delhi folks. It let's them check their Internet usage data, without having to log into the proxy server's portal manually. Very handy in cases where you don't have access to a GUI, but you want to check how much of the data usage quota you've burned through.

- [__PyGmail__](https://github.com/SkullTech/py-gmail): It lets you send an email quickly and easily through the GMail API.

- [__Webdriver-Start__](https://sumit-ghosh.com/articles/python-selenium-webdriver-with-custom-user-agent-and-profile/): If you've made some stuff using Selenium Webdriver, you must know how annoying starting a webdriver with a specific `user-agent` or profile can be, because the procedure varies from driver to driver. So I decided to write this nice little module, which takes the headache away from you, letting you use the same and simple syntax for starting-up different webdrivers with various configurations. And what's more, it also comes as a `PyPI` package, letting you install it simply by running `pip install webdriver-start`!