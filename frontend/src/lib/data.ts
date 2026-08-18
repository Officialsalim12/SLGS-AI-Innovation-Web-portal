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
          description:
            "Pick a problem from the list or bring your own idea, then plan the solution",
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
    a: "A working web app that solves a real Sierra Leone problem. You can pick one of the published problem statements or build from your own idea. Use the programme stack (v0.dev, Supabase, Vercel, and so on), deploy it, and demo it on pitch day.",
  },
  {
    q: "Can we work on our own idea or an old project?",
    a: "Yes. Your team can bring your own idea for a Sierra Leone problem. You do not have to use only the listed challenges. You cannot reuse an existing solution or bring an old project as your submission. The work for this programme must be new.",
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
    a: "Browse the public pages for programme info, challenges, timeline, mentors and judges, FAQ, and grading. When you have an account, open your portal and sign in: participants manage their team, workspace, kanban, chats, and project submission; mentors review assigned teams; administrators run the programme. Use announcements and notifications in the portal for official updates.",
  },
  {
    q: "Who do I contact if I'm stuck?",
    a: "During bootcamp, ask your instructors. During the build weeks, ask your mentor first for build or team questions. For login or admin issues, use the contact details on the home page.",
  },
];

export type ChallengeIdea = {
  id: string;
  code: string;
  title: string;
  track: string;
  featured?: boolean;
  selected?: boolean;
  summary: string;
  direction: string;
  category: string;
  teams: number;
};

export const challengeTracks = [
  {
    name: "Agriculture",
    description:
      "These problems focus on crops, fish, farm decisions, markets and reducing food loss—situations students can see in farming families and communities.",
  },
  {
    name: "Civic",
    description:
      "These problems focus on reporting local issues, understanding public services and helping young people take part in community decisions.",
  },
  {
    name: "Business",
    description:
      "These problems focus on simple records, stock, prices, customers and osusu groups familiar to family shops and student businesses.",
  },
  {
    name: "Education",
    description:
      "These online software problems focus on studying, examinations, quizzes and teacher support within everyday secondary-school learning.",
  },
  {
    name: "Energy",
    description:
      "These online software problems use reports, forms and uploaded information to address power cuts, energy waste, solar support and device charging.",
  },
  {
    name: "Health",
    description:
      "These problems focus on trusted health information, wellbeing, menstrual health, medicine safety and finding appropriate human support. Safety requirement: prototypes must not diagnose, prescribe treatment or replace health professionals and emergency services.",
  },
  {
    name: "Transport",
    description:
      "These problems focus on fares, travel times, road hazards and safer journeys to and from school.",
  },
  {
    name: "Inclusion",
    description:
      "These problems focus on making places, lessons and information easier to use for people with different disabilities, languages and literacy needs.",
  },
  {
    name: "Jobs and Opportunities",
    description:
      "These problems help students explore careers, find opportunities, build skills and prepare to present what they can do.",
  },
  {
    name: "Justice",
    description:
      "These problems focus on youth rights, online harm, trusted support, simple documents and understandable complaint processes.",
  },
] as const;

export const challenges: ChallengeIdea[] = [
  {
    id: "homework-tracking",
    code: "E6",
    title: "Homework Tracking Software",
    track: "Education",
    category: "Education",
    selected: true,
    summary:
      "Students often struggle to keep track of homework, deadlines, learning materials, and feedback from teachers. Teachers may also find it difficult to monitor which students have completed assignments and which students need additional support. At the same time, parents may have limited visibility into their children's academic progress and upcoming assignments. The lack of a centralized system connecting teachers, students, and parents can lead to missed deadlines, poor communication, and unnecessary academic stress.",
    direction:
      "Give teachers, students and parents one place for assignments, deadlines, materials, feedback and completion status.",
    teams: 1,
  },
  {
    id: "volunteer-connect",
    code: "C6",
    title: "VolunteerConnect",
    track: "Civic",
    category: "Civic",
    selected: true,
    summary:
      "Many communities, organisations, and individuals are willing to volunteer their time and skills, but there is often no efficient way to connect volunteers with organisations and community projects that need their support. This can result in volunteer opportunities going unnoticed while organisations struggle to find suitable people to help with their activities. The absence of an organized platform for discovering, matching, and coordinating volunteer opportunities creates a gap between people who want to contribute and communities that need support.",
    direction:
      "Match volunteers with organisations and community projects by skills, location and availability.",
    teams: 1,
  },
  {
    id: "know-yu-bodi",
    code: "H6",
    title: "Know Yu Bodi",
    track: "Health",
    category: "Health",
    selected: true,
    summary:
      "Many young people enter puberty without having access to clear, reliable, age-appropriate information about the physical, emotional, and social changes they are experiencing. Cultural barriers, embarrassment, misinformation, and limited access to trusted educational resources can make it difficult for young people to ask questions or understand what is happening to their bodies. This lack of accessible and trustworthy information can lead to confusion, fear, stigma, and unhealthy decisions.",
    direction:
      "Provide clear, age-appropriate puberty information that young people can trust and explore privately. Do not diagnose or replace health professionals.",
    teams: 1,
  },
  {
    id: "personal-skill-planner",
    code: "J6",
    title: "Personal Skill Planner",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    selected: true,
    summary:
      "Many students and young people want to develop skills that will help them succeed academically and professionally, but they often lack a clear understanding of which skills they need, how to prioritize them, and how to track their progress. Without structured goals and a personalized development plan, learning can become inconsistent and difficult to measure. This makes it harder for young people to identify skill gaps, stay motivated, and prepare themselves for future education or employment opportunities.",
    direction:
      "Help students identify skill gaps, set goals and track a personal development plan.",
    teams: 1,
  },
  {
    id: "schools-administration-portal",
    code: "E7",
    title: "Schools Administration Portal (ADP)",
    track: "Education",
    category: "Education",
    selected: true,
    summary:
      "Many schools rely on manual or disconnected processes to manage student records, attendance, academic information, communication, and administrative activities. This can make it difficult for administrators and teachers to access accurate information quickly and can create unnecessary paperwork, delays, and errors. Parents and students may also have limited access to important school information. The absence of a centralized digital administration system can reduce efficiency and make it harder for schools to effectively manage their day-to-day operations.",
    direction:
      "Give schools one digital place for student records, attendance, academics, communication and day-to-day administration.",
    teams: 1,
  },
  {
    id: "a1",
    code: "A1",
    title: "Fair Farm Market Prices",
    track: "Agriculture",
    category: "Agriculture",
    featured: true,
    summary:
      "Farmers and young produce sellers may hear different prices for the same crop in nearby markets. Without an easy comparison, they may sell too cheaply or travel to the wrong market.",
    direction: "Compare recent market prices and estimate a fair price range.",
    teams: 0,
  },
  {
    id: "a2",
    code: "A2",
    title: "Local Weather and Planting Guide",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "General weather reports do not always explain what rain or heat means for a particular crop. Farmers need simple guidance on when to plant, water or harvest.",
    direction:
      "Combine local weather, crop type and season to give simple activity reminders.",
    teams: 0,
  },
  {
    id: "a3",
    code: "A3",
    title: "Crop Pest and Disease Photo Check",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "Leaves and fruits can show spots, colour changes or damage that farmers do not recognise early. Waiting too long can allow a pest or disease to spread.",
    direction:
      "Compare an uploaded crop photo with labelled examples and show verified next steps.",
    teams: 0,
  },
  {
    id: "a4",
    code: "A4",
    title: "Reducing Harvest and Fish Spoilage",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "Fruit, vegetables and fish can spoil before reaching buyers, especially when storage and transport are limited. Families lose food and income when they cannot judge spoilage risk.",
    direction:
      "Estimate spoilage risk from product type, time, weather and storage conditions.",
    teams: 0,
  },
  {
    id: "a5",
    code: "A5",
    title: "School Garden and Family Farm Support Finder",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "Students helping with school gardens or family farms may not know where to find suitable seeds, tools, training or youth-friendly farming support. Notices are scattered and may arrive after deadlines.",
    direction:
      "Match a crop, district, age and stated need with verified inputs or support.",
    teams: 0,
  },
  {
    id: "c1",
    code: "C1",
    title: "Community Issue Reporting and Repair Tracking",
    track: "Civic",
    category: "Civic",
    featured: true,
    summary:
      "Students and residents see potholes, blocked drains, broken lights or damaged public facilities. Reports may be repeated, incomplete or sent to the wrong place. After an issue is reported, the community may not know whether anyone accepted the report or completed the repair. This reduces trust and encourages repeated complaints.",
    direction:
      "Classify reports, detect duplicates, group them by location and urgency, then link reports with updates, photos, repair status and flag overdue cases.",
    teams: 0,
  },
  {
    id: "c2",
    code: "C2",
    title: "Track School and Community Project Promises",
    track: "Civic",
    category: "Civic",
    summary:
      "Students hear promises about classrooms, toilets, water points, roads or youth centres but may not know the budget, deadline or progress. Without a simple tracker, they cannot compare promises with what was delivered.",
    direction:
      "Summarise project notices and updates, then flag missing or late progress.",
    teams: 0,
  },
  {
    id: "c3",
    code: "C3",
    title: "Find Documents and Public Services for School Life",
    track: "Civic",
    category: "Civic",
    summary:
      "Students and families may need birth certificates, identification or other documents for school, examinations and applications. They can waste time visiting the wrong office or arriving without the correct requirements.",
    direction:
      "Answer from verified official information and create a service checklist.",
    teams: 0,
  },
  {
    id: "c5",
    code: "C5",
    title: "Summarise Young People's Ideas",
    track: "Civic",
    category: "Civic",
    summary:
      "Schools and youth groups may collect many suggestions, but leaders cannot read and compare every comment. Important ideas can be missed.",
    direction:
      "Group similar ideas and produce a balanced summary for human review.",
    teams: 0,
  },
  {
    id: "b1",
    code: "B1",
    title: "Simple Sales and Expense Records",
    track: "Business",
    category: "Business",
    featured: true,
    summary:
      "Small shops and student businesses may keep sales and expenses in memory or on paper. They cannot easily tell whether they made a profit or lost money.",
    direction:
      "Turn uploaded voice notes or receipt photos into simple sales and expense records.",
    teams: 0,
  },
  {
    id: "b2",
    code: "B2",
    title: "Stock and Restocking Helper",
    track: "Business",
    category: "Business",
    summary:
      "A shop may run out of popular items while keeping products that are not selling. Owners often decide what to buy again without enough information.",
    direction:
      "Learn from past sales and suggest which items may need restocking.",
    teams: 0,
  },
  {
    id: "b3",
    code: "B3",
    title: "Product Price and Profit Helper",
    track: "Business",
    category: "Business",
    summary:
      "Young sellers may set a price without adding the cost of materials, transport and other expenses. A product can sell well while still losing money.",
    direction:
      "Learn from past costs, sales and market prices to recommend a profitable price range.",
    teams: 0,
  },
  {
    id: "b4",
    code: "B4",
    title: "Customer Feedback for Small Businesses",
    track: "Business",
    category: "Business",
    summary:
      "Customers may give comments through messages, voice notes or short reviews. Small businesses struggle to identify the most common complaints and requests.",
    direction:
      "Group customer comments into themes and summarise what should be improved.",
    teams: 0,
  },
  {
    id: "b5",
    code: "B5",
    title: "Youth Group and Family Osusu Records",
    track: "Business",
    category: "Business",
    summary:
      "School clubs, youth groups and family osusu schemes may record contributions on paper or in messages. Missing or conflicting entries can cause arguments and make it difficult to know who has paid.",
    direction:
      "Turn voice or text entries into records and flag missing or conflicting payments.",
    teams: 0,
  },
  {
    id: "e1",
    code: "E1",
    title: "Online Curriculum Learning Helper",
    track: "Education",
    category: "Education",
    featured: true,
    summary:
      "Students may not have a tutor after school and can struggle to find trusted curriculum-based explanations online. They need one simple learning platform that works well on phones and uses little data.",
    direction:
      "Answer curriculum-based questions and generate simple explanations and practice.",
    teams: 0,
  },
  {
    id: "e2",
    code: "E2",
    title: "BECE and WASSCE Practice Feedback",
    track: "Education",
    category: "Education",
    summary:
      "Students may practise BECE or WASSCE questions without knowing why an answer is wrong. Repeated mistakes remain hidden.",
    direction:
      "Mark practice answers, explain mistakes and recommend the next topic to study.",
    teams: 0,
  },
  {
    id: "e3",
    code: "E3",
    title: "Personal Study Planner",
    track: "Education",
    category: "Education",
    summary:
      "Many students study only the subjects they enjoy or wait until examinations are close. They need a realistic plan based on available time and weak topics.",
    direction:
      "Create and adjust a weekly study plan from subjects, goals and quiz results.",
    teams: 0,
  },
  {
    id: "e4",
    code: "E4",
    title: "Find Learning Gaps from Quizzes",
    track: "Education",
    category: "Education",
    summary:
      "A teacher may see the class score but not the exact concepts most students misunderstood. This makes targeted revision difficult.",
    direction: "Analyse quiz answers and group common mistakes by topic.",
    teams: 0,
  },
  {
    id: "e5",
    code: "E5",
    title: "Teacher Lesson and Quiz Support",
    track: "Education",
    category: "Education",
    summary:
      "Teachers have limited time to prepare curriculum-aligned lessons, examples, classroom activities and quizzes for different ability levels. Students benefit when lessons include clearer and more varied practice.",
    direction:
      "Draft curriculum-aligned lesson plans, examples, classroom activities and quizzes for teacher review.",
    teams: 0,
  },
  {
    id: "en1",
    code: "EN1",
    title: "Power-Cut Reporting and Pattern Map",
    track: "Energy",
    category: "Energy",
    featured: true,
    summary:
      "Power cuts can interrupt homework, phone charging and school activities. Individual reports do not show which places or times are affected most often.",
    direction:
      "Group outage reports and show patterns by location, date and duration.",
    teams: 0,
  },
  {
    id: "en2",
    code: "EN2",
    title: "School and Home Energy-Waste Checker",
    track: "Energy",
    category: "Energy",
    summary:
      "Lights, fans and other appliances may remain on when they are not needed. Schools and homes spend more money and have less power for important tasks.",
    direction:
      "Analyse user-entered appliance and usage records and suggest where energy is wasted.",
    teams: 0,
  },
  {
    id: "en3",
    code: "EN3",
    title: "Homework Solar and Charging Size Guide",
    track: "Energy",
    category: "Energy",
    summary:
      "Families and schools may want enough solar power for phones, lamps, tablets or laptops used for learning. Students need a simple way to compare these devices and estimate a suitable small setup.",
    direction:
      "Use a device-and-hours form and example setups to recommend a suitable size range.",
    teams: 0,
  },
  {
    id: "en4",
    code: "EN4",
    title: "Report Solar and Charging Problems",
    track: "Energy",
    category: "Energy",
    summary:
      "A phone may charge slowly, a lamp may stop working or a solar battery may drain too quickly. Students and families need a simple way to describe the problem before visiting a technician.",
    direction:
      "Analyse photos and selected symptoms, then prepare a report and technician referral.",
    teams: 0,
  },
  {
    id: "en5",
    code: "EN5",
    title: "Phone and Device Charging Planner",
    track: "Energy",
    category: "Energy",
    summary:
      "Students often depend on a limited battery or charging time for phones, lamps and learning devices. Poor charging choices can leave important devices unavailable.",
    direction:
      "Plan charging times from user-entered battery levels, available power and priorities.",
    teams: 0,
  },
  {
    id: "h1",
    code: "H1",
    title: "Find the Right Clinic or Health Service",
    track: "Health",
    category: "Health",
    featured: true,
    summary:
      "A student or family may travel to a clinic that does not provide the needed service or is closed. This wastes money and delays help.",
    direction:
      "Match a stated need with verified nearby health services and opening times.",
    teams: 0,
  },
  {
    id: "h2",
    code: "H2",
    title: "Trusted Adolescent Health Information",
    track: "Health",
    category: "Health",
    summary:
      "Teenagers may receive confusing or false information about puberty, sexual health, nutrition and substance use. They need private access to trusted information.",
    direction:
      "Answer age-appropriate questions using approved health content and show sources.",
    teams: 0,
  },
  {
    id: "h3",
    code: "H3",
    title: "Mental Wellbeing and Support Finder",
    track: "Health",
    category: "Health",
    summary:
      "Stress, grief, bullying and examination pressure can affect students, but they may not know whom to talk to. Some avoid asking for help because of stigma.",
    direction:
      "Recognise concerns in a private check-in and direct users to trusted human support.",
    teams: 0,
  },
  {
    id: "h4",
    code: "H4",
    title: "Menstrual Health and School Support",
    track: "Health",
    category: "Health",
    summary:
      "Some students miss lessons because they lack clear menstrual-health information, supplies or school support. Embarrassment can stop them from asking questions or seeking help.",
    direction:
      "Answer questions from approved content and match students with available menstrual-health and school support services.",
    teams: 0,
  },
  {
    id: "h5",
    code: "H5",
    title: "School and Home First-Aid Expiry Alerts",
    track: "Health",
    category: "Health",
    summary:
      "Medicines and first-aid supplies kept at school or home can pass their expiry date without anyone noticing. Students helping to check a first-aid box need an easy way to record dates and receive reminders.",
    direction:
      "Read dates from label photos, organise the first-aid list and send replacement reminders.",
    teams: 0,
  },
  {
    id: "t1",
    code: "T1",
    title: "Fair Okada and Poda-Poda Fares",
    track: "Transport",
    category: "Transport",
    featured: true,
    summary:
      "Students and families may not know whether an okada or poda-poda fare is fair for a route. Disagreements make travel costs unpredictable.",
    direction:
      "Estimate a fare range from route, distance, time and recent verified fares.",
    teams: 0,
  },
  {
    id: "t2",
    code: "T2",
    title: "Route and Arrival-Time Information",
    track: "Transport",
    category: "Transport",
    summary:
      "Passengers often do not know which route is faster or when transport is likely to arrive. They can be late for school or wait in unsafe places.",
    direction:
      "Estimate travel and arrival times from route and recent journey information.",
    teams: 0,
  },
  {
    id: "t3",
    code: "T3",
    title: "Report Road Hazards",
    track: "Transport",
    category: "Transport",
    summary:
      "Road hazards that affect transportation, such as potholes, damaged bridges, fallen trees, missing road signs and flooded roads, may be reported late or several times. Missing locations make repairs harder to prioritise.",
    direction:
      "Identify hazards in uploaded photos, capture map locations and merge duplicate reports.",
    teams: 0,
  },
  {
    id: "t4",
    code: "T4",
    title: "Safer Routes to School",
    track: "Transport",
    category: "Transport",
    summary:
      "The shortest route to school may have dangerous crossings, speeding traffic or poor lighting. Students and parents need safer choices.",
    direction:
      "Score route risks and suggest safer walking or transport options.",
    teams: 0,
  },
  {
    id: "t5",
    code: "T5",
    title: "Traffic Hotspots Near Schools",
    track: "Transport",
    category: "Transport",
    summary:
      "Traffic near school entrances can become crowded and dangerous at opening and closing times. Schools may not know the worst locations or periods.",
    direction:
      "Find traffic hotspots from reports, counts or map data and show peak times.",
    teams: 0,
  },
  {
    id: "i1",
    code: "I1",
    title: "Find Accessible Places",
    track: "Inclusion",
    category: "Inclusion",
    featured: true,
    summary:
      "A building may be called accessible but still lack a ramp, suitable toilet or clear entrance. People need details that match their own mobility or access needs.",
    direction:
      "Extract accessibility features from reports and match places to a user's needs.",
    teams: 0,
  },
  {
    id: "i2",
    code: "I2",
    title: "Make Learning Materials Easier to Access",
    track: "Inclusion",
    category: "Inclusion",
    summary:
      "Some learning materials have small text, difficult words or images without explanations. Students with visual, reading or learning difficulties can be left behind.",
    direction:
      "Convert material into larger text, simpler language, audio or image descriptions.",
    teams: 0,
  },
  {
    id: "i3",
    code: "I3",
    title: "Classroom Captions",
    track: "Inclusion",
    category: "Inclusion",
    summary:
      "Deaf and hard-of-hearing students may miss spoken instructions and class discussions. This affects participation and learning.",
    direction:
      "Turn live or uploaded classroom speech into captions and short summaries.",
    teams: 0,
  },
  {
    id: "i4",
    code: "I4",
    title: "Plain-Language and Krio Information",
    track: "Inclusion",
    category: "Inclusion",
    summary:
      "Formal English and text-heavy notices can be difficult for people who prefer Krio or audio. Important information then reaches fewer people.",
    direction:
      "Explain verified information in plain English, Krio or speech.",
    teams: 0,
  },
  {
    id: "i5",
    code: "I5",
    title: "Find Disability Support",
    track: "Inclusion",
    category: "Inclusion",
    summary:
      "Families may not know where to find assistive devices, inclusive education or disability support. They can contact several organisations without finding the right service.",
    direction:
      "Match a person's stated need and location with verified support services.",
    teams: 0,
  },
  {
    id: "j1",
    code: "J1",
    title: "Explore Career Paths",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    featured: true,
    summary:
      "Students may know the subjects they enjoy but not which careers use those subjects. They also need to understand the skills and training each path requires.",
    direction:
      "Match interests and school subjects with career options and explain the steps.",
    teams: 0,
  },
  {
    id: "j2",
    code: "J2",
    title: "Find Age-Appropriate Scholarships and Competitions",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    summary:
      "Scholarships, school competitions, youth programmes and short internships are posted in many places. Students can miss deadlines or apply for opportunities that do not accept their age.",
    direction:
      "Verify and recommend opportunities by age, school level, interests and location.",
    teams: 0,
  },
  {
    id: "j3",
    code: "J3",
    title: "Build a Personal Skills Plan",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    summary:
      "A student may want a career but not know which skills to develop first. Long lists of courses can make the choice confusing.",
    direction:
      "Compare current skills with a chosen goal and create a simple learning plan.",
    teams: 0,
  },
  {
    id: "j4",
    code: "J4",
    title: "Create a CV and Skills Portfolio",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    summary:
      "Students often have school projects, volunteering or practical experience but no CV or portfolio. They find it hard to explain what they can do.",
    direction:
      "Turn activities and project evidence into a clear CV and skills portfolio.",
    teams: 0,
  },
  {
    id: "j5",
    code: "J5",
    title: "Practise Interviews and Presentations",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    summary:
      "Interviews and presentations can be difficult when students have little chance to practise. They need useful feedback without embarrassment.",
    direction:
      "Run practice questions and give feedback on clarity, relevance and confidence.",
    teams: 0,
  },
  {
    id: "ju1",
    code: "JU1",
    title: "Know Your Rights and Responsibilities",
    track: "Justice",
    category: "Justice",
    featured: true,
    summary:
      "Young people may not clearly understand their rights, responsibilities and school rules. This can make it difficult to recognise unfair treatment or make a proper complaint.",
    direction:
      "Explain verified rights and responsibilities in simple, age-appropriate language.",
    teams: 0,
  },
  {
    id: "ju2",
    code: "JU2",
    title:
      "Report and Track Cyberbullying, Online Scams and School Complaints",
    track: "Justice",
    category: "Justice",
    summary:
      "Cyberbullying, impersonation, online scams and school-related complaints affect teenagers, but many do not know what evidence to keep, where to report the problem or how to follow up afterwards. This confusion can discourage students from seeking help or checking the progress of their case.",
    direction:
      "Classify the incident, provide safe verified reporting steps, explain the reporting process, track safe status updates and prompt trusted-adult follow-up.",
    teams: 0,
  },
  {
    id: "ju3",
    code: "JU3",
    title: "Find Legal Aid or Child-Protection Support",
    track: "Justice",
    category: "Justice",
    summary:
      "A student or family may need legal aid, child-protection help or a trusted reporting service. The correct organisation is not always easy to identify.",
    direction:
      "Match the issue and location with verified legal-aid or protection services.",
    teams: 0,
  },
  {
    id: "ju4",
    code: "JU4",
    title: "Understand School Forms and Simple Agreements",
    track: "Justice",
    category: "Justice",
    summary:
      "Students may be asked to accept school forms, online terms, club rules or simple work agreements without understanding the important conditions. Difficult language can hide responsibilities, costs or risks.",
    direction:
      "Highlight key terms and explain them in age-appropriate plain language.",
    teams: 0,
  },
];

export const featuredChallenges = challenges.filter((c) => c.featured);

export type ProgrammeProfile = {
  id: string;
  name: string;
  title: string;
  photo: string;
  photoPosition?: string;
  focus: string[];
  bio: string;
};

export const programmeMentors: ProgrammeProfile[] = [
  {
    id: "abdul-salim-gani",
    name: "Abdul Salim Gani",
    title: "Software and Project Lead, KNS",
    photo: "/images/brand/abdul-salim-gani.webp",
    focus: [
      "Full-stack engineering",
      "Product & architecture",
      "APIs & cloud",
      "AI integrations",
    ],
    bio: `Abdul Salim Gani is a double bachelor's graduate from Cyprus West University, where he studied on a scholarship. He is a Software and Project Lead at Knowledge Network Solutions (KNS), working across software development, product delivery, and project leadership.

He began in hospitality operations in Cyprus, then moved into technology as a freelance full-stack developer building web applications for companies. He has also competed in national and international hackathons, with teams that have won and reached finals. His technical work covers software architecture, APIs, databases, cloud, and AI integrations.

What drives him is building solutions that last. That same vision sits behind DiscoverSalone, an initiative he is creating to showcase Sierra Leone while supporting local businesses, communities, tourism, and the country's digital transformation.`,
  },
  {
    id: "samuel-olu-gibson",
    name: "Samuel Olu Gibson",
    title: "Project Support Engineer & IT Trainer",
    photo: "/images/brand/samuel-olu-gibson.jpeg",
    focus: [
      "Project management",
      "Technical documentation",
      "Product strategy",
      "Digital transformation",
    ],
    bio: `Samuel Olu Gibson is a Project Support Engineer and IT Trainer with a background in Electrical and Electronics Engineering. He specialises in project management, technical documentation, product strategy, and digital transformation.

He has experience leading projects, developing training programmes, and designing scalable SaaS platforms. His strengths include leadership, systems thinking, and bridging the gap between technical execution and business objectives.`,
  },
  {
    id: "mohamed-super-dumbuya",
    name: "Mohamed Super Dumbuya",
    title: "Software Engineer & Tech Educator",
    photo: "/images/brand/mohamed-super-dumbuya.webp",
    focus: [
      "Software development",
      "AI",
      "Education tech",
      "Youth opportunity",
    ],
    bio: `Mohamed Super Dumbuya is a software engineer, tech educator, and entrepreneur. He is co-founder of Tech Inspire SL and Lead Developer at UniGuide, where he builds digital solutions that improve education and opportunities for young people in Sierra Leone.

He is passionate about software development, AI, and using technology to solve real-world problems.`,
  },
  {
    id: "alex-alison-sesay",
    name: "Alex Alison Sesay",
    title: "IT Trainer & Cybersecurity Analyst, KNS",
    photo: "/images/brand/alex-alison-sesay.webp",
    focus: [
      "Cybersecurity",
      "SIEM infrastructure",
      "SOC services",
      "Network administration",
    ],
    bio: `Alex Alison Sesay began his education at Sierra Leone Grammar School before studying Computer Science at Central University SL, formerly Canadian University, where he graduated as one of the top students in his class.

He gained hands-on experience in software development before moving into IT and cybersecurity. Alex is now a certified cybersecurity professional working as an IT Trainer and Cybersecurity Analyst at Knowledge Network Solutions (KNS).

At KNS, he manages SIEM infrastructure, SOC as a service deployments, and network administration.`,
  },
  {
    id: "abdul-majid-bah",
    name: "Abdul Majid Bah",
    title: "Software Engineering Intern",
    photo: "/images/brand/abdul-majid-bah.webp",
    focus: ["Software engineering", "Tutoring", "Student support"],
    bio: `Abdul Majid Bah is a software engineering intern and tutor at Knowledge Network Solutions (KNS). He supports learners with practical software skills and helps students build with confidence during the programme.`,
  },
];

export const programmeJudges: ProgrammeProfile[] = [
  {
    id: "olufemi-anthony",
    name: "Olufemi Anthony",
    title: "Staff Forward Deployed Engineer, Databricks",
    photo: "/images/brand/olufemi-anthony.jpg",
    focus: [
      "Databricks",
      "Data engineering",
      "Apache Spark",
      "Big data",
    ],
    bio: `Olufemi Anthony is a Staff Forward Deployed Engineer at Databricks, based in the New York City metropolitan area. He previously spent more than two years as a Resident Solutions Architect at Databricks, helping organisations put large-scale data platforms into production.

He is a Sierra Leone Grammar School alumnus. He holds a Bachelor of Science in Mathematics and Computer Science from the Massachusetts Institute of Technology and a Master's in Technology Management from the University of Pennsylvania.

His work centres on data engineering, Apache Spark, SQL, Python, and databases, with a focus on turning complex data problems into working systems.`,
  },
  {
    id: "olivia-jonah",
    name: "Olivia Jonah",
    title: "Founder & Principal Consultant, Ophel Consultancy Services",
    photo: "/images/brand/olivia-jonah.jpeg",
    focus: [
      "AI & automation",
      "Portfolio management",
      "Digital transformation",
      "Data analytics",
    ],
    bio: `Olivia Jonah is an IT portfolio management professional, AI specialist, consultant, product owner, and technology strategist based in the United States. She has more than 15 years of experience leading enterprise technology initiatives across telecommunications, financial services, education, and IT consulting.

She is recognised for delivering strategic technology solutions through portfolio management, PMO governance, Agile delivery, business intelligence, data analytics, digital transformation, and stakeholder engagement.

As the founder and principal consultant of Ophel Consultancy Services, Olivia helps organisations harness artificial intelligence, automation, and innovative technologies to improve operational performance and achieve their business objectives.

She is an Annie Walsh Memorial School (AWMS) alumnus.`,
  },
  {
    id: "joe-yilla",
    name: "Joe Yilla",
    title:
      "Executive Secretary, Sierra Leone Chamber of Commerce, Industry and Agriculture",
    photo: "/images/brand/joe-yilla.jpg",
    focus: [
      "Trade & private sector",
      "Entrepreneurship",
      "Institution building",
      "Technology & AI",
    ],
    bio: `Joe Yilla is Executive Secretary of the Sierra Leone Chamber of Commerce, Industry and Agriculture, where he leads the Secretariat and helps strengthen the Chamber's role in private-sector development, trade facilitation, business advocacy, and institutional growth.

He is also the founder of KNESST, a venture design studio focused on turning ideas, skills, and creativity into viable enterprises, income opportunities, and long-term economic value. Through KNESST and related initiatives, he has worked with founders, organisations, and communities to design and deliver entrepreneurship programmes, incubation initiatives, developer challenges, and design-led platforms grounded in practical execution.

His work sits at the intersection of trade and private-sector development, institution building and economic productivity, entrepreneurship and innovation ecosystems, technology, AI and digital transformation, and talent development.

He holds a Master's in Accounting and Finance from BPP University and writes and speaks about how African countries can turn ideas, resources, and geographic advantages into more productive economies.`,
  },
  {
    id: "melvin-emlyn-king",
    name: "Ing. Melvin Emlyn King",
    title: "Deputy Director of Engineering & Infrastructure",
    photo: "/images/brand/melvin-emlyn-king.jpeg",
    photoPosition: "center top",
    focus: [
      "Engineering & infrastructure",
      "IoT & smart cities",
      "Quality of service",
      "Project management",
    ],
    bio: `Ing. Melvin Emlyn King is Deputy Director of Engineering & Infrastructure. He is a qualified project manager with PMP certification, and holds a BSc in Electrical and Electronics Engineering and a Master's in Communications Management.

He served as Vice Chairman for Africa for ITU-T Study Group 20 on the Internet of Things, Smart Cities and Communities. He has been an active member of ITU-T Study Group 12 on Quality of Service and Quality of Experience since 2017, and has participated in AI preparedness workshops organised by the Ministry of Communication, Technology and Innovation (MOCTI).

He is a Regentonian and a Sierra Leone Grammar School alumnus, class of 1997.`,
  },
];
