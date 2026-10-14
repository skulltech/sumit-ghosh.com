---
layout: post
title: Why an AI Agent Needs Two Conversation Histories
date: 2026-10-14 12:00:00 +0530
description: Keeping the user's transcript intact while compacting the model's working context.
featured: true
---

An assistant's conversation history starts out looking like one thing: messages go in, messages come out, and you save them. As the assistant starts using tools and conversations get longer, that history takes on two different jobs.

The application needs a record of what happened. The model needs enough context to decide what to do next. Those requirements diverge once you start compacting context.

At Jurisphere, I worked on separating these into a full conversation transcript and a model-facing history. That separation makes some otherwise awkward problems easier to reason about.

## The transcript and the working context

The full transcript supports the interface and the application's resume behavior. If a user scrolls back, they should still see their original question and the answer they received. Compaction should not rewrite that record.

The model-facing history is a working representation. It can discard older tool output or summarize earlier exchanges to fit within a context budget.

These are different representations of the same conversation:

```text
Conversation
  ├── Full transcript → interface and application history
  └── Working context → next model call, with compaction
```

A summary may be sufficient for the next model call without being a suitable replacement for the user's transcript. A document-search result may contain a large amount of text that helped one turn but does not need to be replayed indefinitely.

## Compact in stages

Our implementation uses a tiered approach: clear older tool results first, then summarize if more reduction is needed, while retaining recent messages.

The order matters. Summarization makes decisions about what to preserve, and those decisions can lose detail. Removing older bulky tool results is a cheaper first step, provided recent tool-call and result pairs remain coherent.

For a document assistant, a summary also needs to preserve references that later answers depend on. A summary saying “we discussed the contract” is much less useful than one retaining the relevant document references, decisions, and unresolved questions.

This does not make summaries lossless. It gives the model a smaller working context while leaving the original record available to the application.

## A subtle consequence: offsets stop identifying turns

Suppose you record the length of the history before a run:

```python
start = len(messages)
```

After the run, you take everything after that offset as the new turn. This works while the prefix remains unchanged.

Compaction can rewrite that prefix during the run. The old offset may then point into the wrong place or beyond the end of the list. An interruption makes this especially troublesome, because you need to identify what happened in the current run before saving it.

I worked on using the run's identity to locate its messages instead. The invariant is that a run's stamped messages form a contiguous suffix; a saved list length is no longer the boundary.

The broader lesson is that identity survives transformations that position does not. Whenever a pipeline rewrites a list, check whether downstream code has quietly treated an index as an identifier.

## Interrupted output needs its own handling

There is another distinction between the model's message history and the interface: text can reach the user before the model finishes producing a complete response.

On interruption, the captured model messages may not include that in-flight output. If the application has already streamed it, preserving the visible partial response requires handling those streamed deltas explicitly.

Incomplete tool-call tails also need care. Replaying an unfinished tool exchange as though it completed can produce an invalid or misleading next context. Our history helpers trim incomplete tails and construct a partial response from the output accumulated during streaming.

Keeping two stores does not remove the need for consistency. It makes that responsibility explicit: decide what gets persisted after completion, after interruption, and when reading an older conversation.

## What I'd check in another assistant

Before adding more elaborate memory, I would check these cases:

- A long conversation compacts, and the original transcript remains visible.
- The user interrupts a run after seeing partial output.
- Compaction happens before an interrupted turn is persisted.
- An incomplete tool exchange does not get replayed as a completed one.
- An older saved conversation can initialize the model-facing representation.

These are application behaviors, not just prompt behaviors. A larger context window can postpone some pressure, but it does not answer what your application should preserve or how it should resume.

Separating the transcript from the model's working context gives each a clear purpose. That is a useful foundation before adding more sophisticated memory.

---

I'm the CTO and technical cofounder of Jurisphere, where I lead engineering and contribute hands-on. [More about my work]({{ '/work/jurisphere/' | relative_url }}), or [get in touch about a project]({{ '/consulting/' | relative_url }}).
