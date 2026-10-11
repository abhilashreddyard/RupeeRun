import { PersonaPreset, UnexpectedEvent, WhatIfDecision } from '../types/finance';

export const DEFAULT_UNEXPECTED_EVENTS: UnexpectedEvent[] = [
  {
    id: 'evt-laptop-charger',
    day: 9,
    title: 'Laptop Charger Short-Circuit Before Project Submission',
    category: 'Tech Failure',
    severity: 'High',
    description: 'Your primary laptop adapter sparked out right before mid-semester deliverables. You need power immediately to finish coding.',
    resolved: false,
    options: [
      {
        id: 'opt-orig-cash',
        label: 'Buy Original OEM Charger from Cash (₹1,250)',
        description: 'Pay straight from liquid spendable cash today. Zero warranty risk, but compresses daily allowance.',
        cashImpact: 1250,
        savingsImpact: 0,
        healthNote: 'Compresses daily safe-to-spend by ~₹57/day for the rest of the month.'
      },
      {
        id: 'opt-use-buffer',
        label: 'Cover via Emergency Buffer + Savings (₹1,250)',
        description: 'Pull ₹1,000 from Emergency Buffer and ₹250 from cash so daily allowance stays stable.',
        cashImpact: 250,
        savingsImpact: 1000,
        healthNote: 'Protects daily allowance, but depletes your emergency shock shield.'
      },
      {
        id: 'opt-certified-used',
        label: 'Buy Certified Refurbished Adapter (₹650)',
        description: 'Get a tested campus tech-shop adapter for half the cost from liquid cash.',
        cashImpact: 650,
        savingsImpact: 0,
        healthNote: 'Balanced trade-off: saves ₹600 liquid runway with moderate hardware longevity.'
      }
    ]
  },
  {
    id: 'evt-birthday-split',
    day: 14,
    title: 'Close Friend Surprise Birthday Dinner Split',
    category: 'Social Pressure',
    severity: 'Medium',
    description: 'The group booked a rooftop café and wants everyone to split the bill plus cake equally at ₹750 per person.',
    resolved: false,
    options: [
      {
        id: 'opt-full-split',
        label: 'Join & Pay Full Equal Split (₹750)',
        description: 'Absorb the ₹750 social spend directly from your liquid allowance.',
        cashImpact: 750,
        savingsImpact: 0,
        healthNote: 'High discretionary spike; requires 2 zero-spend days to recover.'
      },
      {
        id: 'opt-smart-boundary',
        label: 'Join for Cake & Coffee Only + Itemized Share (₹320)',
        description: 'Communicate your monthly budget boundary upfront and pay for what you order plus cake.',
        cashImpact: 320,
        savingsImpact: 0,
        healthNote: 'Preserves ₹430 of runway while staying present with friends.'
      },
      {
        id: 'opt-gift-only',
        label: 'Skip Dinner, Send Handwritten Note & Desk Plant (₹180)',
        description: 'Save the restaurant markup and give a thoughtful ₹180 personal gift.',
        cashImpact: 180,
        savingsImpact: 0,
        healthNote: 'Maximum budget protection with minimal social friction.'
      }
    ]
  },
  {
    id: 'evt-freelance-gig',
    day: 17,
    title: 'Weekend UI/UX Micro-Gig Opportunity',
    category: 'Windfall / Gig',
    severity: 'Positive',
    description: 'A campus startup alumnus offered ₹1,400 for a 6-hour weekend landing page audit and Figma cleanup.',
    resolved: false,
    options: [
      {
        id: 'opt-gig-cash',
        label: 'Accept Gig & Boost Liquid Spendable Pool (+₹1,400)',
        description: 'Inject all ₹1,400 into your monthly spendable runway to ease daily allowance pressure.',
        cashImpact: 0,
        savingsImpact: 0,
        incomeAdded: 1400,
        healthNote: 'Raises daily safe-to-spend by +₹100/day for remaining days.'
      },
      {
        id: 'opt-gig-split',
        label: 'Accept Gig: ₹800 to Savings Vault + ₹600 to Cash',
        description: 'Lock ₹800 into your Emergency & Savings Buffer and keep ₹600 for daily spending.',
        cashImpact: 0,
        savingsImpact: -800, // negative means adding to buffer/savings
        incomeAdded: 1400,
        healthNote: 'Optimal wealth habit: accelerates savings goals and strengthens shock resilience.'
      }
    ]
  },
  {
    id: 'evt-clinic-visit',
    day: 22,
    title: 'Sudden Viral Fever & Pharmacy Bill',
    category: 'Health & Medical',
    severity: 'High',
    description: 'Seasonal flu hit during finals week. Doctor consultation and prescribed recovery meds total ₹850.',
    resolved: false,
    options: [
      {
        id: 'opt-med-buffer',
        label: 'Use Emergency Health Buffer (₹600 Buffer + ₹250 Cash)',
        description: 'Deploy your emergency buffer for what it was designed for.',
        cashImpact: 250,
        savingsImpact: 600,
        healthNote: 'Smart use of emergency reserve during late-month tight window.'
      },
      {
        id: 'opt-med-cash',
        label: 'Pay Entire ₹850 from Remaining Liquid Cash',
        description: 'Keep savings untouched, absorbing the full hit in your last 9 days of cash.',
        cashImpact: 850,
        savingsImpact: 0,
        healthNote: 'Sharp reduction in final-week daily allowance; watch for overdraft.'
      },
      {
        id: 'opt-campus-dispensary',
        label: 'Visit Campus Health Center + Generic Meds (₹280)',
        description: 'Use free student health clinic consultation and pay only for essential generic medicine.',
        cashImpact: 280,
        savingsImpact: 0,
        healthNote: 'Saves ₹570 while getting full medical care.'
      }
    ]
  }
];

export const WHAT_IF_TEMPLATES: {
  id: string;
  label: string;
  subtitle: string;
  decision: WhatIfDecision;
}[] = [
  {
    id: 'tpl-sneakers',
    label: 'Flash Sale Streetwear Sneakers',
    subtitle: '₹1,800 one-time impulse buy today',
    decision: {
      title: 'Flash Sale Streetwear Sneakers',
      type: 'one_time_expense',
      amount: 1800,
      triggerDay: 8,
      category: 'Shopping & Essentials',
      isEssential: false,
    },
  },
  {
    id: 'tpl-concert',
    label: 'Live Indie Music Festival Pass',
    subtitle: '₹1,250 weekend ticket + transit',
    decision: {
      title: 'Indie Music Festival Pass',
      type: 'one_time_expense',
      amount: 1250,
      triggerDay: 12,
      category: 'Social & Hangouts',
      isEssential: false,
    },
  },
  {
    id: 'tpl-daily-coffee',
    label: 'Daily ₹120 Iced Latte Habit',
    subtitle: '₹120/day recurring for remaining days',
    decision: {
      title: 'Daily ₹120 Cafe Iced Latte',
      type: 'recurring_daily',
      amount: 120,
      triggerDay: 8,
      category: 'Food & Dining',
      isEssential: false,
    },
  },
  {
    id: 'tpl-pause-subs',
    label: 'Pause Low-Usage OTT & Food Perks',
    subtitle: 'Reclaim ₹548/mo in locked subscriptions',
    decision: {
      title: 'Kill-Switch Unused Subscriptions',
      type: 'pause_subscriptions',
      amount: 548,
      triggerDay: 8,
      category: 'Subscriptions',
      isEssential: false,
    },
  },
  {
    id: 'tpl-savings-lock',
    label: 'Lock ₹1,000 Extra into Goa / Tech Vault',
    subtitle: 'Pay-yourself-first transfer today',
    decision: {
      title: 'Boost Priority Savings Vault',
      type: 'savings_boost',
      amount: 1000,
      triggerDay: 8,
      category: 'Savings Transfer',
      isEssential: true,
    },
  },
  {
    id: 'tpl-campus-gig',
    label: 'Take Weekend Tutoring / Design Sprint',
    subtitle: '+₹1,500 side income inflow',
    decision: {
      title: 'Weekend Design / Coding Micro-Gig',
      type: 'extra_income',
      amount: 1500,
      triggerDay: 10,
      category: 'Extra Income',
      isEssential: true,
    },
  },
];

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'balanced-campus',
    name: 'Balanced Campus Explorer (Day 8)',
    tagline: '₹10,000 monthly budget · Day 8 of 30 · Realistic mix of hostel mess, metro, OTT subs, and savings goals.',
    currentDay: 8,
    baseBudget: 10000,
    emergencyBuffer: 800,
    transactions: [
      { id: 'tx-1', day: 1, title: 'Hostel Co-living & Mess Advance Share', category: 'Commitments & Bills', amount: 2200, type: 'expense', isEssential: true, note: 'Monthly base shelter & weekday meals' },
      { id: 'tx-2', day: 2, title: 'Grocery & Breakfast Oats / Fruit Stock', category: 'Food & Dining', amount: 420, type: 'expense', isEssential: true, note: 'Kettle & room essentials' },
      { id: 'tx-3', day: 3, title: 'Metro Smart Card Recharge', category: 'Transport & Metro', amount: 350, type: 'expense', isEssential: true, note: 'Campus to internship commute' },
      { id: 'tx-4', day: 4, title: 'Late-Night Shawarma & Cold Coffee with Squad', category: 'Social & Hangouts', amount: 310, type: 'expense', isEssential: false, note: 'Post-assignment hangout' },
      { id: 'tx-5', day: 5, title: 'Spotify Student Plan Auto-Debit', category: 'Subscriptions', amount: 119, type: 'expense', isEssential: false, note: 'Monthly audio subscription' },
      { id: 'tx-6', day: 6, title: 'Stationery, Printouts & Lab Manual', category: 'Shopping & Essentials', amount: 240, type: 'expense', isEssential: true, note: 'Semester lab docs' },
      { id: 'tx-7', day: 7, title: 'Weekend Street Momo & Chai Run', category: 'Food & Dining', amount: 190, type: 'expense', isEssential: false, note: 'Evening snack' },
      { id: 'tx-8', day: 8, title: 'Auto-Rickshaw Split (Rainy Morning)', category: 'Transport & Metro', amount: 140, type: 'expense', isEssential: true, note: 'Avoided getting drenched' },
    ],
    commitments: [
      { id: 'cm-1', title: 'Hostel Co-living & Mess Share', category: 'Housing & Mess', amount: 2200, dueDay: 1, isPaid: true, mandatory: true },
      { id: 'cm-2', title: '5G Mobile Data & Unlimited Call Pack', category: 'Utilities & Connectivity', amount: 349, dueDay: 12, isPaid: false, mandatory: true },
      { id: 'cm-3', title: 'Shared Fiber Wi-Fi Split', category: 'Utilities & Connectivity', amount: 250, dueDay: 18, isPaid: false, mandatory: true },
      { id: 'cm-4', title: 'End-of-Month Mess Canteen Settlement', category: 'Housing & Mess', amount: 900, dueDay: 25, isPaid: false, mandatory: true },
    ],
    subscriptions: [
      { id: 'sub-1', name: 'Spotify Student Plan', category: 'Music & Audio', amount: 119, billingDay: 5, status: 'active', isSettledThisMonth: true, usageScore: 94 },
      { id: 'sub-2', name: 'Netflix Standard Screen Share', category: 'Entertainment', amount: 199, billingDay: 11, status: 'active', isSettledThisMonth: false, usageScore: 42 },
      { id: 'sub-3', name: 'Zomato Gold / Swiggy One Renewal', category: 'Food Delivery Perk', amount: 149, billingDay: 15, status: 'active', isSettledThisMonth: false, usageScore: 35 },
      { id: 'sub-4', name: 'Campus Gym & Strength Club', category: 'Fitness', amount: 400, billingDay: 20, status: 'active', isSettledThisMonth: false, usageScore: 85 },
      { id: 'sub-5', name: 'Cloud Pro Storage + AI Notes', category: 'Productivity & Cloud', amount: 199, billingDay: 24, status: 'active', isSettledThisMonth: false, usageScore: 28 },
    ],
    savingsGoals: [
      { id: 'sg-1', name: 'Pondicherry / Goa Semester Break Fund', targetAmount: 2500, savedAmount: 650, priority: 'High', autoDailyContribution: 25, description: 'Train tickets & hostel booking with batchmates' },
      { id: 'sg-2', name: 'SSD & Mechanical Keyboard Upgrade', targetAmount: 1800, savedAmount: 450, priority: 'Medium', autoDailyContribution: 15, description: 'Hardware upgrade for dev workflow' },
      { id: 'sg-3', name: 'AWS / Cloud Practitioner Exam Voucher', targetAmount: 1200, savedAmount: 300, priority: 'High', autoDailyContribution: 10, description: 'Resume credential before placement season' },
    ],
    unexpectedEvents: DEFAULT_UNEXPECTED_EVENTS,
  },
  {
    id: 'mid-month-crunch',
    name: 'Mid-Month Burn Crunch (Day 18)',
    tagline: '₹10,000 budget · Day 18 of 30 · High early-month food & hangout spend threatening a Day 26 overdraft.',
    currentDay: 18,
    baseBudget: 10000,
    emergencyBuffer: 350,
    transactions: [
      { id: 'mc-1', day: 1, title: 'PG Room & Maintenance Share', category: 'Commitments & Bills', amount: 2500, type: 'expense', isEssential: true },
      { id: 'mc-2', day: 3, title: 'Weekend Sneaker Pop-up & Hoodie', category: 'Shopping & Essentials', amount: 1450, type: 'expense', isEssential: false },
      { id: 'mc-3', day: 5, title: 'Spotify Student Auto-Debit', category: 'Subscriptions', amount: 119, type: 'expense', isEssential: false },
      { id: 'mc-4', day: 7, title: 'Biryani & Boba Delivery Order', category: 'Food & Dining', amount: 540, type: 'expense', isEssential: false },
      { id: 'mc-5', day: 9, title: 'Laptop Charger Emergency Replacement', category: 'Unexpected Shock', amount: 1250, type: 'expense', isEssential: true },
      { id: 'mc-6', day: 11, title: 'Netflix Screen Share Debit', category: 'Subscriptions', amount: 199, type: 'expense', isEssential: false },
      { id: 'mc-7', day: 12, title: '5G Mobile Data Pack', category: 'Commitments & Bills', amount: 349, type: 'expense', isEssential: true },
      { id: 'mc-8', day: 14, title: 'Friend Birthday Rooftop Split', category: 'Social & Hangouts', amount: 750, type: 'expense', isEssential: false },
      { id: 'mc-9', day: 15, title: 'Zomato Gold Renewal', category: 'Subscriptions', amount: 149, type: 'expense', isEssential: false },
      { id: 'mc-10', day: 16, title: 'Cab Rides & Metro Top-up', category: 'Transport & Metro', amount: 480, type: 'expense', isEssential: true },
      { id: 'mc-11', day: 18, title: 'Shared Fiber Wi-Fi Split', category: 'Commitments & Bills', amount: 250, type: 'expense', isEssential: true },
    ],
    commitments: [
      { id: 'mc-c1', title: 'PG Room & Maintenance Share', category: 'Housing & Mess', amount: 2500, dueDay: 1, isPaid: true, mandatory: true },
      { id: 'mc-c2', title: '5G Mobile Data Pack', category: 'Utilities & Connectivity', amount: 349, dueDay: 12, isPaid: true, mandatory: true },
      { id: 'mc-c3', title: 'Shared Fiber Wi-Fi Split', category: 'Utilities & Connectivity', amount: 250, dueDay: 18, isPaid: true, mandatory: true },
      { id: 'mc-c4', title: 'End-of-Month Mess Canteen Settlement', category: 'Housing & Mess', amount: 900, dueDay: 25, isPaid: false, mandatory: true },
    ],
    subscriptions: [
      { id: 'mc-s1', name: 'Spotify Student Plan', category: 'Music & Audio', amount: 119, billingDay: 5, status: 'active', isSettledThisMonth: true, usageScore: 90 },
      { id: 'mc-s2', name: 'Netflix Standard Screen Share', category: 'Entertainment', amount: 199, billingDay: 11, status: 'active', isSettledThisMonth: true, usageScore: 40 },
      { id: 'mc-s3', name: 'Zomato Gold Renewal', category: 'Food Delivery Perk', amount: 149, billingDay: 15, status: 'active', isSettledThisMonth: true, usageScore: 30 },
      { id: 'mc-s4', name: 'Campus Gym & Strength Club', category: 'Fitness', amount: 400, billingDay: 20, status: 'active', isSettledThisMonth: false, usageScore: 75 },
      { id: 'mc-s5', name: 'Cloud Pro Storage + AI Notes', category: 'Productivity & Cloud', amount: 199, billingDay: 24, status: 'active', isSettledThisMonth: false, usageScore: 25 },
    ],
    savingsGoals: [
      { id: 'mc-g1', name: 'Pondicherry / Goa Semester Break Fund', targetAmount: 2500, savedAmount: 400, priority: 'High', autoDailyContribution: 0, description: 'Paused due to mid-month cash crunch' },
      { id: 'mc-g2', name: 'SSD & Mechanical Keyboard Upgrade', targetAmount: 1800, savedAmount: 250, priority: 'Medium', autoDailyContribution: 0, description: 'Hardware upgrade' },
    ],
    unexpectedEvents: DEFAULT_UNEXPECTED_EVENTS.map(e =>
      e.day <= 14 ? { ...e, resolved: true, chosenOptionId: e.options[0].id } : e
    ),
  },
  {
    id: 'day-one-fresh',
    name: 'Fresh Day 1 Allocation (Day 1)',
    tagline: '₹10,000 untouched stipend on Day 1 · Design your entire 30-day blueprint from scratch.',
    currentDay: 1,
    baseBudget: 10000,
    emergencyBuffer: 1000,
    transactions: [
      { id: 'd1-1', day: 1, title: 'Hostel Co-living & Mess Advance Share', category: 'Commitments & Bills', amount: 2200, type: 'expense', isEssential: true, note: 'Day 1 base commitment settled' },
    ],
    commitments: [
      { id: 'd1-c1', title: 'Hostel Co-living & Mess Share', category: 'Housing & Mess', amount: 2200, dueDay: 1, isPaid: true, mandatory: true },
      { id: 'd1-c2', title: '5G Mobile Data Pack', category: 'Utilities & Connectivity', amount: 349, dueDay: 12, isPaid: false, mandatory: true },
      { id: 'd1-c3', title: 'Shared Fiber Wi-Fi Split', category: 'Utilities & Connectivity', amount: 250, dueDay: 18, isPaid: false, mandatory: true },
      { id: 'd1-c4', title: 'End-of-Month Mess Canteen Settlement', category: 'Housing & Mess', amount: 900, dueDay: 25, isPaid: false, mandatory: true },
    ],
    subscriptions: [
      { id: 'd1-s1', name: 'Spotify Student Plan', category: 'Music & Audio', amount: 119, billingDay: 5, status: 'active', isSettledThisMonth: false, usageScore: 95 },
      { id: 'd1-s2', name: 'Netflix Standard Screen Share', category: 'Entertainment', amount: 199, billingDay: 11, status: 'active', isSettledThisMonth: false, usageScore: 45 },
      { id: 'd1-s3', name: 'Zomato Gold Renewal', category: 'Food Delivery Perk', amount: 149, billingDay: 15, status: 'active', isSettledThisMonth: false, usageScore: 35 },
      { id: 'd1-s4', name: 'Campus Gym & Strength Club', category: 'Fitness', amount: 400, billingDay: 20, status: 'active', isSettledThisMonth: false, usageScore: 85 },
    ],
    savingsGoals: [
      { id: 'd1-g1', name: 'Pondicherry / Goa Semester Break Fund', targetAmount: 2500, savedAmount: 500, priority: 'High', autoDailyContribution: 30, description: 'Semester break travel fund' },
      { id: 'd1-g2', name: 'AWS / Cloud Exam Voucher', targetAmount: 1200, savedAmount: 300, priority: 'High', autoDailyContribution: 15, description: 'Certification fund' },
    ],
    unexpectedEvents: DEFAULT_UNEXPECTED_EVENTS,
  },
];
