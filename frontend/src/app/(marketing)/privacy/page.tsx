import { LegalPage } from "@/components/legal/legal-page";
import { privacyPolicy } from "@/lib/legal";

export const metadata = {
  title: "Privacy Policy | KNS and SLGS AI Innovation Programme",
  description: privacyPolicy.intro,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={privacyPolicy.title}
      intro={privacyPolicy.intro}
      sections={privacyPolicy.sections}
      relatedHref="/terms"
      relatedLabel="Terms of Use"
    />
  );
}
