---
title: Hybrid Search for Document-Heavy Products
date: "2026-10-14T11:00:00+05:30"
description: Keyword search, vectors, metadata, and the path back to the source.
featured: true
---

Document search has to handle several kinds of questions. Sometimes a user knows an exact phrase, a clause number, or a filename. Sometimes they describe an idea in words that do not appear in the source.

At Jurisphere, I've worked on retrieval that combines keyword and vector search. The interesting part is how those retrieval methods fit into the rest of a document workflow: scope, metadata, indexing state, and source references.

## Two ways to find a passage

Keyword search is useful when the query contains distinctive words or identifiers. BM25 ranks matches using lexical signals. Vector search can find passages that are semantically related to a query even when they use different wording.

For an illustrative example, imagine a user searching for “ending the agreement early.” A passage headed “Termination” may be relevant without containing that phrase. The same user may later search for the exact reference “clause 12.3,” where lexical matching is useful.

Combining the two gives the retrieval system candidates from both routes. It still needs to decide how to merge and rank them.

## Search metadata as well as content

One change I implemented extended keyword ranking across several fields: passage content, filename, title, summary, and category, with different weights.

A user may remember the name of a document rather than a sentence inside it. Restricting keyword search to chunk text can miss that signal even when the right document is already in the index.

Field weighting makes that tradeoff explicit. Content remains important, while filename and title matches can also influence ranking. The weights are tuning choices; they need to be checked against the queries your users actually make.

## Batch queries without conflating their scores

The implementation submits the keyword query and the vector query together through Turbopuffer's multi-query API. This combines the two index queries into one request, although embedding generation and any later reranking remain separate operations.

It is a concrete reduction in index requests. It is not, by itself, evidence that total search latency falls by the same proportion: the overall path also includes embeddings, result processing, and possibly reranking.

BM25 scores and vector distances are different quantities. Adding them directly would require deciding how to normalize them. Rank fusion is one way to combine the candidate lists without treating their raw scores as interchangeable.

Our retrieval path supports reciprocal rank fusion and reranking. These address different questions: fusion combines the retrieval lists; a reranker evaluates candidate relevance to the query. Neither can recover a passage that never entered the candidate set.

## Scope belongs in retrieval

In the uploaded-document search path, the index is selected by organization, and queries are filtered to the relevant file IDs and, where applicable, page ranges. Both retrieval routes use the same filter expression. Results are also restricted to chunks marked as current.

Those constraints belong in the retrieval request. Filtering only after ranking would let out-of-scope material occupy candidate slots, even if it were removed before the answer was shown.

This is one part of access control. The application still needs to resolve which files the user may access before it constructs the search scope.

## Index state is part of the product

A file can exist in storage and still be missing from the search index. A replaced document can leave older chunks behind unless the indexing process handles version state.

Our search path checks for missing indexed files and can trigger a backfill workflow before searching. The indexing code also tracks which chunks are current.

That introduces an operational tradeoff: repairing missing index data can make a request slower. It also means the system has something more useful to do than silently search an incomplete set of documents. The interface and telemetry need to account for this work.

When diagnosing a bad answer, I would first ask whether the relevant source was available to retrieval at all. Changing a prompt cannot fix a missing index entry.

## Preserve the route back to the source

Retrieved chunks carry more than passage text. Our chunk representation includes file identity, filename, page number, position, and bounding-box information when available.

That metadata lets downstream features associate a result with its source. It is also useful when investigating retrieval: an answer can sound plausible while drawing on the wrong passage or an older version of a document.

A citation is not proof that an answer is correct. It gives the user and the engineer a way to inspect the evidence.

## How I'd evaluate changes

I would build a small set of representative queries covering exact references, paraphrases, filenames, and scoped searches. For each, record the expected source passages, then compare keyword-only, vector-only, and combined retrieval.

Measure retrieval quality separately from answer quality. Also record where time goes: embedding generation, the index request, reranking, and any index repair. These are proposed evaluation steps, rather than a claim about benchmark results from this implementation.

Hybrid retrieval is useful, but the surrounding details determine whether it serves the user's workflow. The right scope, current index data, searchable metadata, and a clear route back to the source deserve as much attention as the choice of embedding model.

---

I'm the CTO and technical cofounder of Jurisphere, where I lead engineering and contribute hands-on. [More about my work](/work/jurisphere/), or [get in touch about a project](/consulting/).
