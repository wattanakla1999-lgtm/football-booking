type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  trendLabel: string;
  trendIcon?: string;
  tone?: "primary" | "error" | "neutral";
};

export function StatCard({
  icon,
  label,
  value,
  trendLabel,
  trendIcon,
  tone = "primary",
}: StatCardProps) {
  const toneClasses = {
    primary: {
      icon: "text-primary bg-primary/10",
      trend: "text-primary",
    },
    error: {
      icon: "text-error bg-error/10",
      trend: "text-error",
    },
    neutral: {
      icon: "text-primary bg-primary/10",
      trend: "text-on-surface-variant",
    },
  };

  const classes = toneClasses[tone];

  return (
    <div className="glass-card p-md rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300 cursor-default">
      <div className="flex justify-between items-start">
        <span
          className={`material-symbols-outlined p-2 rounded-lg ${classes.icon}`}
        >
          {icon}
        </span>

        <span
          className={`text-label-sm font-label-sm flex items-center gap-0.5 ${classes.trend}`}
        >
          {trendLabel}

          {trendIcon && (
            <span className="material-symbols-outlined text-[14px]">
              {trendIcon}
            </span>
          )}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-label-sm font-label-sm text-on-surface-variant">
          {label}
        </p>

        <h3 className="text-headline-md font-headline-md">
          {value}
        </h3>
      </div>
    </div>
  );
}
