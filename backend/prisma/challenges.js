// Published problem statements. Codes map to slugs (A1 -> a1, JU1 -> ju1).
const challenges = [
  {
    slug: "a1",
    title: "Fair Farm Market Prices",
    track: "Agriculture",
    category: "Agriculture",
    featured: true,
    summary:
      "Farmers and young produce sellers may hear different prices for the same crop in nearby markets. Without an easy comparison, they may sell too cheaply or travel to the wrong market.",
    problem: "Compare recent market prices and estimate a fair price range.",
  },
  {
    slug: "a2",
    title: "Local Weather and Planting Guide",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "General weather reports do not always explain what rain or heat means for a particular crop. Farmers need simple guidance on when to plant, water or harvest.",
    problem:
      "Combine local weather, crop type and season to give simple activity reminders.",
  },
  {
    slug: "a3",
    title: "Crop Pest and Disease Photo Check",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "Leaves and fruits can show spots, colour changes or damage that farmers do not recognise early. Waiting too long can allow a pest or disease to spread.",
    problem:
      "Compare an uploaded crop photo with labelled examples and show verified next steps.",
  },
  {
    slug: "a4",
    title: "Reducing Harvest and Fish Spoilage",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "Fruit, vegetables and fish can spoil before reaching buyers, especially when storage and transport are limited. Families lose food and income when they cannot judge spoilage risk.",
    problem:
      "Estimate spoilage risk from product type, time, weather and storage conditions.",
  },
  {
    slug: "a5",
    title: "School Garden and Family Farm Support Finder",
    track: "Agriculture",
    category: "Agriculture",
    summary:
      "Students helping with school gardens or family farms may not know where to find suitable seeds, tools, training or youth-friendly farming support. Notices are scattered and may arrive after deadlines.",
    problem:
      "Match a crop, district, age and stated need with verified inputs or support.",
  },
  {
    slug: "c1",
    title: "Community Issue Reporting and Repair Tracking",
    track: "Civic",
    category: "Civic",
    featured: true,
    summary:
      "Students and residents see potholes, blocked drains, broken lights or damaged public facilities. Reports may be repeated, incomplete or sent to the wrong place. After an issue is reported, the community may not know whether anyone accepted the report or completed the repair. This reduces trust and encourages repeated complaints.",
    problem:
      "Classify reports, detect duplicates, group them by location and urgency, then link reports with updates, photos, repair status and flag overdue cases.",
  },
  {
    slug: "c2",
    title: "Track School and Community Project Promises",
    track: "Civic",
    category: "Civic",
    summary:
      "Students hear promises about classrooms, toilets, water points, roads or youth centres but may not know the budget, deadline or progress. Without a simple tracker, they cannot compare promises with what was delivered.",
    problem:
      "Summarise project notices and updates, then flag missing or late progress.",
  },
  {
    slug: "c3",
    title: "Find Documents and Public Services for School Life",
    track: "Civic",
    category: "Civic",
    summary:
      "Students and families may need birth certificates, identification or other documents for school, examinations and applications. They can waste time visiting the wrong office or arriving without the correct requirements.",
    problem:
      "Answer from verified official information and create a service checklist.",
  },
  {
    slug: "c5",
    title: "Summarise Young People's Ideas",
    track: "Civic",
    category: "Civic",
    summary:
      "Schools and youth groups may collect many suggestions, but leaders cannot read and compare every comment. Important ideas can be missed.",
    problem:
      "Group similar ideas and produce a balanced summary for human review.",
  },
  {
    slug: "b1",
    title: "Simple Sales and Expense Records",
    track: "Business",
    category: "Business",
    featured: true,
    summary:
      "Small shops and student businesses may keep sales and expenses in memory or on paper. They cannot easily tell whether they made a profit or lost money.",
    problem:
      "Turn uploaded voice notes or receipt photos into simple sales and expense records.",
  },
  {
    slug: "b2",
    title: "Stock and Restocking Helper",
    track: "Business",
    category: "Business",
    summary:
      "A shop may run out of popular items while keeping products that are not selling. Owners often decide what to buy again without enough information.",
    problem:
      "Learn from past sales and suggest which items may need restocking.",
  },
  {
    slug: "b3",
    title: "Product Price and Profit Helper",
    track: "Business",
    category: "Business",
    summary:
      "Young sellers may set a price without adding the cost of materials, transport and other expenses. A product can sell well while still losing money.",
    problem:
      "Learn from past costs, sales and market prices to recommend a profitable price range.",
  },
  {
    slug: "b4",
    title: "Customer Feedback for Small Businesses",
    track: "Business",
    category: "Business",
    summary:
      "Customers may give comments through messages, voice notes or short reviews. Small businesses struggle to identify the most common complaints and requests.",
    problem:
      "Group customer comments into themes and summarise what should be improved.",
  },
  {
    slug: "b5",
    title: "Youth Group and Family Osusu Records",
    track: "Business",
    category: "Business",
    summary:
      "School clubs, youth groups and family osusu schemes may record contributions on paper or in messages. Missing or conflicting entries can cause arguments and make it difficult to know who has paid.",
    problem:
      "Turn voice or text entries into records and flag missing or conflicting payments.",
  },
  {
    slug: "e1",
    title: "Online Curriculum Learning Helper",
    track: "Education",
    category: "Education",
    featured: true,
    summary:
      "Students may not have a tutor after school and can struggle to find trusted curriculum-based explanations online. They need one simple learning platform that works well on phones and uses little data.",
    problem:
      "Answer curriculum-based questions and generate simple explanations and practice.",
  },
  {
    slug: "e2",
    title: "BECE and WASSCE Practice Feedback",
    track: "Education",
    category: "Education",
    summary:
      "Students may practise BECE or WASSCE questions without knowing why an answer is wrong. Repeated mistakes remain hidden.",
    problem:
      "Mark practice answers, explain mistakes and recommend the next topic to study.",
  },
  {
    slug: "e3",
    title: "Personal Study Planner",
    track: "Education",
    category: "Education",
    summary:
      "Many students study only the subjects they enjoy or wait until examinations are close. They need a realistic plan based on available time and weak topics.",
    problem:
      "Create and adjust a weekly study plan from subjects, goals and quiz results.",
  },
  {
    slug: "e4",
    title: "Find Learning Gaps from Quizzes",
    track: "Education",
    category: "Education",
    summary:
      "A teacher may see the class score but not the exact concepts most students misunderstood. This makes targeted revision difficult.",
    problem: "Analyse quiz answers and group common mistakes by topic.",
  },
  {
    slug: "e5",
    title: "Teacher Lesson and Quiz Support",
    track: "Education",
    category: "Education",
    summary:
      "Teachers have limited time to prepare curriculum-aligned lessons, examples, classroom activities and quizzes for different ability levels. Students benefit when lessons include clearer and more varied practice.",
    problem:
      "Draft curriculum-aligned lesson plans, examples, classroom activities and quizzes for teacher review.",
  },
  {
    slug: "en1",
    title: "Power-Cut Reporting and Pattern Map",
    track: "Energy",
    category: "Energy",
    featured: true,
    summary:
      "Power cuts can interrupt homework, phone charging and school activities. Individual reports do not show which places or times are affected most often.",
    problem:
      "Group outage reports and show patterns by location, date and duration.",
  },
  {
    slug: "en2",
    title: "School and Home Energy-Waste Checker",
    track: "Energy",
    category: "Energy",
    summary:
      "Lights, fans and other appliances may remain on when they are not needed. Schools and homes spend more money and have less power for important tasks.",
    problem:
      "Analyse user-entered appliance and usage records and suggest where energy is wasted.",
  },
  {
    slug: "en3",
    title: "Homework Solar and Charging Size Guide",
    track: "Energy",
    category: "Energy",
    summary:
      "Families and schools may want enough solar power for phones, lamps, tablets or laptops used for learning. Students need a simple way to compare these devices and estimate a suitable small setup.",
    problem:
      "Use a device-and-hours form and example setups to recommend a suitable size range.",
  },
  {
    slug: "en4",
    title: "Report Solar and Charging Problems",
    track: "Energy",
    category: "Energy",
    summary:
      "A phone may charge slowly, a lamp may stop working or a solar battery may drain too quickly. Students and families need a simple way to describe the problem before visiting a technician.",
    problem:
      "Analyse photos and selected symptoms, then prepare a report and technician referral.",
  },
  {
    slug: "en5",
    title: "Phone and Device Charging Planner",
    track: "Energy",
    category: "Energy",
    summary:
      "Students often depend on a limited battery or charging time for phones, lamps and learning devices. Poor charging choices can leave important devices unavailable.",
    problem:
      "Plan charging times from user-entered battery levels, available power and priorities.",
  },
  {
    slug: "h1",
    title: "Find the Right Clinic or Health Service",
    track: "Health",
    category: "Health",
    featured: true,
    summary:
      "A student or family may travel to a clinic that does not provide the needed service or is closed. This wastes money and delays help.",
    problem:
      "Match a stated need with verified nearby health services and opening times.",
  },
  {
    slug: "h2",
    title: "Trusted Adolescent Health Information",
    track: "Health",
    category: "Health",
    summary:
      "Teenagers may receive confusing or false information about puberty, sexual health, nutrition and substance use. They need private access to trusted information.",
    problem:
      "Answer age-appropriate questions using approved health content and show sources.",
  },
  {
    slug: "h3",
    title: "Mental Wellbeing and Support Finder",
    track: "Health",
    category: "Health",
    summary:
      "Stress, grief, bullying and examination pressure can affect students, but they may not know whom to talk to. Some avoid asking for help because of stigma.",
    problem:
      "Recognise concerns in a private check-in and direct users to trusted human support.",
  },
  {
    slug: "h4",
    title: "Menstrual Health and School Support",
    track: "Health",
    category: "Health",
    summary:
      "Some students miss lessons because they lack clear menstrual-health information, supplies or school support. Embarrassment can stop them from asking questions or seeking help.",
    problem:
      "Answer questions from approved content and match students with available menstrual-health and school support services.",
  },
  {
    slug: "h5",
    title: "School and Home First-Aid Expiry Alerts",
    track: "Health",
    category: "Health",
    summary:
      "Medicines and first-aid supplies kept at school or home can pass their expiry date without anyone noticing. Students helping to check a first-aid box need an easy way to record dates and receive reminders.",
    problem:
      "Read dates from label photos, organise the first-aid list and send replacement reminders.",
  },
  {
    slug: "t1",
    title: "Fair Okada and Poda-Poda Fares",
    track: "Transport",
    category: "Transport",
    featured: true,
    summary:
      "Students and families may not know whether an okada or poda-poda fare is fair for a route. Disagreements make travel costs unpredictable.",
    problem:
      "Estimate a fare range from route, distance, time and recent verified fares.",
  },
  {
    slug: "t2",
    title: "Route and Arrival-Time Information",
    track: "Transport",
    category: "Transport",
    summary:
      "Passengers often do not know which route is faster or when transport is likely to arrive. They can be late for school or wait in unsafe places.",
    problem:
      "Estimate travel and arrival times from route and recent journey information.",
  },
  {
    slug: "t3",
    title: "Report Road Hazards",
    track: "Transport",
    category: "Transport",
    summary:
      "Road hazards that affect transportation, such as potholes, damaged bridges, fallen trees, missing road signs and flooded roads, may be reported late or several times. Missing locations make repairs harder to prioritise.",
    problem:
      "Identify hazards in uploaded photos, capture map locations and merge duplicate reports.",
  },
  {
    slug: "t4",
    title: "Safer Routes to School",
    track: "Transport",
    category: "Transport",
    summary:
      "The shortest route to school may have dangerous crossings, speeding traffic or poor lighting. Students and parents need safer choices.",
    problem:
      "Score route risks and suggest safer walking or transport options.",
  },
  {
    slug: "t5",
    title: "Traffic Hotspots Near Schools",
    track: "Transport",
    category: "Transport",
    summary:
      "Traffic near school entrances can become crowded and dangerous at opening and closing times. Schools may not know the worst locations or periods.",
    problem:
      "Find traffic hotspots from reports, counts or map data and show peak times.",
  },
  {
    slug: "i1",
    title: "Find Accessible Places",
    track: "Inclusion",
    category: "Inclusion",
    featured: true,
    summary:
      "A building may be called accessible but still lack a ramp, suitable toilet or clear entrance. People need details that match their own mobility or access needs.",
    problem:
      "Extract accessibility features from reports and match places to a user's needs.",
  },
  {
    slug: "i2",
    title: "Make Learning Materials Easier to Access",
    track: "Inclusion",
    category: "Inclusion",
    summary:
      "Some learning materials have small text, difficult words or images without explanations. Students with visual, reading or learning difficulties can be left behind.",
    problem:
      "Convert material into larger text, simpler language, audio or image descriptions.",
  },
  {
    slug: "i3",
    title: "Classroom Captions",
    track: "Inclusion",
    category: "Inclusion",
    summary:
      "Deaf and hard-of-hearing students may miss spoken instructions and class discussions. This affects participation and learning.",
    problem:
      "Turn live or uploaded classroom speech into captions and short summaries.",
  },
  {
    slug: "i4",
    title: "Plain-Language and Krio Information",
    track: "Inclusion",
    category: "Inclusion",
    summary:
      "Formal English and text-heavy notices can be difficult for people who prefer Krio or audio. Important information then reaches fewer people.",
    problem:
      "Explain verified information in plain English, Krio or speech.",
  },
  {
    slug: "i5",
    title: "Find Disability Support",
    track: "Inclusion",
    category: "Inclusion",
    summary:
      "Families may not know where to find assistive devices, inclusive education or disability support. They can contact several organisations without finding the right service.",
    problem:
      "Match a person's stated need and location with verified support services.",
  },
  {
    slug: "j1",
    title: "Explore Career Paths",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    featured: true,
    summary:
      "Students may know the subjects they enjoy but not which careers use those subjects. They also need to understand the skills and training each path requires.",
    problem:
      "Match interests and school subjects with career options and explain the steps.",
  },
  {
    slug: "j2",
    title: "Find Age-Appropriate Scholarships and Competitions",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    summary:
      "Scholarships, school competitions, youth programmes and short internships are posted in many places. Students can miss deadlines or apply for opportunities that do not accept their age.",
    problem:
      "Verify and recommend opportunities by age, school level, interests and location.",
  },
  {
    slug: "j3",
    title: "Build a Personal Skills Plan",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    summary:
      "A student may want a career but not know which skills to develop first. Long lists of courses can make the choice confusing.",
    problem:
      "Compare current skills with a chosen goal and create a simple learning plan.",
  },
  {
    slug: "j4",
    title: "Create a CV and Skills Portfolio",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    summary:
      "Students often have school projects, volunteering or practical experience but no CV or portfolio. They find it hard to explain what they can do.",
    problem:
      "Turn activities and project evidence into a clear CV and skills portfolio.",
  },
  {
    slug: "j5",
    title: "Practise Interviews and Presentations",
    track: "Jobs and Opportunities",
    category: "Jobs and Opportunities",
    summary:
      "Interviews and presentations can be difficult when students have little chance to practise. They need useful feedback without embarrassment.",
    problem:
      "Run practice questions and give feedback on clarity, relevance and confidence.",
  },
  {
    slug: "ju1",
    title: "Know Your Rights and Responsibilities",
    track: "Justice",
    category: "Justice",
    featured: true,
    summary:
      "Young people may not clearly understand their rights, responsibilities and school rules. This can make it difficult to recognise unfair treatment or make a proper complaint.",
    problem:
      "Explain verified rights and responsibilities in simple, age-appropriate language.",
  },
  {
    slug: "ju2",
    title:
      "Report and Track Cyberbullying, Online Scams and School Complaints",
    track: "Justice",
    category: "Justice",
    summary:
      "Cyberbullying, impersonation, online scams and school-related complaints affect teenagers, but many do not know what evidence to keep, where to report the problem or how to follow up afterwards. This confusion can discourage students from seeking help or checking the progress of their case.",
    problem:
      "Classify the incident, provide safe verified reporting steps, explain the reporting process, track safe status updates and prompt trusted-adult follow-up.",
  },
  {
    slug: "ju3",
    title: "Find Legal Aid or Child-Protection Support",
    track: "Justice",
    category: "Justice",
    summary:
      "A student or family may need legal aid, child-protection help or a trusted reporting service. The correct organisation is not always easy to identify.",
    problem:
      "Match the issue and location with verified legal-aid or protection services.",
  },
  {
    slug: "ju4",
    title: "Understand School Forms and Simple Agreements",
    track: "Justice",
    category: "Justice",
    summary:
      "Students may be asked to accept school forms, online terms, club rules or simple work agreements without understanding the important conditions. Difficult language can hide responsibilities, costs or risks.",
    problem:
      "Highlight key terms and explain them in age-appropriate plain language.",
  },
];

module.exports = { challenges };
