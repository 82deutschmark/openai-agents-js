'use client';

import type { AgentInputItem } from '@openai/agents';
import { useMemo, useState } from 'react';

import ArrowUpIcon from '@/components/icons/ArrowUpIcon';
import { History } from '@/components/History';
import { Button } from '@/components/ui/Button';

const availableStates = [
  { label: 'Connecticut (default)', value: 'Connecticut' },
  { label: 'New York', value: 'New York' },
  { label: 'California', value: 'California' },
  { label: 'Texas', value: 'Texas' },
];

const deliverables = [
  {
    title: 'Vision & Doctrine Charter',
    description:
      'Ground the faith community with a statement of beliefs, worship rhythm, and membership covenant ready to publish.',
    highlights: [
      'Clarify your theological distinctives and liturgical cadence.',
      'Document how new members are formed, welcomed, and cared for.',
      'Outline pastoral roles, spiritual formation tracks, and community impact.',
    ],
  },
  {
    title: 'Governance Framework & Bylaws',
    description:
      'Translate your convictions into board structure, voting rules, and financial guardrails the IRS and your state will expect.',
    highlights: [
      'Adopt a compliant board composition and meeting cadence.',
      'Capture decision-making for clergy, finances, and membership discipline.',
      'Embed dissolution and conflict of interest clauses that support 501(c)(3) recognition.',
    ],
  },
  {
    title: 'State Formation Packet',
    description:
      'Prepare the filings, resolutions, and agent designations to register your church in the selected state.',
    highlights: [
      'Articles of Incorporation tailored to state-specific requirements.',
      'Initial board resolutions, registered agent consent, and filing cover letters.',
      'Charitable solicitation, zoning, and licensing checklist by jurisdiction.',
    ],
  },
  {
    title: 'Launch & Operations Playbook',
    description:
      'Drive a 90-day launch sprint with communications, volunteer onboarding, and worship production plans.',
    highlights: [
      'Weekly milestone tracker with owner assignments.',
      'Risk mitigation for facilities, safeguarding, and cash handling.',
      'Donor, communications, and pastoral care cadences post-launch.',
    ],
  },
];

const complianceMilestones = [
  {
    title: 'Federal 501(c)(3) Track',
    points: [
      'File for an EIN and draft purpose/dedication language that aligns with IRS Publication 557.',
      'Prepare Form 1023 narrative, projected budgets, and board policies.',
      'Plan for post-determination compliance: public inspection, payroll accounts, and donation acknowledgements.',
    ],
  },
  {
    title: 'State Stewardship',
    points: [
      'Identify the filing fees, annual reports, and registered agent obligations for your state.',
      'Schedule board and member meetings that satisfy local corporate law.',
      'Track charitable registrations or business licenses tied to your property.',
    ],
  },
  {
    title: 'Culture & Care Systems',
    points: [
      'Design safe environment policies for children, vulnerable adults, and digital ministry spaces.',
      'Codify pastoral care escalation paths and sabbatical planning.',
      'Document volunteer screening, background checks, and onboarding flows.',
    ],
  },
];

const quickPrompts = [
  'Draft a Connecticut-focused Articles of Incorporation for a nonstock religious corporation named “Riverlight Fellowship.”',
  'Outline bylaws sections we still need details for, and list the questions to ask our founding board.',
  'Summarize the exact steps to file for 501(c)(3) status and the documents we must attach.',
  'Plan a 12-week launch timeline with worship prep, communications, and fundraising milestones.',
];

export default function FaithFoundryPage() {
  const [history, setHistory] = useState<AgentInputItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memoryVectorStoreId, setMemoryVectorStoreId] = useState<string | null>(
    null,
  );
  const [selectedState, setSelectedState] = useState('Connecticut');

  const selectedStateLabel = useMemo(() => {
    const match = availableStates.find(
      (option) => option.value === selectedState,
    );
    return match ? match.label : selectedState;
  }, [selectedState]);

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
      const response = await fetch('/api/faith-foundry', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          conversationId,
          state: selectedState,
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

      if (typeof data.state === 'string' && data.state.trim()) {
        setSelectedState(data.state);
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
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pt-12 md:px-8">
        <header className="flex flex-col gap-6 rounded-4xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-10 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-indigo-200/80">
                Faith Foundry · Church Formation Control Desk
              </p>
              <h1 className="text-3xl font-semibold md:text-4xl">
                Create, govern, and launch your faith community with a Responses
                API workspace that captures every deliverable.
              </h1>
              <p className="max-w-3xl text-base text-slate-200 md:text-lg">
                Define your doctrine, draft bylaws, and prepare filings with a
                team of specialized agents. Every chat turn, outline, and
                checklist is stored automatically in your OpenAI vector store so
                you can return tomorrow and keep building.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-indigo-500/40 bg-indigo-500/10 p-6 text-sm text-indigo-100">
              <span className="text-xs uppercase tracking-[0.28em] text-indigo-200/80">
                Formation State
              </span>
              <label className="flex flex-col gap-2 text-slate-100">
                <select
                  className="min-w-[220px] rounded-2xl border border-indigo-500/60 bg-slate-950/60 px-4 py-2 text-base focus:border-indigo-300 focus:outline-none"
                  value={selectedState}
                  onChange={(event) => setSelectedState(event.target.value)}
                >
                  {availableStates.map((stateOption) => (
                    <option key={stateOption.value} value={stateOption.value}>
                      {stateOption.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-indigo-200/80">
                  Default is Connecticut. Switch states to adapt filings and
                  compliance tasks.
                </span>
              </label>
              {memoryVectorStoreId ? (
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-indigo-200/70">
                    Workspace Memory Store
                  </p>
                  <p className="mt-1 break-words font-mono text-sm text-indigo-50">
                    {memoryVectorStoreId}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-indigo-200/70">
                  Once you send your first request we will pin this session to
                  your dedicated vector store on OpenAI.
                </p>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-50">
                Deliverable Roadmap
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Each module becomes a shareable document your founding team can
                sign, publish, or file. Ask for a draft and the workspace will
                store it for future sessions.
              </p>
            </div>
            <div className="space-y-5">
              {deliverables.map((deliverable) => (
                <div
                  key={deliverable.title}
                  className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg"
                >
                  <h3 className="text-base font-semibold text-slate-50">
                    {deliverable.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {deliverable.description}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-200">
                    {deliverable.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-50">
                Compliance & Culture Milestones
              </h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {complianceMilestones.map((milestone) => (
                  <div
                    key={milestone.title}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4"
                  >
                    <h3 className="text-sm font-semibold text-indigo-200">
                      {milestone.title}
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {milestone.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1 h-1 w-1 rounded-full bg-indigo-400" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-50">
                    Conversation Workspace
                  </h2>
                  <p className="text-xs text-slate-300">
                    Responses API session tuned for {selectedStateLabel} filings
                    and 501(c)(3) compliance.
                  </p>
                </div>
                <div className="flex flex-col text-right text-xs text-slate-400">
                  <span>Session ID: {conversationId ?? '—'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 px-6 py-4">
                <div className="flex flex-wrap gap-3">
                  {quickPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="secondary"
                      size="smRounded"
                      disabled={isLoading}
                      onClick={() => handleQuickPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>

                <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
                  <History history={history} />
                </div>

                <form
                  className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-4"
                  onSubmit={handleSubmit}
                >
                  <input
                    type="text"
                    className="flex-1 min-w-0 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                    placeholder="Ask for a draft, filing checklist, or launch plan..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    variant="primary"
                    size="icon"
                    type="submit"
                    disabled={isLoading || !message.trim()}
                  >
                    <ArrowUpIcon />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
