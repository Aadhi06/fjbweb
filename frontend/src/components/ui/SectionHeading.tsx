import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ label, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-12", align === "center" && "text-center", className)}>
      {label && <p className="text-gold-dark font-semibold text-sm uppercase tracking-wider mb-3">{label}</p>}
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-4">{title}</h2>
      {description && (
        <p className={cn("text-muted-foreground text-lg leading-relaxed", align === "center" && "max-w-2xl mx-auto")}>{description}</p>
      )}
    </div>
  );
}
