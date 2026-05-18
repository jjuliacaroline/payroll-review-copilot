type AccessStatusPanelProps = {
  items: string[];
};

export function AccessStatusPanel({ items }: AccessStatusPanelProps) {
  return (
    <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
