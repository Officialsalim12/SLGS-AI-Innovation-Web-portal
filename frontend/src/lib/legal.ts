export const LEGAL = {
  programmeName: "AI Innovation Bootcamp & Challenge",
  shortName: "AI Innovation Bootcamp & Challenge",
  facilitator: "KNS",
  facilitatorFull: "KNS",
  partner: "Sierra Leone Grammar School",
  partnerShort: "SLGS",
  operator: "KNS",
  operatorShort: "KNS",
  lastUpdated: "23 July 2026",
  lastUpdatedIso: "2026-07-23",
  email: "salim@kns.sl",
  whatsappDisplay: "+232 79 594 218",
  whatsappHref: "https://wa.me/23279594218",
  address: "18 Dundas Street, Freetown, Sierra Leone",
  retentionYears: 2,
  partnershipLine:
    "Facilitated by KNS in partnership with Sierra Leone Grammar School (SLGS).",
} as const;

export type LegalBlock = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  after?: string[];
  subsections?: {
    id: string;
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
};

export const termsOfUse: {
  title: string;
  intro: string;
  sections: LegalBlock[];
} = {
  title: "Terms of Use",
  intro: `${LEGAL.programmeName}. ${LEGAL.partnershipLine} By using this Site you agree to these Terms.`,
  sections: [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      paragraphs: [
        `By accessing or using this website (the "Site"), operated and facilitated by ${LEGAL.facilitator} ("${LEGAL.operatorShort}," "we," "us," or "our") in partnership with ${LEGAL.partner} ("${LEGAL.partnerShort}") for the ${LEGAL.shortName} (the "Programme" or "Competition"), you agree to be bound by these Terms of Use ("Terms"). If you are under 18, you must have permission from a parent or legal guardian to use the Site and participate in the Programme.`,
        "If you do not agree to these Terms, please do not use the Site.",
      ],
    },
    {
      id: "roles",
      title: "2. User Roles",
      paragraphs: [
        "The Site supports three account types, matching the portals on this platform, each with defined responsibilities and access levels:",
      ],
      subsections: [
        {
          id: "participants",
          title: "2.1 Participants",
          paragraphs: [
            "Students registered to compete as part of an assigned team. Participants are responsible for:",
          ],
          bullets: [
            "Providing accurate registration and profile information",
            "Submitting original project work by stated deadlines through Project Submission",
            "Using team tools (workspace, kanban, chats) appropriately",
            "Complying with the Programme Code of Conduct (Section 5) and onboarding requirements",
          ],
        },
        {
          id: "mentors",
          title: "2.2 Mentors",
          paragraphs: [
            "Individuals guiding assigned participant teams. Mentors are responsible for:",
          ],
          bullets: [
            "Providing accurate professional and contact information",
            "Supporting assigned teams in an advisory capacity via mentorship tools on the Site",
            "Reviewing submitted projects where applicable",
            "Maintaining appropriate, respectful conduct with students at all times",
          ],
        },
        {
          id: "administrators",
          title: "2.3 Administrators",
          paragraphs: [
            "Staff or organisers from KNS and partners responsible for:",
          ],
          bullets: [
            "Managing user accounts, teams, mentors, and platform access",
            "Overseeing programme logistics, announcements, submissions, and scoring",
            "Ensuring compliance with these Terms and the Privacy Policy",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      title: "3. Eligibility",
      bullets: [
        "Participants must be currently enrolled students meeting the age/grade criteria set by the Programme organisers.",
        "Mentors must be approved by KNS (in coordination with SLGS where required) before being granted ongoing access and team assignments.",
        "Administrators are appointed by KNS.",
      ],
      paragraphs: [
        "KNS reserves the right to verify eligibility and deny or revoke access at its discretion, in partnership with SLGS.",
      ],
    },
    {
      id: "accounts",
      title: "4. Account Registration & Security",
      bullets: [
        "Users must provide accurate, current, and complete information during registration and onboarding.",
        "Users are responsible for maintaining the confidentiality of their login credentials.",
        "Users must notify Administrators immediately of any unauthorised use of their account.",
        "KNS is not liable for any loss arising from a User's failure to protect their account credentials.",
      ],
    },
    {
      id: "conduct",
      title: "5. Code of Conduct",
      paragraphs: ["All Users agree to:"],
      bullets: [
        "Treat other Users, mentors, judges, and organisers with respect",
        "Submit only original work; plagiarism or misrepresentation of authorship will result in disqualification",
        "Build from a listed problem statement or their own idea for a Sierra Leone problem, but not submit an existing solution or old project as new work",
        "Refrain from posting offensive, discriminatory, or harmful content in chats, workspaces, or submissions",
        "Not attempt to hack, disrupt, or misuse the Site or its data",
        "Not use the platform to collect or misuse another User's personal information",
      ],
      after: [
        "Violation of this Code of Conduct may result in suspension, disqualification, or removal from the Programme and the Site.",
      ],
    },
    {
      id: "ip",
      title: "6. Intellectual Property",
      bullets: [
        "Participant submissions (code, designs, documentation, videos, pitch materials, etc.) remain the intellectual property of the Participant(s) who created them, unless otherwise agreed in writing.",
        "By submitting a project, Participants grant KNS and SLGS a non exclusive, royalty free licence to display, reproduce, and promote the submission (for example on the Site, in press materials, or at showcase events) for purposes related to the Programme.",
        "Participants and Mentors must not submit or upload content that infringes on the intellectual property rights of others.",
      ],
    },
    {
      id: "rules",
      title: "7. Programme Rules",
      paragraphs: [
        "Specific programme rules, grading criteria, submission formats, timelines, and deadlines are published on the Site (including Timeline, Challenges, Grading, and FAQ) and form part of these Terms by reference. It is each Participant's and Mentor's responsibility to review and comply with these rules.",
      ],
    },
    {
      id: "termination",
      title: "8. Disqualification & Termination",
      paragraphs: ["KNS reserves the right to:"],
      bullets: [
        "Disqualify any Participant or team for violations of these Terms or the Code of Conduct",
        "Suspend or terminate any User's account for misuse of the platform",
        "Modify, postpone, or cancel the Programme at its discretion, with reasonable notice where possible, in coordination with SLGS",
      ],
    },
    {
      id: "disclaimer",
      title: "9. Disclaimer of Warranties",
      paragraphs: [
        'The Site and Programme are provided on an "as is" and "as available" basis. KNS makes no warranties, express or implied, regarding the availability, accuracy, or reliability of the Site.',
      ],
    },
    {
      id: "liability",
      title: "10. Limitation of Liability",
      paragraphs: [
        "To the fullest extent permitted by law, KNS and SLGS shall not be liable for any indirect, incidental, or consequential damages arising from use of the Site or participation in the Programme, including but not limited to data loss, technical failures, or disputes between Users.",
      ],
    },
    {
      id: "privacy",
      title: "11. Privacy",
      paragraphs: [
        "Use of the Site is also governed by our Privacy Policy, which explains how we collect, use, and protect personal data.",
      ],
    },
    {
      id: "changes",
      title: "12. Changes to These Terms",
      paragraphs: [
        'KNS may update these Terms from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms. The "Last updated" date at the top of this page will reflect the most recent revision.',
      ],
    },
    {
      id: "law",
      title: "13. Governing Law",
      paragraphs: [
        "These Terms shall be governed by and interpreted in accordance with the laws of the Republic of Sierra Leone.",
      ],
    },
    {
      id: "contact",
      title: "14. Contact Us",
      paragraphs: [
        "For questions about these Terms:",
        `${LEGAL.programmeName} (facilitated by KNS in partnership with SLGS)`,
        `Email: ${LEGAL.email}`,
        `WhatsApp: ${LEGAL.whatsappDisplay}`,
        `Address: ${LEGAL.address}`,
      ],
    },
  ],
};

export const privacyPolicy: {
  title: string;
  intro: string;
  sections: LegalBlock[];
} = {
  title: "Privacy Policy",
  intro: `How KNS, facilitating the ${LEGAL.shortName} in partnership with SLGS, collects, uses, and protects personal information on this Site.`,
  sections: [
    {
      id: "intro",
      title: "1. Introduction",
      paragraphs: [
        `This Privacy Policy explains how ${LEGAL.facilitator} ("${LEGAL.operatorShort}," "we," "us," or "our"), facilitating the ${LEGAL.shortName} in partnership with ${LEGAL.partner} ("${LEGAL.partnerShort}"), collects, uses, stores, and protects personal information submitted through this website (the "Site") by Participants, Mentors, and Administrators (collectively, "Users").`,
        "By registering on or signing in to the Site, you agree to the practices described in this Policy. If you do not agree, please do not use the Site.",
      ],
    },
    {
      id: "who",
      title: "2. Who We Collect Data From",
      paragraphs: ["This Policy applies to three categories of Users:"],
      bullets: [
        "Participants: students competing in the Programme through the Participant Portal",
        "Mentors: teachers, professionals, or volunteers guiding assigned teams through the Mentor Portal",
        "Administrators: KNS and partner staff who manage the platform, users, and competition data through the Admin Portal",
      ],
    },
    {
      id: "collect",
      title: "3. Information We Collect",
      subsections: [
        {
          id: "participants",
          title: "3.1 Participants",
          bullets: [
            "Full name, email address, and profile details provided during registration and onboarding",
            "Team membership, team role (for example Project Lead or Member), and mentor assignments",
            "Workspace content, kanban tasks, chat messages, and notifications generated on the Site",
            "Project submissions and related files or links (repository, demo, pitch deck, documents, prototypes)",
            "Login credentials (email and encrypted password)",
            "Parent/guardian name and contact information when required for participants under 18",
          ],
        },
        {
          id: "mentors",
          title: "3.2 Mentors",
          bullets: [
            "Full name, contact details, and professional role or title",
            "Assigned teams and related review activity",
            "Login credentials",
            "Communication records with assigned teams when facilitated through the Site",
          ],
        },
        {
          id: "admins",
          title: "3.3 Administrators",
          bullets: [
            "Full name, staff/role designation, and contact details",
            "Login credentials and access level permissions",
            "Activity necessary to manage users, teams, announcements, and submissions",
          ],
        },
        {
          id: "auto",
          title: "3.4 Automatically collected information",
          bullets: [
            "IP address, browser type, and device information where available",
            "Usage data (pages visited, session activity) via cookies or similar technologies, where applicable",
            "Theme preference stored locally on your device for the portal or public site",
          ],
        },
      ],
    },
    {
      id: "why",
      title: "4. Why We Collect This Information",
      paragraphs: ["We use collected data to:"],
      bullets: [
        "Register and verify Participants, Mentors, and Administrators",
        "Organise teams, assign mentors, and manage programme logistics",
        "Enable collaboration tools (workspace, kanban, chats) and project submission",
        "Evaluate and score submissions where applicable",
        "Communicate updates, schedules, announcements, and results",
        "Maintain platform security and prevent misuse",
        "Comply with school and partner policies and applicable law",
      ],
      after: ["We do not sell personal data to third parties."],
    },
    {
      id: "children",
      title: "5. Children's Privacy & Parental Consent",
      paragraphs: [
        "Many Participants are minors. For any Participant under the age of 18:",
      ],
      bullets: [
        "Registration and participation require permission from a parent or legal guardian",
        "A parent/guardian should provide consent before the minor's data is collected or their project is published publicly (for example on a leaderboard, results page, or showcase)",
        "Parents/guardians may request access to, correction of, or deletion of their child's data at any time by contacting us using the details in Section 10",
      ],
      after: [
        "We collect no more personal information from minors than is reasonably necessary to administer the Programme.",
      ],
    },
    {
      id: "share",
      title: "6. How We Share Information",
      paragraphs: [
        "We may share information only in the following circumstances:",
      ],
      bullets: [
        "Within the platform: Mentors can view their assigned teams' activity and submissions; Administrators can view user and competition data for management purposes",
        "With SLGS as programme partner, where needed to host, supervise, or recognise participants",
        "Judges/evaluators: project submissions and relevant participant/team names may be shared with competition judges or scoring processes",
        "Public showcase: with appropriate consent, featured projects, participant or team names, and related materials may be published on the Site or promotional materials",
        "Legal requirements: if required by law, regulation, or to protect the rights, safety, or property of KNS, SLGS, or others",
        "Service providers: third party tools (for example hosting and email delivery) that support Site operation, under confidentiality obligations",
      ],
    },
    {
      id: "retention",
      title: "7. Data Retention",
      paragraphs: [
        `We retain personal data only as long as necessary for the Programme and any follow up reporting, recognition, or archival purposes, typically not exceeding ${LEGAL.retentionYears} years after the Programme concludes, unless a longer period is required by law or requested by the user for legitimate purposes (for example an alumni showcase).`,
      ],
    },
    {
      id: "security",
      title: "8. Data Security",
      paragraphs: [
        "We implement reasonable technical and organisational measures to protect personal data, including:",
      ],
      bullets: [
        "Encrypted password storage",
        "Role based access controls (Participant / Mentor / Administrator permissions)",
        "Secure hosting infrastructure",
      ],
      after: [
        "No system is completely secure; while we work to protect your data, we cannot guarantee absolute security.",
      ],
    },
    {
      id: "rights",
      title: "9. Your Rights",
      paragraphs: [
        "Subject to applicable law, Users (or a parent/guardian on behalf of a minor) may:",
      ],
      bullets: [
        "Request access to the personal data we hold about them",
        "Request correction of inaccurate data",
        "Request deletion of their data, subject to competition or record keeping requirements",
        "Withdraw consent for public display of their name, photo, or project",
      ],
      after: [
        "Requests can be submitted using the contact details in Section 10.",
      ],
    },
    {
      id: "contact",
      title: "10. Contact Us",
      paragraphs: [
        "For questions, concerns, or requests regarding this Privacy Policy or your data:",
        `${LEGAL.programmeName} (facilitated by KNS in partnership with SLGS)`,
        `Email: ${LEGAL.email}`,
        `WhatsApp: ${LEGAL.whatsappDisplay}`,
        `Address: ${LEGAL.address}`,
      ],
    },
    {
      id: "changes",
      title: "11. Changes to This Policy",
      paragraphs: [
        'We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated "Last updated" date. Continued use of the Site after changes take effect constitutes acceptance of the revised Policy.',
      ],
    },
  ],
};

const ACCEPT_KEY = "ghs-legal-accepted";

export function hasAcceptedLegal(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ACCEPT_KEY) === LEGAL.lastUpdatedIso;
  } catch {
    return false;
  }
}

export function setAcceptedLegal(): void {
  try {
    localStorage.setItem(ACCEPT_KEY, LEGAL.lastUpdatedIso);
  } catch {
    /* ignore */
  }
}
