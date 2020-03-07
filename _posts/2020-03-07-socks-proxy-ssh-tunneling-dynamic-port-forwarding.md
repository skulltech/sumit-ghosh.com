---
date: 'Tue Mar 07 2020 06:40:00 GMT+0530 (India Standard Time)'
title: "Creating a SOCKS Proxy via SSH Tunneling with Dynamic Port Forwarding"
showcase: true
tags:
  - Sysadmin
  - Linux
  - Windows
  - SSH
---

I recently had to access some internal websites of my college from home, these websites are usually reachable only from the intranet. The computer science department does provide a [jump server](https://en.wikipedia.org/wiki/Jump_server) as a solution, which is basically a machine that sits in the intersection between the private intranet and the public Intranet, and acts as a gateway between the two. Students usually use this as an SSH jump point, and access other lab machines or the hpc server from their home through that.

Okay, so I can access machines in the intranet through SSH. But it wasn't apparent to me how I could use this jump server to access intranet _websites_ painlessly. I researched about this a little bit, and turns out there is a nifty solution that uses only SSH—no VPN software is needed on the jump server. It's called SSH tunneling with dynamic port forwarding. Basically, it redirects all of your Internet traffic through SSH to that remote machine, and in that way the remote machine acts as kind of a proxy server. Technically though, your local machine is the proxy server, a [SOCKS](https://en.wikipedia.org/wiki/SOCKS) proxy server to be exact, and you have to bind a port to that proxy service. Once the [SSH tunnel](https://www.ssh.com/ssh/tunneling) and the SOCKS proxy is set-up, all you gotta do is point your browser at it, and it should work! Well, not quite, there's a bit of a hiccup that we'll have to take care of, but we're getting ahead of ourselves. 

### SSH tunneling with dynamic port forwarding

The command for setting up the SSH tunnel required for a SOCKS proxy looks like the following ::

```console
sumit@HAL9000:~$ ssh -N -D 9000 username@hostname
```

That's it. You'll have a working SOCKS proxy at `127.0.0.1:9000` just by running that. Configure your browser's proxy settings, point it at the proxy server address, and all of your TCP traffic will be sent through that tunnel, into the intranet at `hostname`.

Only that I still couldn't access the internal website. It was clear that the proxy was working, at least to some extent, as [ifconfig.co](https://ifconfig.co/) was reporting that I was operating from `hostname`. After some investigation it was clear that the problem was with DNS. DNS requests don't get forwarded through the SOCKS server by default, and the subdomain I was trying to access was purely internal, so the browser couldn't resolve the domain name. 

### Enabling remote DNS through SOCKS in Firefox

- Go to the _Advanced Preferences_ page of Firefox by typing `about:config`	in the address bar.
- Search for the setting `network.proxy.socks_remote_dns` and turn it on.

That's it! It worked flawlessly after that.  

This post was just a quick one, for my own reference mostly. Hope it helped you too, to whatever extent that might be.