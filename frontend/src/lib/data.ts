export const eventMeta = {
  name: "KNS and SLGS AI Innovation Programme 2026",
  tagline: "Facilitated by KNS in partnership with Sierra Leone Grammar School.",
  registrationDeadline: new Date("2026-08-15T23:59:59"),
  eventStart: new Date("2026-09-12T09:00:00"),
  eventEnd: new Date("2026-09-14T18:00:00"),
  prizePool: 125000,
};

export const liveStats = {
  participants: 40,
  teams: 3,
  mentors: 4,
  projects: 487,
  prizePool: 125000,
};

export const platforms = [
  {
    id: "vercel",
    name: "Vercel",
    url: "https://vercel.com/",
    role: "Build and host",
    note: "Where you ship Next.js apps. Deploy when you're ready to go live.",
  },
  {
    id: "supabase",
    name: "Supabase",
    url: "https://supabase.com/",
    role: "Database & auth",
    note: "Postgres, login, and backend services without running your own server.",
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/",
    role: "Code & version control",
    note: "Store your repo, open pull requests, and keep the team's work in sync.",
  },
  {
    id: "render",
    name: "Render",
    url: "https://render.com/",
    role: "Optional backend",
    note: "Use this if you're not on Next.js and need a backend or Postgres host.",
    optional: true,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    role: "Ideas & prompting",
    note: "Research, draft prompts, and unblock yourself when you're stuck.",
  },
  {
    id: "canva",
    name: "Canva",
    url: "https://www.canva.com/",
    role: "Design",
    note: "Pitch decks, posters, and slides for Demo Day.",
  },
];

// old export - use platforms
export const sponsors = platforms.map((p) => ({
  name: p.name,
  tier: p.optional ? "silver" : "platinum",
}));

export const programmeOverview = {
  title: "Programme Overview",
  subtitle:
    "A four week programme: two weeks of instructor led bootcamp on the fundamentals, then two weeks in assigned teams with mentors while you build your solution. Facilitated by KNS in partnership with Sierra Leone Grammar School.",
  stack: ["v0.dev", "Supabase", "Vercel"],
  footer: "KNS and SLGS AI Innovation Programme 2026",
  weeks: [
    {
      id: "week-1",
      label: "Week 1: Bootcamp foundations",
      icon: "calendar" as const,
      days: [
        {
          day: "Day 1",
          title: "Welcome & orientation",
          description: "Programme goals, expectations, and how the month is structured",
        },
        {
          day: "Day 2",
          title: "What is AI?",
          description: "How AI shows up in tools you already use",
        },
        {
          day: "Day 3",
          title: "How AI learns",
          description: "Training data, patterns, and predictions",
        },
        {
          day: "Day 4",
          title: "Prompting fundamentals",
          description: "Clear prompts and instructor led practice",
        },
      ],
    },
    {
      id: "week-2",
      label: "Week 2: Bootcamp tools",
      icon: "calendar" as const,
      days: [
        {
          day: "Day 5",
          title: "Design thinking",
          description: "Empathy maps, problem framing, and Sierra Leone challenges",
        },
        {
          day: "Day 6",
          title: "Build tools in action",
          description: "v0.dev, GitHub, and the programme stack with instructors",
        },
        {
          day: "Day 7",
          title: "Data & backends",
          description: "Supabase basics and wiring simple features",
        },
        {
          day: "Day 8",
          title: "Deploy practice",
          description: "Ship a small demo and prepare for team assignment",
        },
      ],
    },
    {
      id: "week-3",
      label: "Week 3: Teams & mentored build",
      icon: "rocket" as const,
      days: [
        {
          day: "Day 9",
          title: "Teams assigned",
          description: "Groups formed and matched with mentors",
        },
        {
          day: "Day 10",
          title: "Pick your problem",
          description: "Choose an official challenge and plan the solution",
        },
        {
          day: "Day 11",
          title: "Build sprint",
          description: "Start the app with mentor guidance",
        },
        {
          day: "Day 12",
          title: "Iterate with mentors",
          description: "Feedback loops, roles, and progress check-ins",
        },
      ],
    },
    {
      id: "week-4",
      label: "Week 4: Finish, ship & pitch",
      icon: "rocket" as const,
      days: [
        {
          day: "Day 13",
          title: "Polish the product",
          description: "Core flows, data, and reliability",
        },
        {
          day: "Day 14",
          title: "Deploy & docs",
          description: "Go live, prepare demo notes and pitch materials",
        },
        {
          day: "Day 15",
          title: "Rehearsal",
          description: "Practice the demo with your mentor",
        },
        {
          day: "Day 16",
          title: "Demo Day",
          description: "Present your solution to judges",
        },
      ],
    },
  ],
};

// flat list for anything still using the old timeline shape
export const timeline = programmeOverview.weeks.flatMap((week) =>
  week.days.map((d) => ({
    date: d.day,
    title: d.title,
    description: d.description,
  }))
);

export const faqs = [
  {
    q: "What is this programme?",
    a: "It's a four week AI programme for selected Sierra Leone Grammar School students. The first two weeks are an instructor led bootcamp on the fundamentals. The next two weeks you are grouped into teams, assigned mentors, and build your solution. Facilitated by KNS in partnership with SLGS.",
  },
  {
    q: "What if I've never coded before?",
    a: "That's fine. The opening bootcamp is designed to teach beginners the fundamentals with instructors. Mentors support you during the build weeks. Show up ready to learn and work with your team.",
  },
  {
    q: "Do I need a team?",
    a: "Yes, for the challenge phase. After the bootcamp, organizers place you in a group and assign a mentor. Stick with your group. Don't swap members without talking to organizers.",
  },
  {
    q: "What should I bring?",
    a: "Nothing. Organizers provide the computers and tools you'll use during the programme. Just show up ready to work with your team.",
  },
  {
    q: "What will we build?",
    a: "A working web app that addresses one of the published problem statements. Use the programme stack (v0.dev, Supabase, Vercel, and so on), deploy it, and demo it on pitch day.",
  },
  {
    q: "Can we work on our own idea or an old project?",
    a: "Yes, you can build from your own idea for a Sierra Leone problem. You cannot reuse an existing solution or bring an old project as your submission. The work for this programme must be new.",
  },
  {
    q: "How do we submit and get judged?",
    a: "Follow the programme deadlines, deploy your app, and present a live demo. Scoring covers solution quality, how well you met the challenge, your pitch, and teamwork. Full details are on the Grading page.",
  },
  {
    q: "What if our project isn't finished?",
    a: "Still demo what you have. Show what works, what you learned, and what you'd do next. Incomplete builds happen. Judges care about progress and honesty as much as polish.",
  },
  {
    q: "How do I use this site?",
    a: "Browse the public pages for programme info, challenges, timeline, FAQ, and grading. When you have an account, open your portal and sign in: participants manage their team, workspace, kanban, chats, and project submission; mentors review assigned teams; administrators run the programme. Use announcements and notifications in the portal for official updates.",
  },
  {
    q: "Who do I contact if I'm stuck?",
    a: "During bootcamp, ask your instructors. During the build weeks, ask your mentor first for build or team questions. For login or admin issues, use the contact details on the home page.",
  },
];

export type ChallengeIdea = {
  id: string;
  title: string;
  track: string;
  featured?: boolean;
  summary: string;
  problem: string;
  category: string;
  teams: number;
};

export const challenges: ChallengeIdea[] = [
  {
    id: "agri-opp-portal",
    title: "Find Farm Support",
    track: "Agriculture",
    featured: true,
    summary:
      "Government has farm grants, seeds, and training, but many young people never hear about them or know how to apply.",
    problem:
      "How can youth easily find and apply for farm support programs?",
    category: "Agriculture",
    teams: 0,
  },
  {
    id: "civic-problem-platform",
    title: "Report Community Problems",
    track: "Civic",
    featured: true,
    summary:
      "People complain about broken pipes, bad roads, and other issues on social media, but government has no clear way to see what matters most.",
    problem:
      "How can communities report local problems and show government which ones to fix first?",
    category: "Civic",
    teams: 0,
  },
  {
    id: "salone-blessed",
    title: "Tell Unity Stories",
    track: "Media",
    featured: true,
    summary:
      "Online talk often divides people, while good stories of youth working together stay hidden.",
    problem:
      "How can we share live stories of youth from different places building together?",
    category: "Media",
    teams: 0,
  },
  {
    id: "gov-info-chatbot",
    title: "Check Fake News & Scams",
    track: "Safety",
    featured: true,
    summary:
      "False WhatsApp messages and online scams spread fast, and people have nowhere trusted to check the truth or report fraud.",
    problem:
      "How can citizens quickly verify viral messages and report cyber scams?",
    category: "Safety",
    teams: 0,
  },
  {
    id: "market-price-radar",
    title: "Know Fair Market Prices",
    track: "Agriculture",
    summary:
      "Farmers often sell crops cheap because they do not know the fair price in other towns.",
    problem:
      "How can a farmer check todayâ€™s fair price before selling?",
    category: "Agriculture",
    teams: 0,
  },
  {
    id: "clinic-queue-smart",
    title: "Find a Faster Clinic",
    track: "Health",
    summary:
      "People waste hours in clinic lines without knowing which nearby clinic is freer.",
    problem:
      "How can a parent find which nearby clinic can help sooner?",
    category: "Health",
    teams: 0,
  },
  {
    id: "school-fee-clarity",
    title: "Understand School Fees",
    track: "Education",
    summary:
      "Families struggle to understand school fees and what help is available.",
    problem:
      "How can parents clearly see school costs and available support?",
    category: "Education",
    teams: 0,
  },
  {
    id: "waste-pickup-map",
    title: "Report Missed Rubbish",
    track: "Environment",
    summary:
      "Rubbish piles up when pickup is missed and nobody has a shared way to report it.",
    problem:
      "How can a community report missed rubbish pickup and show the worst spots?",
    category: "Environment",
    teams: 0,
  },
  {
    id: "transport-fare-fair",
    title: "Fair Okada & Poda Fares",
    track: "Transport",
    summary:
      "Riders and passengers argue about fares because there is no shared guide for common trips.",
    problem:
      "How can people know a fair fare before they board?",
    category: "Transport",
    teams: 0,
  },
  {
    id: "flood-early-alert",
    title: "Flood Early Warning",
    track: "Climate",
    summary:
      "Flood warnings often come too late for families to move to safety.",
    problem:
      "How can flood-prone communities get earlier warnings they understand?",
    category: "Climate",
    teams: 0,
  },
  {
    id: "job-skills-matcher",
    title: "Match Skills to Jobs",
    track: "Jobs",
    summary:
      "Young people finish school but struggle to see which jobs or training fit their skills.",
    problem:
      "How can a graduate find fitting jobs and what to learn next?",
    category: "Jobs",
    teams: 0,
  },
  {
    id: "blood-donor-network",
    title: "Find Blood Donors Fast",
    track: "Health",
    summary:
      "When blood is urgently needed, families still depend on calling people one by one.",
    problem:
      "How can hospitals reach the right blood donors faster?",
    category: "Health",
    teams: 0,
  },
  {
    id: "water-point-status",
    title: "Report Broken Water Pumps",
    track: "Water",
    summary:
      "Broken pumps leave communities without water, and repair teams often hear too late.",
    problem:
      "How can people report a broken pump and track when it will be fixed?",
    category: "Water",
    teams: 0,
  },
  {
    id: "exam-prep-tutor",
    title: "Exam Study Helper",
    track: "Education",
    summary:
      "Many students prepare for BECE and WASSCE without enough practice on their weak topics.",
    problem:
      "How can a student get exam practice that focuses on what they struggle with?",
    category: "Education",
    teams: 0,
  },
  {
    id: "small-business-bookkeeping",
    title: "Track Small Business Sales",
    track: "Business",
    summary:
      "Small traders often keep sales in notebooks or memory, so profit is hard to see.",
    problem:
      "How can a trader easily record sales and see daily profit?",
    category: "Business",
    teams: 0,
  },
  {
    id: "maternal-care-navigator",
    title: "Guide Pregnant Mothers",
    track: "Health",
    summary:
      "First-time mothers often miss clinic visits because they lack clear guidance.",
    problem:
      "How can a pregnant mother know what to do and where to go at each stage?",
    category: "Health",
    teams: 0,
  },
  {
    id: "land-dispute-guide",
    title: "Explain Land Papers",
    track: "Justice",
    summary:
      "Land disputes grow because people do not understand documents or which office to visit.",
    problem:
      "How can someone understand a land paper and know the next step?",
    category: "Justice",
    teams: 0,
  },
  {
    id: "disability-access-map",
    title: "Find Accessible Places",
    track: "Inclusion",
    summary:
      "People with disabilities often arrive somewhere and find stairs-only access.",
    problem:
      "How can someone check wheelchair access before leaving home?",
    category: "Inclusion",
    teams: 0,
  },
  {
    id: "fisheries-catch-log",
    title: "Log Fish Catch & Prices",
    track: "Agriculture",
    summary:
      "Fishers lack a simple way to track catch and know a fair selling price.",
    problem:
      "How can fishing communities log catch and avoid selling too cheap?",
    category: "Fisheries",
    teams: 0,
  },
  {
    id: "power-outage-reporter",
    title: "Report Power Cuts",
    track: "Energy",
    summary:
      "Power cuts are talked about online, but there is no shared map of which streets are dark.",
    problem:
      "How can residents report blackouts so crews see the worst areas?",
    category: "Energy",
    teams: 0,
  },
  {
    id: "tourism-local-guide",
    title: "Trusted Local Tourism",
    track: "Tourism",
    summary:
      "Visitors struggle to find trusted local guides and fair prices.",
    problem:
      "How can travellers find trusted local experiences without getting scammed?",
    category: "Tourism",
    teams: 0,
  },
  {
    id: "drug-expiry-alert",
    title: "Track Medicine Expiry",
    track: "Health",
    summary:
      "Small pharmacies lose money and put patients at risk when medicine expires unnoticed.",
    problem:
      "How can a pharmacy track low stock and near-expiry medicine on a phone?",
    category: "Health",
    teams: 0,
  },
  {
    id: "community-savings-circle",
    title: "Keep Osusu Records Clear",
    track: "Business",
    summary:
      "Savings groups break down when contribution records are unclear or disputed.",
    problem:
      "How can an osusu group keep shared records everyone can trust?",
    category: "Business",
    teams: 0,
  },
  {
    id: "road-hazard-reporter",
    title: "Report Bad Roads",
    track: "Transport",
    summary:
      "Potholes and dangerous roads are known locally but rarely reported with clear evidence.",
    problem:
      "How can people report road hazards with photos so councils fix the worst ones first?",
    category: "Transport",
    teams: 0,
  },
];

export const featuredChallenges = challenges.filter((c) => c.featured);
