import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingAtmosphere } from "@/components/marketing/page-chrome";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-canvas text-fg">
      <MarketingAtmosphere />
      <SiteHeader />
      <main className="relative min-w-0 pt-[64px] sm:pt-[72px]">{children}</main>
      <SiteFooter />
    </div>
  );
}
