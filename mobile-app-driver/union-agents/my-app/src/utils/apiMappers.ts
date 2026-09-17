export function formatNaira(amount: number | string | null | undefined): string {
  const n = Number(amount || 0);
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function mapPaymentRow(p: any) {
  const statusMap: Record<string, 'Success' | 'Failed' | 'Pending'> = {
    success: 'Success',
    failed: 'Failed',
    pending: 'Pending',
  };
  return {
    id: String(p.id),
    name: p.user_name || '—',
    email: p.user_email || '—',
    idNo: p.plate_number || p.reference || '—',
    type: (p.payment_type || 'card').replace(/^\w/, (c: string) => c.toUpperCase()),
    status: statusMap[p.status] || 'Pending',
    amount: formatNaira(p.amount),
    date: formatDate(p.created_at),
    raw: p,
  };
}
