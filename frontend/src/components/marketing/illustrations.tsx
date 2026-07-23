"use client";

import { motion } from "framer-motion";

export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      aria-hidden
    >
      <ellipse cx="260" cy="360" rx="180" ry="28" fill="#5D2A80" opacity="0.08" />

      <g>
        <path d="M320 120L400 160V240L320 280L240 240V160L320 120Z" fill="#EDE9FE" />
        <path d="M320 120L400 160L320 200L240 160L320 120Z" fill="#C4B5FD" />
        <path d="M320 200V280L400 240V160L320 200Z" fill="#8B5CF6" />
        <path d="M240 160V240L320 280V200L240 160Z" fill="#7C3AED" />
      </g>

      <g>
        <path d="M140 180L260 130V230L140 280V180Z" fill="#1E1B4B" />
        <path d="M140 180L260 130L300 155L180 205L140 180Z" fill="#312E81" />
        <path d="M160 200L240 165V215L160 250V200Z" fill="#A78BFA" />
        <rect x="175" y="185" width="50" height="6" rx="2" fill="#F7F5F2" opacity="0.9" />
        <rect x="175" y="198" width="36" height="4" rx="2" fill="#F7F5F2" opacity="0.5" />
        <rect x="175" y="208" width="42" height="4" rx="2" fill="#F7F5F2" opacity="0.5" />
        <path d="M130 285L185 255L305 210L280 290L130 285Z" fill="#4C1D95" />
        <path d="M130 285L185 255L195 268L140 295L130 285Z" fill="#5D2A80" />
      </g>

      <g>
        <circle cx="380" cy="100" r="36" fill="#5D2A80" />
        <circle cx="380" cy="100" r="28" fill="#7C3AED" />
        <path
          d="M368 100L376 108L394 90"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <path d="M90 250L130 230V270L90 290V250Z" fill="#F97316" />
      <path d="M90 250L130 230L150 240L110 260L90 250Z" fill="#FB923C" />
      <path d="M420 250L460 230V270L420 290V250Z" fill="#10B981" />
      <path d="M420 250L460 230L480 240L440 260L420 250Z" fill="#34D399" />

      <text
        x="300"
        y="320"
        fill="#5D2A80"
        fontFamily="ui-monospace, monospace"
        fontSize="28"
        fontWeight="700"
        opacity="0.35"
      >
        {"</>"}
      </text>
    </motion.svg>
  );
}

export function EcosystemIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="200" cy="280" rx="140" ry="22" fill="#5D2A80" opacity="0.08" />
      <path d="M200 40L300 90V190L200 240L100 190V90L200 40Z" fill="#EDE9FE" />
      <path d="M200 40L300 90L200 140L100 90L200 40Z" fill="#C4B5FD" />
      <path d="M200 140V240L300 190V90L200 140Z" fill="#8B5CF6" />
      <path d="M100 90V190L200 240V140L100 90Z" fill="#5D2A80" />
      <rect x="170" y="150" width="60" height="40" rx="6" fill="#F7F5F2" opacity="0.9" />
      <circle cx="120" cy="70" r="18" fill="#F97316" />
      <circle cx="300" cy="60" r="14" fill="#10B981" />
      <circle cx="320" cy="200" r="20" fill="#2563EB" />
    </svg>
  );
}
