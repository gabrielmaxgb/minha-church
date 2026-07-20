import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ScrollTriggerRefresh } from "@/components/motion/scroll-trigger-refresh";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollTriggerRefresh />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
