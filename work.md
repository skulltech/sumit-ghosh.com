---
layout: page
title: Work
permalink: /work/jurisphere/
description: Leading engineering and building document workflows, AI assistants, and production infrastructure at Jurisphere.
---

## Building Jurisphere

I'm the CTO and technical cofounder of [Jurisphere](https://www.jurisphere.ai/), an AI platform for legal research, document review, and drafting. I lead engineering and contribute hands-on across the system.

Legal work brings several engineering problems together: inconsistent source documents, precise references, long-running processing, and users who already work in tools such as Microsoft Word. A useful product has to carry information through that entire workflow.

The areas below are part of my work as an engineering leader and individual contributor. Jurisphere is a team effort; these describe systems I've led and worked on with the team.

## From uploaded documents to usable information

The document pipeline handles file conversion, text extraction, OCR, chunking, metadata, and indexing. Background workflows coordinate that work so that processing can survive failures and run independently of a browser request.

I've worked on the ingestion paths, OCR and storage integration, upload limits, and search. One concrete search change combined keyword and vector queries in a single index request and extended keyword ranking to document metadata as well as content.

The practical concern is the whole path: whether a document was successfully processed, whether its current contents are searchable, and whether a result can take the user back to the relevant source.

[Read: Hybrid search for document-heavy products]({% post_url 2026-10-14-hybrid-search-for-document-heavy-products %})

## Assistants that fit the user's workflow

The product includes assistants that use tools and work with document context, along with a Word add-in for reviewing and editing documents where users already work.

My contributions include agent orchestration, persistent conversation history, context compaction, reconnecting streams, and the handling of proposed edits. These are separate concerns: a suggestion has to be useful, but it also has to refer to the right document and apply to the right text.

For long conversations, I've worked on keeping a full transcript for the application alongside a compacted history for the model. This preserves what the user saw while allowing the model's working context to change.

[Read: Why an AI agent needs two conversation histories]({% post_url 2026-10-14-two-conversation-histories-for-ai-agents %})

## Document outputs and translation

Document workflows also need to produce usable artifacts. Translation and drafting involve structure, formatting, export, and recovery when a generated document cannot be rendered correctly.

I've contributed to translation orchestration, document generation, and failure recovery. The engineering goal is to complete the user's document workflow, including the output they can open and continue working with.

## Running the product

I've worked on the infrastructure behind shared and dedicated deployments, including Kubernetes, Terraform/Terragrunt, GitOps, cloud identity, and observability across GCP, Azure, and k3s environments.

This includes the less visible parts of delivery: separating interactive and background worker capacity, tracing model and retrieval operations, managing deployment configuration, and investigating failures across services.

## What this experience carries into consulting

I can work across the AI feature and the application around it: data ingestion, retrieval, backend APIs, user interaction, background processing, and deployment. That is particularly useful when a feature crosses several parts of a small team's stack.

[Discuss a project]({{ '/consulting/' | relative_url }}) or email [sumit@sumit-ghosh.com](mailto:sumit@sumit-ghosh.com).
