---
title: All about Proxy Settings
tags:
- Linux
- Windows
---

Those of you who have worked with Internet behind some proxy server, maybe in your university or office, you most likely know what a pain proxy settings can be. For normal browsing it's okay, in most cases you just have to go to the browser setting and configure the proxy. But the real problem begins when you try to use command-line tools or like behind proxy. Most of them seem to be not aware of the system proxy settings at all! They want to be special and require you to configure their settings seperately. You may say, that's not that much of a problem, I will just configure the settings for the apps I use, then I'm done. What's the big deal with that? Well, you're right, but it will become a deal when you have to switch between a proxied and a non-proxied internet often. And that is the case for most. As I mentioned, usually the internet in the workplaces and schools are proxied, mainly to monitor internet usages (Incognito tab can't save you here!), and the connection in the homes are generally proxy-free. So, you'll have to change all of your proxy settings at least twice a day, most probably many more times! Usually this process involves some Google searches too, so it can become frustrating. So in this post, I will try to cover all the different scenarios of proxy configuration we generally confront. To be honest, part of why I'm writing this post is having a note for myself, as I am too a victim of this proxy-trouble.

After I get into the nitty-gritty details of it, I would share a secret open-source tool I use to ease all these pain (it's not really a secret xD). It's called [ProxyMan](https://github.com/himanshub16/ProxyMan). It's for Linux systems, and supports configuring proxy for a lot of commonly used tools. [It's on Github here](https://github.com/himanshub16/ProxyMan), go check it out! Maybe make some pull-requests too, as it could really use some right now. 

# Linux

## System-wide Settings - Environment Variables

As you probably know, environment variables are some "key-value" pairs that are used by the linux OS and various applications as configurations. The system-wide proxy setting in Linux is also configured using environment variables, in particular you'll have to configure the following environment variables - 

- `HTTP_PROXY`, `http_proxy`
- `HTTPS_PROXY` `https_proxy`
- `FTP_PROXY`, `ftp_proxy`
- `AUTO_PROXY`, `auto_proxy`
- `NO_PROXY`, `no_proxy`

You may be wondering why have I written the same name twice, once in small letters and the second time in caps. The reason for this is, sometimes some programs only read the environment variable with a specific case, and so it's crucial that we configure both to ensure robustness.

Set them with set command. And with unset command.
```bash
export HTTP_PROXY="http://username:password@proxyserver.com:port"
```

You can set proxy temporarily for a single shell session only using the `set` command, as shown below
```console
set HTTP_PROXY="http://username:password@proxyserver.com:port"
``` 

This only sets the environment variable for this shell and the processes that spawn from it, i.e it's subprocesses. Actually, the `set` command doesn't set environemtn variables at all, it sets bash variables. to get a detailed analysis of how do these work, check out [this article on DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-read-and-set-environmental-and-shell-variables-on-a-linux-vps), which goes on length about the difference between shell variables and environement variables and the differnert ways enviornemnt variables get loaded into the system. I will provide a short and concise gist below for quick reference.

/etc/bash.bashrc
.bashrc
/etc/profile - All users
~/.bash_profile - User specific bash profile
/etc/environment - Requires re-login

## Application-level settings

### Yum

`/etc/yum.conf` -> `proxy=http://:`

### Git

To set proxy
```console
git config --global http.proxy http://proxyuser:proxypwd@proxy.server.com:8080
```
To remove proxy settings
```console
git config --global --unset http.proxy
```
To check current proxy configuration
```console
git config --global --get http.proxy
```

