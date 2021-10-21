---
date: 'Fri Feb 15 2019 14:40:00 GMT+0530 (India Standard Time)'
title: 'Migrating from Github Pages to Netlify :: Some Gotchas'
tags:
  - blogging
  - jekyll
---


I have been hearing lots of good things about [Netlify](https://www.netlify.com/) for quite some time, but I didn’t consider migrating to it because, “If it ain't broke, don't fix it”. Github pages was serving me quite well until recently, when I wanted to add archive pages for tags. I found [jekyll-archives](https://jekyll.github.io/jekyll-archives/), a Jekyll plugin unsupported by Github pages that does the job perfectly, and that’s what made me migrate to Netlify. As of now this site is published on Netlify, and I must tell you, it’s far better than what I expected. It has more than enough configurability, while making the process as seamless as possible. 

I wanted to write this post because there are a few gotchas that you need to keep in mind to migrate your Github pages website successfully. These might not be that apparent when you just follow the wizard at Netlify, it most certainly wasn’t for me.

- You have to have the following configuration options in your `_config.yaml` file.

  ```yaml
  timezone: Asia/Kolkata
  url: https://sumit-ghosh.com
  baseurl: ''
  ```

  Without the `timezone` option, the deployment server will use its native time zone, which can have unintended consequences. For example, A post with date _15-02-2019_ will get published when it’s that date in the server’s native time zone, not yours.

  As for the `url` and `baseurl` options, you can get by without having them when you’re using Github pages to deploy, because Github pages automatically populates those from your `CNAME` file. But when you’re using Netlify, you have to specify them manually.

- Set `JEKYLL_ENV=production` as an environment variable for the build environment. Check [this](https://www.netlify.com/docs/continuous-deployment/#build-environment-variables) page for instructions on how to do that. Again, Github pages takes care of this automatically, but you have to do it manually in Netlify. Without having this, your site will behave as if it was deployed locally, and will not include stuff like Google analytics tracking code and Disqus integration.

- If you don’t want https://username.github.io to redirect to your custom domain, delete the `CNAME` file.

It’s important to note that I was using the [Minima](https://github.com/jekyll/minima) theme. You might need to make some more adjustments if you’re using any other fancier theme.
