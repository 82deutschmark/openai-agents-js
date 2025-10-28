'use client';

import type { AgentInputItem } from '@openai/agents';
import { useState } from 'react';

import ArrowUpIcon from '@/components/icons/ArrowUpIcon';
import { History } from '@/components/History';
import { Button } from '@/components/ui/Button';

type Advisor = {
  name: string;
  focus: string;
  summary: string;
  prompts: string[];
};

type Snapshot = {
  title: string;
  description: string;
  items: { label: string; value: string }[];
};

const advisors: Advisor[] = [
  {
    name: 'Service Logistics Lead',
    focus: 'Coordinating liturgy, volunteers, and sanctuary setup.',
    summary:
      'Reviews the latest catechism outline, confirms communion prep, and balances greeters, readers, and hospitality teams.',
    prompts: [
      '“Outline Sunday’s catechism workshop agenda around the Apostles’ Creed.”',
      '“Draft the volunteer briefing for the 9AM liturgy.”',
    ],
  },
  {
    name: 'Pastoral Care & Outreach',
    focus: 'Following up with members and community partners.',
    summary:
      'Surfaces pastoral check-ins, prayer requests, and donor updates so nothing slips past a busy founding pastor.',
    prompts: [
      '“Help me respond to a catechism question from the Open Fellowship site.”',
      '“Summarize who needs a check-in call this week.”',
    ],
  },
  {
    name: 'Farm & Grounds Steward',
    focus: 'Hobby farm chores, feed runs, and market prep.',
    summary:
      'Balances chicken coop duties with herb bed care, integrates weather data, and keeps Hampton neighbors stocked with eggs.',
    prompts: [
      '“Create a task list that covers catechism night setup and hen house cleaning.”',
      '“What do I post to highlight the farm partnership after service?”',
    ],
  },
];

const snapshots: Snapshot[] = [
  {
    title: 'This week at Open Fellowship',
    description:
      'Key notes to keep Sunday’s service and catechism class moving smoothly.',
    items: [
      {
        label: 'Catechism focus',
        value: 'Chapter 4 · The Apostles’ Creed deep dive',
      },
      {
        label: 'Volunteers needed',
        value: '3 for greeting · 2 for hospitality table',
      },
      {
        label: 'Announcements',
        value: 'Farm share signups close Friday at noon',
      },
    ],
  },
  {
    title: 'Pastoral & member care',
    description: 'Blend agent memory with your own notes to stay personal.',
    items: [
      {
        label: 'Follow-up',
        value: 'Tasha (new member) requested baptism prep',
      },
      { label: 'Prayer queue', value: 'Garcia family recovering from surgery' },
      {
        label: 'Giving update',
        value: 'Cathedral partners pledged $1.2k/month',
      },
    ],
  },
  {
    title: 'Hobby farm dashboard',
    description: 'Quick glance at the hens, beds, and market commitments.',
    items: [
      { label: 'Egg delivery', value: '24 dozen promised to Quiet Corner CSA' },
      { label: 'Coop status', value: 'Deep clean scheduled for Thursday PM' },
      {
        label: 'Field note',
        value: 'Catnip rows ready for light harvest Saturday',
      },
    ],
  },
];

const quickPrompts = [
  'Draft a combined update for Sunday’s bulletin and the farm email.',
  'List three volunteer asks I should text to our core team tonight.',
  'Plan tomorrow’s farm chores around evening catechism class prep.',
];

export default function SmallBusinessPage() {
  const [history, setHistory] = useState<AgentInputItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memoryVectorStoreId, setMemoryVectorStoreId] = useState<string | null>(
    null,
  );

  async function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    setMessage('');

    const messages: AgentInputItem[] = [
      ...history,
      { type: 'message', role: 'user', content: trimmed },
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

      if (data.memoryVectorStoreId) {
        setMemoryVectorStoreId(data.memoryVectorStoreId);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(message);
  }

  async function handleQuickPrompt(prompt: string) {
    await sendMessage(prompt);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-12">
        <section className="relative overflow-hidden rounded-4xl border border-slate-800 bg-slate-900/60 p-10 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,126,255,0.35),transparent_60%)]" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium uppercase tracking-[0.3em] text-indigo-300/80">
              <span>Open Fellowship</span>
              <span className="h-3 w-px bg-indigo-300/40" />
              <span>Catechism & Farm Ops</span>
            </div>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Guide your church and hobby farm with a memory-backed agent crew.
            </h1>
            <p className="max-w-3xl text-lg text-slate-200">
              Give one instruction and the manager agent will recruit the right
              specialist—service logistics, pastoral care, or farm & grounds.
              Every response is grounded in the Open Fellowship knowledge base
              you store at{' '}
              <a
                href="https://openfellowship.faith/catechism"
                className="font-semibold text-indigo-200 underline decoration-dotted underline-offset-2"
              >
                openfellowship.faith/catechism
              </a>
              .
            </p>
            <p className="max-w-3xl text-sm text-slate-300">
              Conversation history is uploaded after every turn to your shared
              OpenAI vector store so the agents remember parishioner updates,
              catechism threads, and coop chores across sessions.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {advisors.map((advisor) => (
            <article
              key={advisor.name}
              className="flex h-full flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-slate-100 shadow-lg backdrop-blur"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  {advisor.name}
                </h2>
                <p className="text-sm font-medium uppercase tracking-wide text-indigo-200/80">
                  {advisor.focus}
                </p>
                <p className="text-sm text-slate-300">{advisor.summary}</p>
              </div>
              <div className="mt-auto space-y-2">
                {advisor.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="w-full rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-left text-sm text-indigo-100 transition hover:border-indigo-300/60 hover:bg-indigo-400/20"
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {snapshots.map((snapshot) => (
            <article
              key={snapshot.title}
              className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-100 shadow-lg"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {snapshot.title}
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  {snapshot.description}
                </p>
              </div>
              <dl className="space-y-3 text-sm">
                {snapshot.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {item.label}
                    </dt>
                    <dd className="text-slate-100">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </section>

        <section className="rounded-4xl border border-slate-800 bg-slate-900/80 p-8 text-slate-100 shadow-2xl">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Open Fellowship command center
                </h2>
                <p className="text-sm text-slate-300">
                  Ask for ministry follow-ups or farm logistics and the agent
                  team will coordinate a plan you can act on immediately.
                </p>
              </div>
              <div className="rounded-3xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-indigo-100">
                Connected store:{' '}
                <span className="font-semibold">
                  {memoryVectorStoreId ?? 'vs_68fffb393e7c81918c53643ecf212d0f'}
                </span>
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="flex h-[520px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
                {history.length > 0 ? (
                  <History history={history} />
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-slate-400">
                    <p>
                      Start by asking for help with catechism prep, volunteer
                      coordination, or tonight’s coop routine. The agents will
                      remember whatever you decide.
                    </p>
                  </div>
                )}
              </div>

              <aside className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-100">
                  Quick prompts
                </h3>
                <p className="text-slate-400">
                  Send one tap instructions when you need to bounce between the
                  sanctuary and the barn.
                </p>
                <div className="space-y-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left text-slate-100 transition hover:border-indigo-400/50 hover:bg-indigo-500/10"
                      disabled={isLoading}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </aside>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-inner"
            >
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask for catechism, pastoral, or farm support..."
                className="flex-1 border-none bg-transparent text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
                disabled={isLoading}
                aria-label="Message the Open Fellowship agents"
              />
              <Button
                type="submit"
                variant="primary"
                size="icon"
                disabled={isLoading || !message.trim()}
                aria-label="Send message"
                className="bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-70"
              >
                <ArrowUpIcon />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
