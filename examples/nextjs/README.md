# Next.js Demo

This example shows a basic example of how to use human-in-the-loop in a Next.js application.

Right now it only uses a synchronous approach without streaming and storing in an in-memory DB.

This folder also includes a Hampton hobby farm control center demo that shows how multiple agents can collaborate inside a simple
Next.js site while saving every conversation turn into an OpenAI vector store for long-lived memory.

## Run the example

Set the `OPENAI_API_KEY` environment variable and run:

```bash
pnpm -F nextjs dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and ask `What is the weather in San Francisco and Oakland?`

## Endpoints

- **`/`** – The basic example that actually handles receiving the approval requests and sending messages to the API. Code in `src/app/page.tsx`.
- **`/api/basic`** – The endpoint that gets triggered to run the agent. Code in `src/app/api/basic/route.ts`.
- **`/small-business`** – A simple website where a farm manager agent collaborates with finance, flock, and field specialists tailored for a Hampton, CT hobby farm. Code in `src/app/small-business/page.tsx`.
- **`/api/small-business`** – The API endpoint used by the hobby farm demo. Code in `src/app/api/small-business/route.ts`.

## Other files

- `src/components/Approvals.tsx` — renders the approval dialog
- `src/agents.ts` — contains the basic Agent configuration
- `src/db.ts` — contains the mock database implementation
