---
layout: post
title: When an AI Request Outlives the Browser Tab
date: 2026-10-14 13:00:00 +0530
description: Keeping execution independent of the connection, and reconnecting without starting the work again.
featured: true
---

A user asks an assistant to work through a set of documents. It starts searching, reading, and generating an answer. Then the user refreshes the page.

What should happen?

The work should keep going. When the user returns, the application should find the existing run and show its progress or result. It should not quietly submit the same question again.

That behavior sounds straightforward, but it requires separating several things that often start out inside one HTTP handler: executing the work, delivering live updates, and recording what happened.

At Jurisphere, I've worked on assistant execution and streaming using Temporal, Redis, and Server-Sent Events. The useful architectural decision is to give the run a lifetime independent of the browser connection.

## Starting work and watching work are separate operations

In this design, submitting a question starts a backend workflow. The browser then connects to a separate endpoint to receive events for that chat.

```text
Browser ── submit question ──▶ API ── start workflow ──▶ Worker
                                                         │
                                                         ▼
                                                   Event buffer
                                                         │
Browser ◀──────────────── SSE connection ◀────────────────┘

The worker also saves conversation content and run status.
```

The stream is a way to observe the work. It does not own the work's lifetime. Closing it stops delivery to that browser, while execution continues in the backend.

This distinction also helps with navigation inside the application. Leaving a conversation page should not have the same meaning as pressing Stop.

Moving work into a background task inside the API process can separate it from the immediate response, but that alone does not define what happens when the process restarts. A workflow engine adds execution tracking, timeouts, and retry policies. It still needs explicit decisions about what a retry is allowed to repeat.

## A returning browser needs to discover the existing run

Reopening the page is different from reconnecting an existing socket. The page may have lost its local state, and the application needs to discover which chat is still running.

Our webapp uses two signals. A browser-side pending-query cache can recover the chat identity and submitted query before the conversation API response arrives. The API can also report the latest chat as pending or streaming, letting the page attach to it.

These paths can race. The API-driven path may attach first, while the browser cache contains extra context that has not yet appeared in the fetched conversation. The reconnection hook checks the chat identity: it enriches an already attached instance of the same chat rather than opening another stream or overwriting it with an unrelated cached entry.

The important identity is the run the user already started. Reconnecting should not call the submission endpoint again.

## Live delivery needs a replay buffer

A live-only broadcast loses events while the browser is disconnected. If part of an answer arrives during that gap, simply reconnecting leaves the user with an incomplete response.

Our assistant streaming path appends events to a Redis Stream. The SSE endpoint reads those entries and includes their event IDs. A client can reconnect with a last-seen event ID, allowing delivery to continue after that cursor while the entries remain available.

For example:

```text
Browser receives events 1–10
Connection drops
Worker publishes events 11–20
Browser reconnects after event 10
Server reads the retained events after that cursor
```

That cursor supports resuming delivery. It is not a checkpoint of the model's execution, and it does not imply that the model can resume generating from an arbitrary token.

The buffer also has limits. Our streams have a maximum length and an expiry, refreshed as events are published. Old events can be trimmed or expire. A cursor is useful only within the retained stream; it is not a promise of unlimited replay.

## The event buffer is not the lasting record

The application separately saves conversation content and status. A user returning to a completed conversation needs the saved result, rather than depending on whether its streaming events still exist.

An approval pause makes this distinction particularly clear. The user might return hours later to approve a capability. Keeping a live stream open for that entire pause would couple the approval interface to the buffer's lifetime.

Our reconnection hook does not reattach a chat that is awaiting approval. Instead, the interface renders the saved conversation and pending approvals. The worker persists that approval state before publishing the event that tells the UI to show the approval action.

That ordering matters: if the interface offers an action before the server has recorded the state needed to accept it, the user can click something that the backend is not ready to handle.

The saved state and the event stream serve different purposes. Neither removes the need to reconcile failures or stale status.

## Reconnection, retry, and cancellation need different rules

**Reconnection** attaches a client to existing work. A dropped SSE connection should not trigger a fresh model call.

**Retry** happens when backend execution fails. Temporal activities can be retried, but an activity that calls a model or a tool may already have done some work before failing. A retry can incur another model call or repeat a side effect unless the application handles that boundary.

In our streaming implementation, the worker resets the event buffer before a new activity attempt so that partial output from separate attempts is not mixed into one stream. Terminal error publication also uses an atomic claim to avoid duplicate official error events across retries or overlapping attempts.

Those measures address event publication. They do not establish exactly-once execution for every tool the agent can call. A tool that changes external state needs its own idempotency or recovery design. Resetting the stream also means an old delivery cursor cannot be treated as a checkpoint across attempts.

**Cancellation** is an explicit user action. Our Stop path sends a signal to the running activity and records a stopped status. The stored status covers cases such as a stop arriving before the worker starts, when there is no active subscriber to receive the signal.

A signal alone can be missed. A stored flag alone does not necessarily interrupt an already running model call promptly. The implementation needs to account for both, including what to tell the user if signal delivery fails.

## Make failure distinguishable from silence

An idle connection does not tell the browser whether a tool is still running, the worker has failed, or the event transport is unavailable.

Worker heartbeats, bounded retries, persisted status, and explicit terminal events each help answer a different part of that question. The streaming code also handles temporary Redis read failures with bounded retries; when it cannot recover the transport, it lets the client reconnect rather than treating the lost connection as proof that the assistant failed.

These mechanisms have their own failure cases. A status can remain marked as streaming after an unexpected failure, so the application also needs a way to detect and reconcile stale runs. An indefinite spinner is not a recovery strategy.

## The scenarios I'd verify

For an assistant with this architecture, I would check:

- Refresh while the worker is running: the page attaches to the same chat without submitting another question.
- Drop the connection after partial output: retained events let delivery catch up without corrupting the displayed answer.
- Return after completion and after the event buffer expires: the saved result remains available.
- Retry an activity after partial publication: the UI does not combine different attempts into one answer.
- Press Stop before the worker starts and during execution: both cases have a defined outcome.
- Return to an approval pause hours later: the saved approval action still works.

These are suggested verification scenarios, not a claim that every failure mode has been eliminated.

The central design choice is simple: give execution an identity and a lifetime independent of the connection. Then define how the application observes it, recovers its result, and asks it to stop.

---

For the related question of what an assistant should retain across turns, see [Why an AI Agent Needs Two Conversation Histories]({% post_url 2026-10-14-two-conversation-histories-for-ai-agents %}).

I'm the CTO and technical cofounder of Jurisphere, where I lead engineering and contribute hands-on. [More about my work]({{ '/work/jurisphere/' | relative_url }}), or [get in touch about a project]({{ '/consulting/' | relative_url }}).
