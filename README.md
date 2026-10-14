# sumit-ghosh.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/41379bfd-1abd-46f0-9378-066114f290c0/deploy-status)](https://app.netlify.com/sites/sumit-ghosh/deploys)

My personal website// blog. Live at — https://sumit-ghosh.com.

## Consulting refresh

The homepage introduces current work; `/work/jurisphere/` describes engineering
leadership and hands-on contributions; `/consulting/` provides a direct enquiry
route. `/writing/` retains the complete archive and existing post URLs. There is
no departure announcement, availability banner, rate card, or commitment to
specific hours. Confirm those details privately with prospective clients.

Three new technical articles are prepared as normal posts. Review their first-person
wording before deploying, since code verifies implementation but cannot establish
every detail of an author's experience. No deployment is required to review the
changes locally.

### Publishing order

1. **Jurisphere work page** plus **Why an AI Agent Needs Two Conversation Histories**:
   establish current experience and show a concrete persistence/compaction problem.
2. **Hybrid Search for Document-Heavy Products**: show retrieval engineering beyond
   an embeddings demo. These first two posts and the work page are sufficient for
   an initial consulting link; more writing is not a prerequisite.
3. **When an AI Request Outlives the Browser Tab**: separate execution, live
   delivery, and persisted state; cover reconnection, replay retention, activity
   retries, cancellation, and approval pauses. Prepared as a featured post.
4. **Applying AI edits inside Word: finding the right text is half the problem**:
   paragraph scope, typography normalization, stale anchors, review/apply state,
   and document identity. Use a synthetic document and an original diagram or
   recording to show one suggested edit and one stale edit being refused.
5. **A document pipeline needs recovery paths, not just a happy path**:
   conversion, OCR, partial failures, indexing, duplicate uploads, retries, and
   workflow replay compatibility. Illustrate with synthetic malformed files.
6. **Operating an AI product across shared and dedicated deployments**:
   separate infrastructure, platform, and application concerns; worker capacity,
   identity, deployment configuration, and tracing. Explain why those deployment
   options were needed and the maintenance cost. Use generic environment names.
7. **Translating a document is also a document-generation problem**:
   output structure, rendering failures, and recovery. Show synthetic source/output
   documents rather than customer material.

For Hacker News, share one article that stands on its technical substance. A
separate freelancer comment can link directly to `/consulting/` and the work page.
Use confirmed availability in that comment. No broad LinkedIn announcement is
needed for this site refresh.

### Evidence used for the copy

Reviewed the local Jurisphere monorepo at
`/Users/sumit/Coding/jurisphere/jurisphere` on 2026-10-14. The overview covers the
architecture, product surfaces, and representative implementation/history in the
areas below; it is not a line-by-line audit of the entire monorepo. The CTO and
technical cofounder attribution comes from Sumit's stated role. Team-wide work is
described as leadership and collaboration, not sole authorship.

| Area | Implementation references in Jurisphere | Representative Sumit-authored commits |
| --- | --- | --- |
| Conversation history | `api/app/assistant/context_compression.py`, `agent_history.py`, `service.py`, `tasks.py` and their tests | `3de6d01957` (dual-store compaction), `c2590d8f75` (run identity after compaction), `206d6ba600` (history consistency) |
| Execution and reconnection | `api/app/assistant/router.py`, `tasks.py`, `redis_sse_stream.py`, webapp `use-stream-reconnection.ts` and their tests | `328f169584` (Temporal assistant execution), `393d57a118` (AG-UI streaming), `3301fef50b` (terminal error publication) |
| Uploaded-document search | `api/app/utils/files/turbopuffer_search.py`, `api/app/library/turbopuffer.py` | `43695fbc23` (multi-field BM25 and batched queries), `7505e966f1` (search consolidation) |
| Word agent | `api/app/word_add_in/agent/edit_validation.py`, `paragraph_scope.py`, `ms-word-add-in/src/taskpane/hooks/useAgentStreaming.ts`, `utils/document-identity.ts` | `67bb8bf3fb` (persistent matters/edit state), `03ab35ebfd` (reconnect), `151bc1ead5` (OOXML edit bridge) |
| Ingestion | `api/app/library/tasks/process_uploaded_file.py`, `api/app/library/ocr/`, `scraping-pipeline/` | `a3aca446bf` (replay compatibility), `cd78ee2164` (upload byte accounting), `e6a02bbd9c` (postprocessing stability) |
| Translation and outputs | `api/app/translation/`, `api/app/assistant/capabilities/` | `64a5047178` (DOCX recovery), `fbcea3e06b` (translation confirmation), `121fa664ab` (document generation) |
| Deployment and telemetry | `docs/architecture.md`, `infrastructure/jurisphere_deployments/`, telemetry in the search path | `64e7081f00` (workload identity), `15126157bb` (AI telemetry), `f710edbff3` (trace storage) |

Commits establish direct contributions, not measured commercial results. The
copy does not use customer counts, throughput, uptime, or speedup claims. The
search evaluation section describes proposed checks, not completed benchmarks.
The public product site corroborates the research/review/drafting context:
https://www.jurisphere.ai/.

This README is excluded from Jekyll output. Do not put internal evidence or
customer-specific details in public posts.

## Local preview

```sh
bundle install
bundle exec jekyll serve
```

Check the homepage, navigation, work and consulting pages, featured article
links, writing archive, RSS, and an existing post before deployment.
