import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MarketingSmoothScroll } from "@/components/marketing/gsap/smooth-scroll";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingSmoothScroll>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </MarketingSmoothScroll>
  );
}
