import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

const styles: Record<HeadingLevel, string> = {
  h1: "page-title text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
  h2: "text-xl font-semibold tracking-tight sm:text-2xl",
  h3: "text-base font-semibold tracking-tight",
  h4: "text-sm font-medium tracking-tight",
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
        "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
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
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
