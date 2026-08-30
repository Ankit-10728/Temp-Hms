export default function SectionHeader({
  badge,
  badgeColor = "brand",
  badgeIcon: Icon,
  title,
  subtitle,
  light = false,
}) {
  const badgeStyles = {
    brand: "bg-brand-light text-brand-dark",
    accent: "bg-accent-soft text-accent",
    dark: "bg-white/10 text-white",
  }[badgeColor];

  return (
    <div className="text-center max-w-3xl mx-auto">
      {badge && (
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${badgeStyles}`}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {badge}
        </span>
      )}
      <h2
        className={`font-serif text-4xl md:text-5xl font-bold mt-6 ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-lg leading-relaxed ${
            light ? "text-slate-300" : "text-ink-soft"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
