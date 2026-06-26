import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

const styles: Record<HeadingLevel, string> = {
  h1: "font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]",
  h2: "font-display text-3xl font-bold tracking-[-0.025em] sm:text-4xl",
  h3: "font-display text-lg font-semibold tracking-tight",
  h4: "font-display text-base font-semibold tracking-tight",
};

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
}

export function Heading({
  as: Tag = "h2",
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn("text-foreground", styles[Tag], className)} {...props}>
      {children}
    </Tag>
  );
}

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {label && <SectionLabel>{label}</SectionLabel>}
      <Heading as="h2" className={cn(label && "mt-3")}>
        {title}
      </Heading>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
