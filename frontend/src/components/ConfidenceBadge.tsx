interface Props {
  /** Sikkerhet 0–100 (fra AI-svaret). */
  value: number;
  label?: string;
  className?: string;
}

/**
 * Viser modellens egen sikkerhet som Lav/Middels/Høy med farge, i stedet for
 * et nakent tall. Lav sikkerhet skal rope tydelig at svaret må dobbeltsjekkes.
 */
export default function ConfidenceBadge({ value, label = 'Sikkerhet', className = '' }: Props) {
  const v = Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));

  let tier: string;
  let cls: string;
  let hint: string;
  if (v >= 70) {
    tier = 'Høy';
    cls = 'bg-green-50 text-green-700 border-green-200';
    hint = 'Modellen er relativt trygg, men kontroller kilden likevel.';
  } else if (v >= 40) {
    tier = 'Middels';
    cls = 'bg-amber-50 text-amber-700 border-amber-200';
    hint = 'Dobbeltsjekk lovhenvisninger, og vurder å få dette bekreftet.';
  } else {
    tier = 'Lav';
    cls = 'bg-red-50 text-red-700 border-red-200';
    hint = 'Vær ekstra kritisk – dette bør bekreftes av en fagperson.';
  }

  return (
    <span
      title={hint}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cls} ${className}`}
    >
      {label}: {tier} ({v}%)
    </span>
  );
}
