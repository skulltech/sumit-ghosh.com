The first step would be installing and setting-up LAMP stack on the Ubuntu machine(s). I will be using Linux Subsytem on Windows, just to give it a try.

## Setting up LAMP stack

Starting with [this step-by-step guide](https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu-16-04) by DigitalOcean.

Well, since this is only a POC, I decided not to go with a full-blown LAMP stack, instead just install the bare necessities (i.e. only Apache2).

### Tidbits about web-servers

When I was looking-up about which webserver to use, (some of the popular ones being Apache, Nginx, etc) I found a lot about the design specifics of these servers, and the pros and cons of them.

## Creating the VMs

I created 3 instances (droplets) of the most basic VM (Debian/ 512 Mb/ 20 GB) at DigitalOcean. Namely:

- debian-512mb-blr01-loadbalancer
- debian-512mb-blr01-server-01
- debian-512mb-blr01-server-02

We're going to configure the first one as the load-balancer, and the other two as the two actual servers, between which the load balancer will distribute the incoming requests.

### Common set-up for all the machines

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install apache2
```

After the initial setup is done, we can check if the the Apache installation is running as intended by running the following command to start the server, and then by navigating to the IP addresses of those VMs. If the setup is correct, the default Apache webpage would be shown at those IP addresses.

```
sudo service apache2 start
```

After that, I did some changes to the default Apache `index.html` of each of those droplets, so that it can be identified which one is served.

```
cd /var/www/html/
vim index.html
```

[Image here]

[Another Image here]

## Selecting the load-balancing solution

Although Apache itself can be configured to work as a load-balancer, I decided to go with HAProxy after researching about load-balancers on the internet, and here's some of the knowledge.

# Moving my Wordpress site to Jekyll

Here's what I did.

- Clone the `minimal-mistakes` repo files into my repo.
- Remove all the unnecessary files and folders.
- Add the CNAME file for domain-name.

After this, navigating to sumit-ghosh.com shows me the empty minimal-mistakes theme. [Picture here]

Now the next thing I had to do was import the posts from wordpress. There are multiple ways to do this, you can take a look at them by doing a quick google search, some of them are listed here -

- http://import.jekyllrb.com/docs/wordpress/
- http://import.jekyllrb.com/docs/wordpresscom/

The path I took was.

- Export the wordpress contents (posts + comments) to XML file.
- Convert the posts from that XML file to markdown format using this tool - https://github.com/thomasf/exitwp
- Paste the markdown files into my jekyll site folder.

After that, the posts were there in my jekyll site folder, but still most of the things were not working on the website. The posts were being shown on the home page, but the links to individual posts were broken. Also, inspecting a few markdown files, I saw that not everything was converted correctly, so now I'll have to edit every one of them a bit, to get them perfect. Also, I'll have to edit the the theme files correctly so that everything works. It will vary from theme to theme, so I'll go according to the docs of minimal-mistakes. When all the posts are shown correctly (including the images), I'll move on to importing comments from Disqus.
