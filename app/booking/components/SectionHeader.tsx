type SectionHeaderProps = {
  title: string;
  description: string;
};

export function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="border-l-4 border-green-500 pl-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-white/40 text-xs mt-1">{description}</p>
    </div>
  );
}
