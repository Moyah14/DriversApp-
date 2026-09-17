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

export function mapDriverRow(u: any) {
  return {
    id: u.id,
    name: u.full_name || u.name || '—',
    phone: u.phone || '—',
    address: u.address || '—',
    nin: u.nin || '—',
    license: u.license_ref || '—',
    dateRegistered: formatDate(u.created_at),
    registeredBy: 'System',
    status: (u.status === 'active' ? 'Active' : 'Suspended') as 'Active' | 'Suspended',
    cardBalance: formatNaira(u.card_balance),
    vehicle: {
      plateNumber: u.plate_number || '—',
      type: u.vehicle_type || '—',
      route: u.route_name || '—',
      park: u.park_name || '—',
    },
    licenseFile: {
      name: u.license_ref || 'license.jpg',
      size: '—',
      url: '#',
    },
    raw: u,
  };
}

export function mapPaymentRow(p: any) {
  const statusMap: Record<string, string> = {
    success: 'Success',
    failed: 'Failed',
    pending: 'Pending',
  };
  return {
    id: p.id,
    name: p.user_name || '—',
    email: p.user_email || '—',
    idNo: p.plate_number || p.reference || '—',
    type: (p.payment_type || 'card').replace(/^\w/, (c: string) => c.toUpperCase()),
    status: statusMap[p.status] || p.status,
    amount: formatNaira(p.amount),
    amountRaw: Number(p.amount || 0),
    date: formatDate(p.created_at),
    raw: p,
  };
}

export function mapParkRow(p: any) {
  return {
    id: p.id,
    name: p.name,
    address: p.address || '—',
    area: p.area || '—',
    driversCount: p.drivers_count ?? 0,
    unionHead: p.union_head_name || '—',
    dateRegistered: formatDate(p.created_at),
    registeredBy: p.registered_by_name || '—',
    status: p.status === 'active' ? 'Active' : 'Inactive',
    drivers: (p.drivers || []).map((d: any) => ({
      name: d.full_name,
      idNumber: d.plate_number || d.phone || '—',
    })),
    raw: p,
  };
}

export function mapRouteRow(r: any) {
  return {
    id: r.id,
    area: r.area || '—',
    name: r.name,
    parks: [r.park_a_name, r.park_b_name].filter(Boolean),
    driversCount: r.drivers_count ?? 0,
    details: {
      park1: {
        name: r.park_a_name || '—',
        address: r.park_a_address || '—',
        unionHead: r.park_a_union_head || '—',
      },
      park2: {
        name: r.park_b_name || '—',
        address: r.park_b_address || '—',
        unionHead: r.park_b_union_head || '—',
      },
      dateRegistered: formatDate(r.created_at),
      registeredBy: r.registered_by_name || '—',
      status: r.status === 'active' ? 'Active' : 'Inactive',
      drivers: (r.drivers || []).map((d: any) => ({
        name: d.full_name,
        idNumber: d.plate_number || '—',
      })),
    },
    raw: r,
  };
}
