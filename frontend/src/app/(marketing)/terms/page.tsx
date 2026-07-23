import { LegalPage } from "@/components/legal/legal-page";
import { termsOfUse } from "@/lib/legal";

export const metadata = {
  title: "Terms of Use | KNS and SLGS AI Innovation Programme",
  description: termsOfUse.intro,
};

export default function TermsPage() {
  return (
    <LegalPage
      title={termsOfUse.title}
      intro={termsOfUse.intro}
      sections={termsOfUse.sections}
      relatedHref="/privacy"
      relatedLabel="Privacy Policy"
    />
  );
}
