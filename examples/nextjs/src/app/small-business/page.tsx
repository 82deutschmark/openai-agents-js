'use client';

import type { AgentInputItem } from '@openai/agents';
import { useState } from 'react';

import ArrowUpIcon from '@/components/icons/ArrowUpIcon';
import { History } from '@/components/History';
import { Button } from '@/components/ui/Button';

type Specialist = {
  name: string;
  focus: string;
  summary: string;
  suggestions: string[];
};

const specialists: Specialist[] = [
  {
    name: 'Farm Finance Advisor',
    focus: 'Egg and catnip cash flow.',
    summary:
      'Keeps tabs on CSA subscriptions, wholesale catnip orders, and cash for unexpected flock care.',
    suggestions: [
      '“Can I cover the new irrigation kit after this week’s egg deliveries?”',
      '“How much catnip should go to wholesale versus the market?”',
    ],
  },
  {
    name: 'Flock Operations Advisor',
    focus: 'Daily coop chores and hen health.',
    summary:
      'Flags molt recoveries, feed usage, and coop maintenance so the flock stays productive.',
    suggestions: [
      '“What chores should I tackle before the heat wave?”',
      '“Are the hens laying enough to open more CSA slots?”',
    ],
  },
  {
    name: 'Field & Market Advisor',
    focus: 'Catnip beds and customer outreach.',
    summary:
      'Lines up harvest timing with Hampton markets and keeps neighbors excited for fresh eggs.',
    suggestions: [
      '“Help me plan bundles for the Quiet Corner fair.”',
      '“What should I post after tonight’s coop check?”',
    ],
  },
];

export default function SmallBusinessPage() {
  const [history, setHistory] = useState<AgentInputItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!message.trim()) {
      return;
    }

    const text = message;
    setMessage('');

    const messages: AgentInputItem[] = [
      ...history,
      { type: 'message', role: 'user', content: text },
    ];

    setHistory([
      ...messages,
      {
        type: 'message',
        role: 'assistant',
        content: [],
        status: 'in_progress',
      },
    ]);

    setIsLoading(true);
    try {
      const response = await fetch('/api/small-business', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.history) {
        setHistory(data.history);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSend();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-12">
        <section className="rounded-4xl bg-slate-900 p-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-300">
            Hampton Hollow Helpers
          </p>
          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
            Run your hobby farm with a team of focused AI specialists.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-200">
            Ask once and let the farm manager pull in finance, flock, and field
            experts. Each specialist references the latest Hampton Hollow
            snapshot before handing back simple steps you can finish between
            chores.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {specialists.map((specialist) => (
            <article
              key={specialist.name}
              className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur"
            >
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {specialist.name}
                </h2>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  {specialist.focus}
                </p>
              </div>
              <p className="text-sm text-slate-600">{specialist.summary}</p>
              <div className="mt-auto space-y-2">
                {specialist.suggestions.map((suggestion) => (
                  <p
                    key={suggestion}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"
                  >
                    {suggestion}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Ask the farm control center
              </h2>
              <p className="text-sm text-slate-600">
                Share what you need help with—egg deliveries, coop upkeep, or
                catnip markets—and the manager will pull in the right expert.
              </p>
            </div>

            <div className="flex h-[520px] flex-col gap-4">
              <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                {history.length > 0 ? (
                  <History history={history} />
                ) : (
                  <div className="flex flex-1 items-center justify-center px-6 text-center text-slate-500">
                    Ask the crew what’s next for the hens or catnip and they’ll
                    build the plan together.
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ask for help balancing egg runs, chores, or market prep..."
                  className="flex-1 border-none bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="icon"
                  disabled={isLoading || !message.trim()}
                  aria-label="Send message"
                >
                  <ArrowUpIcon />
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
