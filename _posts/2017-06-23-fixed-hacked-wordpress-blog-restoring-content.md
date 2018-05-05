---
date: 'Fri Jun 23 2017 21:10:42 GMT+0530 (India Standard Time)'
title: 'How I fixed My Hacked WordPress Blog: Restoring the Content'
tags:
  - WordPress
  - SysAdmin
---

I made my blog [Techkernel](https://techkernel.org) quite some time back, but I never took it seriously. I made a very small number of posts, and never bothered to maintain the blog properly. I just moderated the comments, never bothering to reply them (I know, I'm a terrible person). I also did not updated the plugins, neither WordPress itself. But I realised my mistake when my blog got hacked and the most popular post of it got replaced by some crappy advertisement.

![Hacked Post](/images/posts/hacked-post.png)

Here I will document what I did to get it fixed to as it was before.


## Restoring the Original Post

Firstly, I needed to restore the post. WordPress keeps a revisions list of posts, so I looked there. But not so surprisingly, the original revision was removed. The oldest revision I could get was, sadly, the advertisement, not my original post. So this approach was not going to work.

![Revisions](/images/posts/revisions.png)

Second step was to look for any backups I made. I did not set up any solid backup system, so the only backup I could've made was as an export file (for your reference, WordPress lets you export all your contents as an `.xml` file). I searched for any file whose name contains `techkernel` in my PC, and voila, there was one. I was lucky. Had I not made such a backup (which I did for the keks, not anticipating a situation such as this), I would have to restore it from a backup image of my server at Digital Ocean, which would be much more painful to do.

So I opened up the export file `techkernel.wordpress.2016-04-22.xml`, looked for my post in there, and copy pasted it back to my blog.

![Posts](/images/posts/post-xml.png)


## Updating the WordPress Site

I use [WP-CLI](https://wp-cli.org/) in my WordPress installation, and it's fantastic. You should also start using it right away if you are not already not doing that.


### Updating WordPress, its plugins and themes

The first thing I did was update WordPress, all installed plugins and themes to the latest version. I did this using WP-CLI.

Updating WordPress core.

```console
skulltech@debian-512mb-blr1-01:/var/www/techkernel.org/public$ wp core update
Updating to version 4.8 (en_US)...
Downloading update from https://downloads.wordpress.org/release/wordpress-4.8-no-content.zip...
Unpacking the update...
Cleaning up files...
No files found that need cleaned up.
Success: WordPress updated successfully.
skulltech@debian-512mb-blr1-01:/var/www/techkernel.org/public$
```


Updating all WordPress plugins.

```console
skulltech@debian-512mb-blr1-01:/var/www/techkernel.org/public$ wp plugin update --all
Enabling Maintenance mode...
Downloading update from https://downloads.wordpress.org/plugin/akismet.3.3.2.zip...
Unpacking the update...
Installing the latest version...
Removing the old version of the plugin...
Plugin updated successfully.
Downloading update from https://downloads.wordpress.org/plugin/jetpack.5.0.zip...
Unpacking the update...
Installing the latest version...
Removing the old version of the plugin...
Plugin updated successfully.
Downloading update from https://downloads.wordpress.org/plugin/wordpress-seo.4.9.zip...
Unpacking the update...
Installing the latest version...
Removing the old version of the plugin...
Plugin updated successfully.
Disabling Maintenance mode...
+---------------+-------------+-------------+---------+
| name          | old_version | new_version | status |
+---------------+-------------+-------------+---------+
| akismet       | 3.2         | 3.3.2       | Updated |
| jetpack       | 4.5         | 5.0         | Updated |
| wordpress-seo | 4.1         | 4.9         | Updated |
+---------------+-------------+-------------+---------+
Success: Updated 3 of 3 plugins.
```


Updating all Wordpress themes.

```console
skulltech@debian-512mb-blr1-01:/var/www/techkernel.org/public$ wp theme update --all
Enabling Maintenance mode...
Downloading update from https://downloads.wordpress.org/theme/twentyfifteen.1.8.zip...
Unpacking the update...
Installing the latest version...
Removing the old version of the theme...
Theme updated successfully.
Downloading update from https://downloads.wordpress.org/theme/twentyseventeen.1.3.zip...
Unpacking the update...
Installing the latest version...
Removing the old version of the theme...
Theme updated successfully.
Disabling Maintenance mode...
+-----------------+-------------+-------------+---------+
| name            | old_version | new_version | status |
+-----------------+-------------+-------------+---------+
| twentyfifteen   | 1.7         | 1.8         | Updated |
| twentyseventeen | 1.1         | 1.3         | Updated |
+-----------------+-------------+-------------+---------+
Success: Updated 2 of 2 themes.
``` 
    

### Resetting Passwords

After that what I did was resetting all the passwords: password of the Wordpress installation, password of the user accounts of the DigitalOcean Droplet and so on.


## The Next Steps

The next steps were obviously, removing any backdoor the hackers may have left and securing the site. I will write a post on that shortly, so stay tuned!
