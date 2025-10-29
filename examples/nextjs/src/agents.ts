import { Agent, fileSearchTool, tool } from '@openai/agents';
import z from 'zod';

const stateFormationReference = [
  {
    name: 'Connecticut',
    abbreviation: 'CT',
    defaultEntity: 'Nonstock religious corporation',
    governingAgency: 'Connecticut Secretary of the State',
    filings: [
      'File a Certificate of Incorporation (Form CIN-1-1.0) with two incorporators and a registered agent located in Connecticut.',
      'Adopt bylaws that comply with Conn. Gen. Stat. §§ 33-1000 – 33-1130 and capture how clergy and board seats are selected.',
      'Prepare an initial board consent covering adopting bylaws, approving opening a bank account, and authorizing federal filings.',
    ],
    annualRequirements: [
      'Submit the annual report (Form NR-1) online by the 15th day of the anniversary month.',
      'Maintain a Connecticut registered agent and update the state within 30 days of any change.',
      'Record minutes for membership and board meetings in line with Conn. Gen. Stat. § 33-1101.',
    ],
    filingFee:
      '$50 filing fee, processed in 2–3 weeks standard or 24 hours expedited for an additional $50.',
    notes: [
      'Religious organizations can request exemption from certain charitable registration requirements once federal 501(c)(3) status is granted.',
      'Include a dissolution clause dedicating assets to another 501(c)(3) or governmental unit per IRS Publication 557.',
    ],
  },
  {
    name: 'New York',
    abbreviation: 'NY',
    defaultEntity: 'Religious corporation under the Religious Corporations Law',
    governingAgency: 'New York Department of State and local county clerk',
    filings: [
      'Petition the local Supreme Court for a certificate authorizing incorporation when required by denomination.',
      'File a Certificate of Incorporation with the county clerk and deliver a copy to the New York Department of State.',
      'Publish notices if creating a charitable corporation that will also operate outside of religious functions.',
    ],
    annualRequirements: [
      'Hold an annual membership meeting and record minutes consistent with the Religious Corporations Law.',
      'Update the New York Charities Bureau if soliciting donations, filing the CHAR500 form annually unless exempt.',
      'Maintain at least three trustees residing in New York unless a denomination-specific rule permits otherwise.',
    ],
    filingFee:
      '$75 filing fee to the Department of State; local county clerk fees vary.',
    notes: [
      'Some denominations require bishop or judicatory approval before the state will accept filings—capture that in the project plan.',
      'The Religious Corporations Law outlines unique rules for property and borrowing—plan resolutions accordingly.',
    ],
  },
  {
    name: 'California',
    abbreviation: 'CA',
    defaultEntity: 'Nonprofit religious corporation',
    governingAgency: 'California Secretary of State and Attorney General',
    filings: [
      'File Articles of Incorporation (Form ARTS-RE) online including a statement of religious purpose and required IRS language.',
      'Submit an initial Statement of Information (Form SI-100) within 90 days of incorporation.',
      'Register with the California Registry of Charitable Trusts by filing Form CT-1 within 30 days after assets are received.',
    ],
    annualRequirements: [
      'File the Statement of Information (Form SI-100) every two years, and Form RRF-1 annually with the Registry of Charitable Trusts.',
      'Maintain at least one board meeting per year with minutes and signed actions of the board.',
      'Renew any local business licenses or conditional use permits tied to the congregation’s property.',
    ],
    filingFee:
      '$30 for Articles of Incorporation plus $25 for the initial Statement of Information.',
    notes: [
      'California imposes a minimum $0 franchise tax on religious corporations but require Form 199N or 199 annually unless exempt.',
      'Include a specific dedication clause referencing California Revenue and Taxation Code Section 23701d.',
    ],
  },
  {
    name: 'Texas',
    abbreviation: 'TX',
    defaultEntity: 'Nonprofit corporation (religious)',
    governingAgency:
      'Texas Secretary of State and Texas Comptroller of Public Accounts',
    filings: [
      'Submit a Certificate of Formation—Nonprofit Corporation (Form 202) naming at least three directors.',
      'Draft bylaws that address membership, pastoral leadership, and handling of church property per Texas Business Organizations Code.',
      'File Form AP-204 to secure a state sales tax exemption after obtaining an EIN.',
    ],
    annualRequirements: [
      'File periodic reports only upon request from the Secretary of State; keep registered agent details current.',
      'Renew state sales tax exemption every 10 years and maintain charitable registration if soliciting broadly.',
      'Document annual meetings and significant financial decisions to preserve liability protections.',
    ],
    filingFee: '$25 filing fee with standard processing under one week.',
    notes: [
      'Texas does not require annual reports for most nonprofits, but bylaws should mandate financial reviews and congregational reporting.',
      'Congregations that own property should record deeds in the church’s name to avoid personal ownership issues.',
    ],
  },
];

function resolveStateRecord(state?: string) {
  if (!state) {
    return stateFormationReference[0];
  }

  const normalized = state.trim().toLowerCase();
  return (
    stateFormationReference.find((entry) => {
      return (
        entry.name.toLowerCase() === normalized ||
        entry.abbreviation.toLowerCase() === normalized
      );
    }) ??
    stateFormationReference.find((entry) =>
      entry.name.toLowerCase().includes(normalized),
    ) ??
    stateFormationReference[0]
  );
}

const getStateFormationBrief = tool({
  name: 'get_state_formation_brief',
  description:
    'Summarize the core steps, costs, and annual maintenance requirements to incorporate or register a church in a specific U.S. state.',
  parameters: z
    .object({
      state: z
        .string()
        .describe(
          'Full state name or postal abbreviation. Defaults to Connecticut.',
        )
        .optional(),
    })
    .optional()
    .default({}),
  execute: async ({ state }: { state?: string } = {}) => {
    const record = resolveStateRecord(state);
    const lines = [
      `${record.name} (${record.abbreviation}) — default entity: ${record.defaultEntity}.`,
      `Governing agency: ${record.governingAgency}.`,
      `Filing fee & timeline: ${record.filingFee}.`,
      `Formation filings: ${record.filings.join(' ')}`,
      `Annual stewardship: ${record.annualRequirements.join(' ')}`,
      `Planning notes: ${record.notes.join(' ')}`,
    ];

    return lines.join(' ');
  },
});

const getFederalNonprofitChecklist = tool({
  name: 'get_federal_nonprofit_checklist',
  description:
    'Outline the U.S. federal filings and registrations required for a new church pursuing 501(c)(3) recognition.',
  execute: async () => {
    return [
      'Apply for an EIN with IRS Form SS-4 (online or via fax) listing the organizing pastor or treasurer as the responsible party.',
      'Draft Articles of Incorporation and bylaws that include the IRS-required purpose clause and asset dedication clause.',
      'Prepare Form 1023 or 1023-EZ (if eligible) with a projected three-year budget, narrative of activities, and copies of organizing documents.',
      'Assemble a board conflict of interest policy and first-year financial controls checklist to include as attachments.',
      'Set up federal payroll accounts if hiring staff and register with EFTPS for payroll tax deposits.',
    ].join(' ');
  },
});

const deliverableBlueprints = {
  vision_charter: {
    title: 'Vision & Doctrine Charter',
    sections: [
      'Founding story and theological distinctives with references to core scriptures or traditions.',
      'Statement of faith covering deity, sacraments, clergy formation, and community commitments.',
      'Membership pathway outlining formation, covenant expectations, and pastoral care structure.',
      'Community impact plan referencing worship rhythm, outreach, and service partnerships.',
    ],
  },
  governance_bylaws: {
    title: 'Governance Framework & Bylaws',
    sections: [
      'Legal name, principal office, and membership definitions.',
      'Board composition, election cycles, quorum, and removal processes.',
      'Clergy selection, evaluation, and sabbatical policies.',
      'Financial stewardship rules including check signing, audits or reviews, and dissolution clause.',
      'Meeting procedures for congregational and board gatherings including notice requirements.',
    ],
  },
  state_articles: {
    title: 'State Formation Packet',
    sections: [
      'Articles of Incorporation summary tailored to the target state requirements and filing instructions.',
      'Registered agent appointment and consent form.',
      'Initial board resolutions and meeting minutes template.',
      'Checklist for state-level licenses, zoning, and charitable registrations.',
    ],
  },
  launch_playbook: {
    title: 'Launch & Operations Playbook',
    sections: [
      '90-day launch timeline with weekly milestones.',
      'Communications plan covering website, social media, and donor updates.',
      'Volunteer onboarding and training modules.',
      'Facilities and worship production checklist including risk management.',
    ],
  },
};

type DeliverableKey = keyof typeof deliverableBlueprints;

const getDeliverableBlueprint = tool({
  name: 'get_deliverable_blueprint',
  description:
    'Retrieve the recommended sections for a core Faith Foundry deliverable such as bylaws or launch playbooks.',
  parameters: z.object({
    deliverable: z
      .enum([
        'vision_charter',
        'governance_bylaws',
        'state_articles',
        'launch_playbook',
      ])
      .describe('Identifier for the deliverable outline to pull.'),
  }),
  execute: async ({ deliverable }: { deliverable: DeliverableKey }) => {
    const blueprint = deliverableBlueprints[deliverable];
    return `${blueprint.title}: ${blueprint.sections.join(' ')}`;
  },
});

const doctrineArchitect = new Agent({
  name: 'Doctrine & Culture Architect',
  instructions:
    'You help founders articulate theology, culture, and membership expectations. Use deliverable blueprints to produce drafts with clear headings, and ask for clarifications on beliefs or rituals before locking content.',
  tools: [getDeliverableBlueprint],
});

const legalFormationStrategist = new Agent({
  name: 'Legal Formation Strategist',
  instructions:
    'You turn state and federal compliance into concrete filing checklists. Always call get_state_formation_brief with the working state before advising, and reference the federal checklist whenever 501(c)(3) steps are mentioned.',
  tools: [getStateFormationBrief, getFederalNonprofitChecklist],
});

const launchLogisticsProducer = new Agent({
  name: 'Launch Logistics Producer',
  instructions:
    'You craft project plans, sprints, and communications that move the church from vision to launch. Use deliverable blueprints for playbooks and adapt to the founder’s calendar and volunteer capacity.',
  tools: [getDeliverableBlueprint, getStateFormationBrief],
});

const getWeather = tool({
  name: 'getWeather',
  description: 'Get the weather for a given city.',
  parameters: z.object({
    city: z.string(),
  }),
  execute: async ({ city }: { city: string }) => {
    return `The weather in ${city} is sunny.`;
  },

  needsApproval: true,
});

const farmsteadSnapshot = {
  farmName: 'Hampton Hollow Hobby Farm',
  location: 'Hampton, CT',
  finances: {
    month: 'April',
    eggRevenue: 620,
    catnipRevenue: 890,
    expenses: [
      { name: 'Organic layer feed (400 lbs)', amount: 340, due: 'May 6' },
      { name: 'Bedding + lime refresh', amount: 120, due: 'May 9' },
      {
        name: 'Irrigation supplies for catnip beds',
        amount: 180,
        due: 'May 15',
      },
    ],
    cashOnHand: 2450,
    savingsGoal: 5000,
    outstandingSubscriptions: 14,
  },
  flock: {
    layingHens: 34,
    pullets: 8,
    averageDailyEggs: 29,
    feedOnHandDays: 11,
    recentIssues: [
      'Hen #17 finishing a hard molt—monitor weight for another week.',
      'After last rain, check for mites during Sunday night roost inspection.',
    ],
    coopTasks: [
      'Deep clean brooders and replace bedding on May 5.',
      'Install additional shade cloth before the mid-June heat wave.',
    ],
  },
  crops: {
    catnipBeds: 12,
    sproutingBeds: 4,
    harvestReadyBeds: 3,
    dryingCapacityLbsPerWeek: 18,
    weeklyBundleDemand: 16,
    wholesaleRequests: [
      { buyer: 'Purrfect Pets Boutique', bundles: 6, due: 'May 12' },
      { buyer: 'Hartford Cat Cafe', bundles: 8, due: 'May 20' },
    ],
    farmersMarkets: [
      {
        name: 'Hampton Saturday Market',
        date: 'May 11',
        focus: 'Fresh egg CSA signups and catnip starter plants.',
      },
      {
        name: 'Quiet Corner Artisan Fair',
        date: 'May 18',
        focus: 'Dried catnip sachets and coop management workshop signups.',
      },
    ],
  },
  marketing: {
    newsletterSubscribers: 186,
    socialHighlights: [
      {
        channel: 'Instagram Reels',
        note: 'Coop clean-up tutorial reached 2.3k views and 54 shares.',
      },
      {
        channel: 'Quiet Corner Homesteaders Facebook group',
        note: 'Egg share waitlist grew by 12 families after photo post.',
      },
    ],
    collaborationIdeas: [
      'Partner with the local animal shelter on a cat adoption day featuring farm-grown catnip toys.',
      'Offer a summer farm tour raffle for newsletter subscribers who refer a friend.',
    ],
  },
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const getFarmFinances = tool({
  name: 'get_farm_finances',
  description:
    'Summarize egg and catnip revenue, this month’s expenses, cash on hand, and any open subscriptions to fulfill.',
  parameters: z
    .object({
      highlight: z
        .enum(['eggs', 'catnip', 'cash'])
        .optional()
        .describe('Select a focus area to expand on.'),
    })
    .optional()
    .default({}),
  execute: async ({
    highlight,
  }: { highlight?: 'eggs' | 'catnip' | 'cash' } = {}) => {
    const {
      month,
      eggRevenue,
      catnipRevenue,
      expenses,
      cashOnHand,
      savingsGoal,
      outstandingSubscriptions,
    } = farmsteadSnapshot.finances;

    const totals = `In ${month}, egg sales brought in ${currency.format(eggRevenue)} and dried catnip products added ${currency.format(catnipRevenue)}.`;

    const expenseBreakdown = expenses
      .map(
        (expense) =>
          `${expense.name} — ${currency.format(expense.amount)} due ${expense.due}`,
      )
      .join('; ');

    const cashSummary = `Cash on hand is ${currency.format(cashOnHand)} toward a ${currency.format(savingsGoal)} buffer with ${outstandingSubscriptions} CSA subscriptions still waiting for their first dozen.`;

    const details: string[] = [
      totals,
      `Upcoming expenses: ${expenseBreakdown}.`,
      cashSummary,
    ];

    if (highlight === 'eggs') {
      details.push(
        'Egg cashflow is steady; consider opening five more spots before farmers market season if feed stays under budget.',
      );
    } else if (highlight === 'catnip') {
      details.push(
        'Catnip pre-orders exceed drying capacity—schedule staggered harvests or reserve bundles for wholesale partners first.',
      );
    } else if (highlight === 'cash') {
      details.push(
        'Hold $200 aside for unexpected flock care and delay the irrigation upgrade one week if wholesale buyers slip.',
      );
    }

    return details.join(' ');
  },
});

const getFlockStatus = tool({
  name: 'get_flock_status',
  description:
    'Share current flock size, egg production trends, feed supply, and any coop maintenance tasks.',
  parameters: z
    .object({
      includeTasks: z
        .boolean()
        .optional()
        .describe('Set to true to include the top coop maintenance tasks.'),
    })
    .optional()
    .default({}),
  execute: async ({ includeTasks }: { includeTasks?: boolean } = {}) => {
    const {
      layingHens,
      pullets,
      averageDailyEggs,
      feedOnHandDays,
      recentIssues,
      coopTasks,
    } = farmsteadSnapshot.flock;

    const status = `The flock has ${layingHens} laying hens and ${pullets} pullets, averaging ${averageDailyEggs} eggs per day with ${feedOnHandDays} days of feed on hand.`;

    const healthNotes = `Watch outs: ${recentIssues.join(' ')}.`;

    const lines = [status, healthNotes];

    if (includeTasks) {
      lines.push(`Upcoming coop tasks: ${coopTasks.join(' ')}`);
    }

    return lines.join(' ');
  },
});

const getFieldAndMarketCalendar = tool({
  name: 'get_field_and_market_calendar',
  description:
    'Outline the current catnip bed status, wholesale commitments, upcoming markets, and marketing highlights to plan outreach.',
  parameters: z
    .object({
      focus: z
        .enum(['wholesale', 'markets', 'marketing'])
        .optional()
        .describe('Choose which part of the plan to emphasize.'),
    })
    .optional()
    .default({}),
  execute: async ({
    focus,
  }: { focus?: 'wholesale' | 'markets' | 'marketing' } = {}) => {
    const {
      catnipBeds,
      sproutingBeds,
      harvestReadyBeds,
      dryingCapacityLbsPerWeek,
      weeklyBundleDemand,
      wholesaleRequests,
      farmersMarkets,
    } = farmsteadSnapshot.crops;
    const { newsletterSubscribers, socialHighlights, collaborationIdeas } =
      farmsteadSnapshot.marketing;

    const fieldOverview = `Catnip beds: ${catnipBeds} total (${harvestReadyBeds} harvest-ready, ${sproutingBeds} sprouting). Drying racks handle ${dryingCapacityLbsPerWeek} lbs per week against demand for ${weeklyBundleDemand} bundles.`;

    const wholesaleSummary = wholesaleRequests
      .map(
        (request) =>
          `${request.buyer} needs ${request.bundles} bundles by ${request.due}`,
      )
      .join('; ');

    const marketNotes = farmersMarkets
      .map(
        (market) =>
          `${market.name} on ${market.date} — focus on ${market.focus}`,
      )
      .join('; ');

    const marketingHighlights = socialHighlights
      .map((highlight) => `${highlight.channel}: ${highlight.note}`)
      .join(' ');

    const collaborations = collaborationIdeas.join(' ');

    const lines: string[] = [fieldOverview];

    if (!focus || focus === 'wholesale') {
      lines.push(`Wholesale commitments: ${wholesaleSummary}.`);
    }

    if (!focus || focus === 'markets') {
      lines.push(`Upcoming markets: ${marketNotes}.`);
    }

    if (!focus || focus === 'marketing') {
      lines.push(
        `Audience touchpoints: ${newsletterSubscribers} newsletter readers. Highlights: ${marketingHighlights} Collaboration ideas: ${collaborations}`,
      );
    }

    return lines.join(' ');
  },
});

export const agent = new Agent({
  name: 'Basic Agent',
  instructions: 'You are a basic agent.',
  tools: [getWeather],
});

const FAITH_MEMORY_TOOL_NAME = 'faith_foundry_memory';

export function createFaithFoundryAgent({
  memoryVectorStoreId,
  state,
}: {
  memoryVectorStoreId?: string;
  state?: string;
} = {}) {
  const workingState = resolveStateRecord(state);
  const memoryTool = memoryVectorStoreId
    ? fileSearchTool(memoryVectorStoreId, {
        name: FAITH_MEMORY_TOOL_NAME,
        maxNumResults: 8,
        includeSearchResults: true,
      })
    : undefined;

  const instructions: string[] = [
    `You lead Faith Foundry, a professional workspace that helps founders launch a legally compliant church in ${workingState.name} (${workingState.abbreviation}).`,
    'Coordinate theology, legal formation, and operations so every output becomes a ready-to-use deliverable.',
    'Default to Connecticut as the working state until the founder explicitly selects another—confirm the change, update your plan, and summarize implications.',
    'Structure every response with (1) a quick status headline, (2) deliverable updates with document names, and (3) crisp next actions or data requests.',
    'Draft documents in Markdown with clear headings, placeholder prompts where details are missing, and instructions on how to file or distribute the artifact.',
    'Call get_state_formation_brief before advising on state filings or governance tweaks, and reference get_federal_nonprofit_checklist when federal compliance is in scope.',
    'Use deliverable blueprints to keep outputs consistent and reuse prior materials stored in the workspace memory.',
  ];

  if (memoryTool) {
    instructions.push(
      `Pull prior commitments and drafts with the ${FAITH_MEMORY_TOOL_NAME} tool and cite what you reuse so the founder trusts the workspace timeline.`,
    );
  } else {
    instructions.push(
      'Summarize historical commitments in each answer so the transcript can be archived to the shared OpenAI vector store.',
    );
  }

  instructions.push(
    'Offer handoffs to the doctrine, legal, or launch specialists when deeper expertise is needed, then weave their notes back into one actionable plan.',
  );

  const sharedTools = [
    getDeliverableBlueprint,
    getStateFormationBrief,
    getFederalNonprofitChecklist,
  ];

  if (memoryTool) {
    sharedTools.unshift(memoryTool);
  }

  return Agent.create({
    name: 'Faith Foundry Control Desk',
    instructions: instructions.join(' '),
    tools: sharedTools,
    handoffs: [
      doctrineArchitect,
      legalFormationStrategist,
      launchLogisticsProducer,
    ],
    model: 'gpt-4.1',
  });
}

const flockOperationsAdvisor = new Agent({
  name: 'Flock Operations Advisor',
  instructions:
    'You look after the hens on a small hobby farm. Always pull the flock status before recommending chores, health checks, or feed adjustments. Keep guidance practical for a single owner handling chores before and after work.',
  tools: [getFlockStatus],
});

const farmFinanceAdvisor = new Agent({
  name: 'Farm Finance Advisor',
  instructions:
    'You help the farmer balance cash across egg subscriptions, catnip sales, and farm upgrades. Start by reviewing the latest farm finances, then outline simple actions to stay on budget without sacrificing animal care.',
  tools: [getFarmFinances],
});

const fieldAndMarketAdvisor = new Agent({
  name: 'Field & Market Advisor',
  instructions:
    'You connect the catnip beds, market commitments, and community outreach. Use the field and market calendar to plan harvest timing, product mixes, and messaging that fits Hampton, CT customers.',
  tools: [getFieldAndMarketCalendar],
});

const FARM_MEMORY_TOOL_NAME = 'farm_memory_search';

export function createHobbyFarmAdvisorAgent({
  memoryVectorStoreId,
}: { memoryVectorStoreId?: string } = {}) {
  const memoryTool = memoryVectorStoreId
    ? fileSearchTool(memoryVectorStoreId, {
        name: FARM_MEMORY_TOOL_NAME,
        maxNumResults: 8,
        includeSearchResults: true,
      })
    : undefined;

  const instructions = [
    'You are the general manager helping a solo owner run a small hobby farm in Hampton, CT with laying hens and catnip beds.',
    'Listen for what the farmer is juggling, delegate to the finance, flock operations, or field and market specialists, then stitch their input into one calm plan.',
    memoryTool
      ? `When earlier Hampton Hollow chats might contain commitments, use the ${FARM_MEMORY_TOOL_NAME} tool to recall and cite the most relevant notes before responding.`
      : 'We archive each conversation turn after you reply so later sessions can look back on the details—summarize commitments clearly.',
    'Close with a short checklist the farmer can follow before the next chore block.',
  ].join(' ');

  return Agent.create({
    name: 'Hobby Farm Control Center',
    instructions,
    ...(memoryTool ? { tools: [memoryTool] } : {}),
    handoffs: [
      farmFinanceAdvisor,
      flockOperationsAdvisor,
      fieldAndMarketAdvisor,
    ],
  });
}
