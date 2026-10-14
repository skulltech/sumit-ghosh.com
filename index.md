---
layout: page
title: Sumit Ghosh
description: CTO and technical cofounder of Jurisphere. Building AI products, document workflows, and the systems behind them.
---

I'm Sumit, CTO and technical cofounder of [Jurisphere](https://www.jurisphere.ai/). I lead engineering and work hands-on across the product, backend, and infrastructure.

My work centers on AI products that help people work with documents: finding the right information, tracing answers back to sources, reviewing and editing in Word, and carrying long-running workflows through to completion.

## Selected work

At Jurisphere, I've led and contributed to:

- **Document processing and retrieval:** ingestion, OCR, hybrid search, and source references for document-heavy workflows.
- **AI assistants and Word integration:** tool use, conversation persistence, streaming, and document editing inside an existing application.
- **Production engineering:** background processing, observability, and shared and dedicated deployments across cloud environments.

[Read about my work at Jurisphere]({{ '/work/jurisphere/' | relative_url }})

## Recent writing

{% assign recent_posts = site.posts | where_exp: "post", "post.featured == true" %}
{% for post in recent_posts %}
- [{{ post.title }}]({{ post.url | relative_url }}) — {{ post.description }}
{% endfor %}

[All writing]({{ '/writing/' | relative_url }}) includes older notes on Python, infrastructure, independent projects, and the other things I find interesting.

## Working together

I help teams build AI features and improve the systems around them. [More about consulting]({{ '/consulting/' | relative_url }}).

For a project or a conversation, email [sumit@sumit-ghosh.com](mailto:sumit@sumit-ghosh.com).
