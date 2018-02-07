Things needing implementation.

- RSS feed.
- SEO tags.
- Tagging system with auto-generated tags page.
- Sitemap.
- Disqus Comments.
- Google Analytics.

## RSS (atom) feed

Auto Atom feed generation can be done using the `jekyll-feed` plugin. It is already included in the `github-pages` gem, so all I had to do was add the following line in `_config.yml`
```yaml
plugins:
  - jekyll-feed
```