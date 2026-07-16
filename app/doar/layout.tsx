import "./giving.css";

export default function GivingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="giving-root min-h-svh">{children}</div>;
}
