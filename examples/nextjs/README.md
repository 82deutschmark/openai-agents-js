# Next.js Agent Playground

This example project shows how to embed OpenAI Agents inside a modern Next.js UI.
It includes the vanilla approval-loop demo from the homepage **and** a full
"Open Fellowship Control Center" experience that blends church operations with a
small hobby farm.

The control center demonstrates how multiple agents collaborate, how
conversation history is captured in an OpenAI vector store, and how you can
present ministry/farm context alongside a live chat surface.

## Run the example locally

1. Create a `.env.local` (or export environment variables in your shell) with
   your OpenAI credentials:

   ```bash
   export OPENAI_API_KEY=sk-YOUR_KEY
   export OPENAI_VECTOR_STORE_ID=vs_68fffb393e7c81918c53643ecf212d0f # optional override
   ```

   If you omit `OPENAI_VECTOR_STORE_ID` the control center will fall back to the
   shared store ID shown above so every interaction lands in the same memory
   collection.

2. Start the dev server:

   ```bash
   pnpm -F nextjs dev
   ```

3. Navigate to [http://localhost:3000](http://localhost:3000) for the basic
   approval-loop playground or [http://localhost:3000/small-business](http://localhost:3000/small-business)
   to open the Open Fellowship experience.

## Featured routes

- **`/`** – Minimal chat UI that surfaces approval items returned from agent runs.
- **`/api/basic`** – API route invoked by the basic chat interface.
- **`/small-business`** – The Open Fellowship Control Center UI with hero cards,
  ministry/farm snapshots, quick prompts, and a persistent chat area backed by a
  shared vector store.
- **`/api/small-business`** – The API route that powers the control center. It
  ensures each conversation reuses the shared vector store ID and appends new
  turns so future sessions remember prior commitments.

## Key supporting files

- `src/components/Approvals.tsx` – renders approval requests outside the chat
  stream.
- `src/agents.ts` – defines the farm manager and specialist agents along with
  their tool configuration.
- `src/lib/conversation-memory.ts` – handles uploads to the shared vector store
  and keeps track of how many turns have already been persisted.
- `src/db.ts` – a tiny in-memory store used for tracking conversation metadata
  while you run the demo locally.
