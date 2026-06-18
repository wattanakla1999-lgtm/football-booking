type InformationBoxProps = {
  icon: string;
  label: string;
  value: string;
};

export function InformationBox({
  icon,
  label,
  value,
}: InformationBoxProps) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-white/10 bg-black/15 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
        <span className="material-symbols-outlined text-[17px]">
          {icon}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wider text-white/35">
          {label}
        </p>

        <p
          title={value}
          className="mt-1 truncate text-xs font-bold text-white/80"
        >
          {value}
        </p>
      </div>
    </div>
  );
}
