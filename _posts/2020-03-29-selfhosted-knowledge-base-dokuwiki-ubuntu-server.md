---
date: 'Fri Mar 29 2020 15:00:00 GMT+0530 (India Standard Time)'
title: 'Selfhosted Knowledge Base :: Dokuwiki Setup on an Ubuntu Server'
showcase: true
tags:
  - Sysadmin
  - Linux
  - Selfhosted
---

### Install requirements

Our server needs two basic prerequisites for Dokuwiki: php, as Dokuwiki is a php application, and apache, because of obvious reasons. Dokuwiki doesn’t need any database, so we don’t need to install any. 

```terminal
$ sudo apt update
$ sudo apt upgrade
$ sudo apt install apache2 php libapache2-mod-php
```

### Download Dokuwiki

Download and extract the Dokuwiki tarball.

```terminal
$ wget https://download.dokuwiki.org/src/dokuwiki/dokuwiki-stable.tgz
$ tar -xvzf dokuwiki-stable.tgz 
```

Once it’s extracted, we need to copy the Dokuwiki files to a directory in `/var/www/`. I’m gonna name the directory `wiki.skghosh.me`, as that’s the domain name the wiki is going to be live on.

```console
$ mkdir /var/www/wiki.skghosh.me
$ ls
dokuwiki-2018-04-22b  dokuwiki-stable.tgz
$ cp -r dokuwiki-2018-04-22b/* /var/www/wiki.skghosh.me/
```

### Setting up Apache virtual host

We’re gonna create a copy of the default virtualhost configuration file and edit it according to our needs.

```console
[~]$ cd /etc/apache2/sites-available/
[/etc/apache2/sites-available]$ ls
000-default.conf  default-ssl.conf
[/etc/apache2/sites-available]$ cp 000-default.conf wiki.skghosh.me.conf
[/etc/apache2/sites-available]$ ls
000-default.conf  default-ssl.conf  wiki.skghosh.me.conf
[/etc/apache2/sites-available]$ nano wiki.skghosh.me.conf
```

After making the edits, here are the relevant, i.e. uncommented lines of my `wiki.skghosh.me.conf` file:

```apache
<VirtualHost *:80>
	ServerName wiki.skghosh.me
	
	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/wiki.skghosh.me

	<LocationMatch "/(data|conf|bin|inc|vendor)/">
		Order allow,deny
		Deny from all
		Satisfy All
	</LocationMatch>

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Notice the `LocationMatch` directive I’ve added. It’s an important security measure which makes sure that the internal files of Dokuwiki aren’t accessible from the public web. 

### Security and permissions

There are two aspects to securing and setting permissions for Dokuwiki. 

- Setting the proper file permissions so that Dokuwiki can access and write to files it needs. Without configuring this properly Dokuwiki can’t function.
- Making sure that the internal files of Dokuwiki aren’t accessible from the public web. We’ve already covered this in the last section.

The simplest way to set proper file permissions would be giving ownership of the website root directory to the apache user.

```console
$ sudo chown -R www-data:www-data /var/www/wiki.skghosh.me/
```

### Finalising apache configuration

Enabling the rewrite module is needed to make sure redirects work as intended. And of course, we need to disable the default virtual host and enable ours. 

```console
$ sudo a2enmod rewrite
$ sudo a2dissite 000-default
$ sudo a2ensite wiki.skghosh.me
$ sudo systemctl restart apache2
```

### Enabling https://

Once you’re sure that your Dokuwiki installation is working perfectly over http, you might want to switch to https. Enabling https is a breeze with Certbot, it utilises Let’s Encrypt as the CA and takes care of everything automagically.


```console
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt update
$ sudo apt install certbot python-certbot-apache
$ sudo certbot --apache -d wiki.skghosh.me
```
