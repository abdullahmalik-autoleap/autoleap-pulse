import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";
import { subDays, addDays, addHours } from "date-fns";

const prisma = new PrismaClient();

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.round(rand(min, max));
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SHOP_NAMES = [
  "Joe's Auto Body", "Precision Collision Center", "Downtown Motor Works", "Alpine Auto Repair",
  "Premier Collision Center", "FastFix Auto", "Lakeside Motors", "Bay Area Auto",
  "Metro Garage", "Summit Auto", "Citywide Repairs", "Golden State Auto Repair",
  "Sunshine Motors", "Pacific Auto", "Eastside Collision & Glass", "Valley Auto Express",
  "Heritage Auto Care", "Apex Auto Service", "Northstar Collision", "Rivertown Repairs",
  "Coastal Auto Works", "Highline Motors", "Patriot Auto Service", "Liberty Collision",
  "Eagle Eye Auto", "Champion Auto Care", "Elite Motor Works", "Pinnacle Auto Repair",
  "Frontier Garage", "Cascade Auto Service", "Summit Peak Motors", "Blue Ridge Auto",
  "Harbor View Auto", "Crossroads Collision", "Ironworks Auto", "Titan Motor Repair",
  "Phoenix Auto Body", "Silverline Collision", "Maple Street Motors", "Evergreen Auto Care",
  "Thunder Road Auto", "Wildcat Garage", "Pacific Coast Collision", "Iron Horse Auto",
  "Granite State Motors", "Lone Star Auto Body", "Prairie Auto Care", "Badger State Collision",
  "Peach State Auto", "Keystone Motor Works",
];

const REGIONS: { name: string; states: string[] }[] = [
  { name: "West", states: ["CA", "WA", "OR", "NV", "AZ", "CO", "UT", "HI"] },
  { name: "Southeast", states: ["FL", "GA", "NC", "SC", "VA", "TN", "AL", "MS", "LA"] },
  { name: "Northeast", states: ["NY", "NJ", "PA", "MA", "CT", "NH", "ME", "VT", "RI"] },
  { name: "Midwest", states: ["IL", "OH", "MI", "IN", "WI", "MN", "MO", "IA"] },
  { name: "Southwest", states: ["TX", "OK", "NM", "AR"] },
  { name: "Canada", states: ["ON", "BC", "AB", "QC"] },
];
const REGION_WEIGHTS = [25, 20, 20, 18, 12, 5];

const CITIES_BY_STATE: Record<string, string[]> = {
  CA: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"],
  WA: ["Seattle", "Tacoma", "Spokane"], OR: ["Portland", "Eugene"],
  NV: ["Las Vegas", "Reno"], AZ: ["Phoenix", "Tucson"], CO: ["Denver", "Boulder"],
  UT: ["Salt Lake City"], HI: ["Honolulu"],
  FL: ["Miami", "Tampa", "Orlando", "Jacksonville"], GA: ["Atlanta", "Savannah"],
  NC: ["Charlotte", "Raleigh"], SC: ["Charleston"], VA: ["Richmond", "Virginia Beach"],
  TN: ["Nashville", "Memphis"], AL: ["Birmingham"], MS: ["Jackson"], LA: ["New Orleans"],
  NY: ["New York", "Buffalo", "Albany"], NJ: ["Newark", "Jersey City"],
  PA: ["Philadelphia", "Pittsburgh"], MA: ["Boston", "Worcester"],
  CT: ["Hartford"], NH: ["Manchester"], ME: ["Portland"], VT: ["Burlington"], RI: ["Providence"],
  IL: ["Chicago", "Springfield"], OH: ["Columbus", "Cleveland", "Cincinnati"],
  MI: ["Detroit", "Grand Rapids"], IN: ["Indianapolis"], WI: ["Milwaukee", "Madison"],
  MN: ["Minneapolis"], MO: ["St. Louis", "Kansas City"], IA: ["Des Moines"],
  TX: ["Houston", "Dallas", "Austin", "San Antonio"], OK: ["Oklahoma City"],
  NM: ["Albuquerque"], AR: ["Little Rock"],
  ON: ["Toronto", "Ottawa"], BC: ["Vancouver", "Victoria"],
  AB: ["Calgary", "Edmonton"], QC: ["Montreal", "Quebec City"],
};

const SUPPORT_AGENTS = [
  "Sarah Chen", "Mike Rodriguez", "Emily Watson", "David Kim",
  "Jessica Park", "Carlos Mendez", "Rachel Green", "James Liu",
];

async function main() {
  console.log("Seeding database...");

  // Clean new/updated tables for idempotent re-seeding
  await prisma.dailySupportMetric.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.churnEvent.deleteMany();
  await prisma.revenueSnapshot.deleteMany();
  await prisma.signupEvent.deleteMany();
  await prisma.featureRequest.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.dailyMetric.deleteMany();

  // --- Admin user ---
  const hashedPassword = await bcrypt.hash("pulse2026", 10);
  await prisma.user.upsert({
    where: { email: "admin@autoleap.com" },
    update: {},
    create: {
      email: "admin@autoleap.com",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log("  Created admin user");

  // --- 30 days of DailyMetrics ---
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const date = subDays(now, 29 - i);
    date.setHours(0, 0, 0, 0);

    const progress = i / 29;

    const promoters = +(65 + rand(0, 7)).toFixed(1);
    const detractors = +(6 + rand(0, 6)).toFixed(1);
    const passives = +(100 - promoters - detractors).toFixed(1);

    await prisma.dailyMetric.upsert({
      where: { date },
      update: {},
      create: {
        date,
        newSignups: Math.round(45 + 45 * progress + rand(-5, 5)),
        activeShops: Math.round(4100 + 300 * progress + rand(-10, 10)),
        mrr: +(420 + 45 * progress + rand(-2.5, 2.5)).toFixed(1),
        churnRate: +(1.8 + rand(0, 0.7)).toFixed(2),
        openTickets: randInt(20, 55),
        resolvedTickets: randInt(25, 60),
        trialToPaid: +(28 + rand(0, 10)).toFixed(1),
        npsScore: randInt(60, 70),
        promoters,
        passives,
        detractors,
        airTrials: randInt(3, 15),
      },
    });
  }
  console.log("  Seeded 30 days of DailyMetrics");

  // --- 20 ActivityEvents ---
  const activities: {
    type: string;
    message: string;
    severity: string;
    metadata?: string;
  }[] = [
    { type: "signup", message: "Joe's Auto Body signed up for a free trial", severity: "success" },
    { type: "signup", message: "Precision Collision Center created an account", severity: "success" },
    { type: "signup", message: "Downtown Motor Works started a 14-day trial", severity: "success" },
    { type: "signup", message: "Alpine Auto Repair joined AutoLeap", severity: "success" },
    { type: "churn", message: "Churn alert: Premier Collision Center cancelled subscription", severity: "danger", metadata: JSON.stringify({ reason: "Switching to competitor", mrr_lost: 299 }) },
    { type: "churn", message: "Churn alert: FastFix Auto downgraded to free tier", severity: "warning", metadata: JSON.stringify({ reason: "Budget constraints", mrr_lost: 199 }) },
    { type: "churn", message: "Churn risk: Lakeside Motors hasn't logged in for 14 days", severity: "warning", metadata: JSON.stringify({ last_login: "2026-03-10" }) },
    { type: "ticket", message: "Ticket escalated: QuickBooks sync failing for Bay Area Auto", severity: "danger", metadata: JSON.stringify({ ticket_id: "TK-1042", category: "sync" }) },
    { type: "ticket", message: "High-priority ticket: Invoice generation error at Metro Garage", severity: "danger", metadata: JSON.stringify({ ticket_id: "TK-1038", category: "bug" }) },
    { type: "ticket", message: "Ticket resolved: Parts catalog search fixed for Summit Auto", severity: "success", metadata: JSON.stringify({ ticket_id: "TK-1035", resolution_time: "4h" }) },
    { type: "ticket", message: "New ticket: Payment processing timeout at Citywide Repairs", severity: "info", metadata: JSON.stringify({ ticket_id: "TK-1045", category: "billing" }) },
    { type: "feature_request", message: "New feature request: Multi-location inventory dashboard (12 votes)", severity: "info" },
    { type: "feature_request", message: "Feature request trending: Automated parts ordering integration", severity: "info" },
    { type: "nps", message: "NPS score increased to 68 — up 3 points from last week", severity: "success" },
    { type: "nps", message: "Detractor feedback: 'Reporting needs more customization options'", severity: "warning", metadata: JSON.stringify({ score: 4, shop: "Westside Collision" }) },
    { type: "air_trial", message: "AIR trial started: Golden State Auto Repair activated AI diagnostics", severity: "info" },
    { type: "air_trial", message: "AIR trial converted: Sunshine Motors upgraded to AIR Pro", severity: "success", metadata: JSON.stringify({ plan: "air_pro", mrr_added: 149 }) },
    { type: "air_trial", message: "AIR trial expiring: Pacific Auto has 3 days remaining", severity: "warning" },
    { type: "signup", message: "Eastside Collision & Glass signed up via partner referral", severity: "success", metadata: JSON.stringify({ referral: "PartnerNetwork", channel: "referral" }) },
    { type: "churn", message: "Win-back opportunity: Valley Auto Express reactivated after 30 days", severity: "success" },
  ];

  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];
    await prisma.activityEvent.create({
      data: {
        type: a.type,
        message: a.message,
        severity: a.severity,
        metadata: a.metadata ?? null,
        createdAt: subDays(now, Math.floor(rand(0, 14))),
      },
    });
  }
  console.log("  Seeded 20 ActivityEvents");

  // --- 8 FeatureRequests ---
  const featureRequests: { title: string; votes: number; status: string }[] = [
    { title: "Multi-location inventory sync dashboard", votes: 174, status: "planned" },
    { title: "Automated parts ordering from vendor catalogs", votes: 142, status: "in_progress" },
    { title: "Customer SMS appointment reminders", votes: 98, status: "done" },
    { title: "Digital vehicle inspection with photo upload", votes: 87, status: "in_progress" },
    { title: "QuickBooks Online two-way sync improvements", votes: 63, status: "planned" },
    { title: "Technician performance & efficiency reports", votes: 45, status: "open" },
    { title: "Custom labor rate matrices by job type", votes: 31, status: "open" },
    { title: "Integration with CARFAX vehicle history", votes: 12, status: "open" },
  ];

  for (const fr of featureRequests) {
    await prisma.featureRequest.create({
      data: {
        title: fr.title,
        votes: fr.votes,
        status: fr.status,
        createdAt: subDays(now, randInt(5, 90)),
      },
    });
  }
  console.log("  Seeded 8 FeatureRequests");

  // =====================================================================
  //  NEW MODELS
  // =====================================================================

  // --- 200 SignupEvents (last 30 days) ---
  const plans = ["starter", "pro", "enterprise"];
  const planWeights = [50, 35, 15];
  const shopTypes = ["general", "tire", "quicklube", "specialty", "mobile", "fleet"];
  const shopTypeWeights = [40, 18, 15, 12, 10, 5];
  const sources = ["organic", "paid_search", "referral", "direct", "social", "partner"];
  const sourceWeights = [35, 28, 18, 12, 5, 2];

  for (let i = 0; i < 200; i++) {
    const daysAgo = rand(0, 30);
    const date = subDays(now, daysAgo);
    date.setHours(randInt(6, 22), randInt(0, 59), randInt(0, 59), 0);

    const regionData = REGIONS[
      weightedPick([0, 1, 2, 3, 4, 5], REGION_WEIGHTS)
    ];
    const state = pickRandom(regionData.states);
    const city = pickRandom(CITIES_BY_STATE[state] ?? ["Unknown"]);

    const trialStart = new Date(date);

    let convertedAt: Date | null = null;
    if (daysAgo >= 14 && Math.random() < 0.34) {
      convertedAt = addDays(trialStart, randInt(7, 14));
    }

    await prisma.signupEvent.create({
      data: {
        date,
        shopName: pickRandom(SHOP_NAMES) + ` #${1000 + i}`,
        plan: weightedPick(plans, planWeights),
        shopType: weightedPick(shopTypes, shopTypeWeights),
        region: regionData.name,
        state,
        city,
        source: weightedPick(sources, sourceWeights),
        trialStart,
        convertedAt,
      },
    });
  }
  console.log("  Seeded 200 SignupEvents");

  // --- 12 months of RevenueSnapshots (Apr 2025 – Mar 2026) ---
  const baseMRR = 380000;
  const targetMRR = 465000;
  const mrrStep = (targetMRR - baseMRR) / 11;

  for (let m = 0; m < 12; m++) {
    const date = new Date(2025, 3 + m, 1); // Apr 2025 = month index 3
    date.setHours(0, 0, 0, 0);

    const mrr = +(baseMRR + mrrStep * m + rand(-3000, 3000)).toFixed(2);
    const arr = +(mrr * 12).toFixed(2);
    const newMRR = +(mrr * rand(0.03, 0.05)).toFixed(2);
    const expansionMRR = +(mrr * rand(0.01, 0.02)).toFixed(2);
    const contractionMRR = +(mrr * rand(0.005, 0.01)).toFixed(2);
    const churnMRR = +(mrr * rand(0.01, 0.02)).toFixed(2);
    const netNewMRR = +(newMRR + expansionMRR - contractionMRR - churnMRR).toFixed(2);

    const starterRevenue = +(mrr * 0.3 + rand(-500, 500)).toFixed(2);
    const proRevenue = +(mrr * 0.5 + rand(-500, 500)).toFixed(2);
    const enterpriseRevenue = +(mrr - starterRevenue - proRevenue).toFixed(2);

    const arpu = +(88 + (107 - 88) * (m / 11) + rand(-2, 2)).toFixed(2);
    const ltv = +(rand(1800, 2200)).toFixed(2);
    const paybackPeriod = +(rand(8, 14)).toFixed(1);

    await prisma.revenueSnapshot.create({
      data: {
        date,
        mrr,
        arr,
        newMRR,
        expansionMRR,
        contractionMRR,
        churnMRR,
        netNewMRR,
        starterRevenue,
        proRevenue,
        enterpriseRevenue,
        avgRevenuePerShop: arpu,
        ltv,
        paybackPeriod,
      },
    });
  }
  console.log("  Seeded 12 RevenueSnapshots");

  // --- 45 ChurnEvents (last 90 days) ---
  const churnReasons = ["price", "missing_feature", "competitor", "support", "no_need", "unknown"];
  const churnReasonWeights = [28, 22, 20, 12, 10, 8];
  const churnPlans = ["starter", "pro", "enterprise"];
  const churnPlanMRR: Record<string, [number, number]> = {
    starter: [89, 149],
    pro: [149, 249],
    enterprise: [249, 340],
  };

  for (let i = 0; i < 45; i++) {
    const date = subDays(now, randInt(0, 90));
    date.setHours(randInt(8, 18), randInt(0, 59), 0, 0);

    const plan = weightedPick(churnPlans, [50, 35, 15]);
    const [minMRR, maxMRR] = churnPlanMRR[plan];

    const regionData = REGIONS[
      weightedPick([0, 1, 2, 3, 4, 5], REGION_WEIGHTS)
    ];

    let tenure: number;
    const tenureRoll = Math.random();
    if (tenureRoll < 0.1) tenure = randInt(1, 3);
    else if (tenureRoll < 0.85) tenure = randInt(4, 18);
    else tenure = randInt(19, 36);

    await prisma.churnEvent.create({
      data: {
        date,
        shopName: pickRandom(SHOP_NAMES) + ` #${2000 + i}`,
        plan,
        mrrImpact: +(rand(minMRR, maxMRR)).toFixed(2),
        reason: weightedPick(churnReasons, churnReasonWeights),
        tenure,
        region: regionData.name,
      },
    });
  }
  console.log("  Seeded 45 ChurnEvents");

  // --- 80 SupportTickets ---
  const ticketCategories = ["billing", "sync", "bug", "feature", "general", "onboarding"];
  const ticketCatWeights = [18, 20, 25, 12, 15, 10];
  const ticketStatuses = ["open", "in_progress", "waiting", "resolved", "closed"];
  const ticketStatusWeights = [25, 20, 10, 30, 15];
  const ticketPriorities = ["low", "normal", "high", "urgent"];
  const ticketPriorityWeights = [15, 45, 30, 10];
  const ticketChannels = ["email", "chat", "phone", "in_app"];
  const ticketChannelWeights = [35, 30, 15, 20];

  const ticketTitles: Record<string, string[]> = {
    billing: [
      "Unable to process credit card payments",
      "Duplicate charges appearing on invoices",
      "Questions about annual billing discount",
      "Subscription upgrade not reflected",
      "Refund request for downtime",
    ],
    sync: [
      "Invoice not syncing with QuickBooks",
      "Xero integration disconnecting daily",
      "Parts inventory sync mismatch",
      "Customer data not syncing to CRM",
      "Accounting export missing transactions",
    ],
    bug: [
      "Parts search returns incorrect results",
      "Login page not loading on Safari mobile",
      "Appointment calendar not sending confirmations",
      "Data export timing out for large ranges",
      "Technician app crashing on Android 14",
      "Customer portal showing wrong times",
      "Report generation stuck at 0%",
    ],
    feature: [
      "Request: Add labor time guides",
      "Request: Tire inventory tracking module",
      "Request: Multi-location dashboard",
      "Request: SMS notifications for customers",
    ],
    general: [
      "How to set up multi-location access",
      "Help setting up automated follow-up emails",
      "Training request for new staff",
      "Best practices for inventory management",
    ],
    onboarding: [
      "Need help importing customer data",
      "Initial QuickBooks setup assistance",
      "Staff account provisioning questions",
      "Configuring service menu and pricing",
    ],
  };

  const priorityResponseHrs: Record<string, [number, number]> = {
    urgent: [0.5, 2],
    high: [1, 8],
    normal: [4, 24],
    low: [8, 48],
  };

  for (let i = 0; i < 80; i++) {
    const ticketNumber = `TK-${1001 + i}`;
    const category = weightedPick(ticketCategories, ticketCatWeights);
    const status = weightedPick(ticketStatuses, ticketStatusWeights);
    const priority = weightedPick(ticketPriorities, ticketPriorityWeights);
    const channel = weightedPick(ticketChannels, ticketChannelWeights);

    const createdAt = subDays(now, rand(0, 30));
    createdAt.setHours(randInt(7, 20), randInt(0, 59), randInt(0, 59), 0);

    const [minHrs, maxHrs] = priorityResponseHrs[priority];
    const firstResponseAt = addHours(createdAt, rand(minHrs, maxHrs));

    const isResolved = status === "resolved" || status === "closed";
    const resolvedAt = isResolved
      ? addHours(firstResponseAt, rand(2, 72))
      : null;

    let csat: number | null = null;
    if (isResolved) {
      const csatRoll = Math.random();
      if (csatRoll < 0.05) csat = 1;
      else if (csatRoll < 0.12) csat = 2;
      else if (csatRoll < 0.25) csat = 3;
      else if (csatRoll < 0.55) csat = 4;
      else csat = 5;
    }

    const titles = ticketTitles[category] ?? ["General inquiry"];
    const assignee = status === "open" && Math.random() < 0.3
      ? null
      : pickRandom(SUPPORT_AGENTS);

    await prisma.supportTicket.create({
      data: {
        ticketNumber,
        shopName: pickRandom(SHOP_NAMES),
        title: pickRandom(titles),
        category,
        status,
        priority,
        channel,
        assignee,
        firstResponseAt,
        resolvedAt,
        csat,
        createdAt,
      },
    });
  }
  console.log("  Seeded 80 SupportTickets");

  // --- 30 days of DailySupportMetrics ---
  for (let i = 0; i < 30; i++) {
    const date = subDays(now, 29 - i);
    date.setHours(0, 0, 0, 0);

    const newTickets = randInt(5, 18);
    const resolvedTickets = randInt(4, 16);
    const openTickets = randInt(15, 45);

    const billing = randInt(1, 4);
    const sync = randInt(1, 5);
    const bug = randInt(2, 6);
    const feature = randInt(0, 3);
    const general = randInt(1, 3);
    const onboarding = randInt(0, 2);

    await prisma.dailySupportMetric.upsert({
      where: { date },
      update: {},
      create: {
        date,
        openTickets,
        newTickets,
        resolvedTickets,
        avgFirstResponseMin: randInt(45, 180),
        avgResolutionHrs: +(rand(8, 48)).toFixed(1),
        csatScore: +(rand(3.8, 4.7)).toFixed(2),
        slaBreaches: randInt(0, 5),
        ticketsByCategory: JSON.stringify({
          billing,
          sync,
          bug,
          feature,
          general,
          onboarding,
        }),
      },
    });
  }
  console.log("  Seeded 30 DailySupportMetrics");

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
