export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string; label: string }> = {
    Available:   { cls: 'badge-available',   dot: '🟢', label: 'Available' },
    Rented:      { cls: 'badge-rented',      dot: '🔴', label: 'Rented' },
    Late:        { cls: 'badge-late',        dot: '🟠', label: 'Late' },
    Maintenance: { cls: 'badge-maintenance', dot: '⚫', label: 'Maintenance' },
    Requested:   { cls: 'badge-requested',   dot: '🟣', label: 'Requested' },
    Approved:    { cls: 'badge-approved',    dot: '🔵', label: 'Approved' },
    Returned:    { cls: 'badge-returned',    dot: '🟢', label: 'Returned' },
    Cancelled:   { cls: 'badge-cancelled',   dot: '⚫', label: 'Cancelled' },
  };

  const entry = map[status] || { cls: '', dot: '⚪', label: status };
  return <span className={`badge ${entry.cls}`}>{entry.dot} {entry.label}</span>;
}

export function ConditionBadge({ condition }: { condition: string }) {
  const dots: Record<string, string> = {
    Excellent: 'dot-excellent',
    Good: 'dot-good',
    Fair: 'dot-fair',
    Poor: 'dot-poor',
  };
  return (
    <span className="condition-badge">
      <span className={`condition-dot ${dots[condition] || 'dot-good'}`} />
      {condition}
    </span>
  );
}
