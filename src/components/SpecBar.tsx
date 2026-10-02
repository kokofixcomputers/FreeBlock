interface Props {
  label: string;
  value: string;
  ratio: number; // 0..1
  estimated?: boolean;
  color: string;
}

export function SpecBar({ label, value, ratio, estimated, color }: Props) {
  return (
    <div className="spec">
      <div className="spec-head">
        <span className="spec-label">{label}</span>
        <span className="spec-value" title={estimated ? 'Estimated — not officially published' : undefined}>
          {estimated && '~'}
          {value}
        </span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${Math.min(100, Math.max(4, ratio * 100))}%`, background: color }} />
      </div>
    </div>
  );
}
