import { Agent, tool } from '@openai/agents';
import z from 'zod';

const getWeather = tool({
  name: 'getWeather',
  description: 'Get the weather for a given city.',
  parameters: z.object({
    city: z.string(),
  }),
  execute: async ({ city }) => {
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
  execute: async ({ highlight } = {}) => {
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
  execute: async ({ includeTasks } = {}) => {
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
  execute: async ({ focus } = {}) => {
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

export const hobbyFarmAdvisorAgent = Agent.create({
  name: 'Hobby Farm Control Center',
  instructions:
    'You are the general manager helping a solo owner run a small hobby farm in Hampton, CT with laying hens and catnip beds. Listen for what the farmer is juggling, delegate to the finance, flock operations, or field and market specialists, then stitch their input into one calm plan. Close with a short checklist the farmer can follow before the next chore block.',
  handoffs: [farmFinanceAdvisor, flockOperationsAdvisor, fieldAndMarketAdvisor],
});
