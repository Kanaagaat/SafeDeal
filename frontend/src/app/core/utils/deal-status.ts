/** Backend Deal.deal_status two-letter codes */
export type DealStatusCode =
  | 'CR'
  | 'PA'
  | 'SE'
  | 'SH'
  | 'DE'
  | 'RE'
  | 'CA'
  | 'DI'
  | string;

export function normalizeDealStatus(d: { status?: string; deal_status?: string }): DealStatusCode {
  return (d.status || d.deal_status || 'CR') as DealStatusCode;
}

export function dealStatusLabel(code: DealStatusCode): string {
  const map: Record<string, string> = {
    CR: 'CREATED',
    PA: 'PAID',
    SE: 'SECURED',
    SH: 'SHIPPED',
    DE: 'DELIVERED',
    RE: 'RELEASED',
    CA: 'CANCELLED',
    DI: 'DISPUTED'
  };
  return map[code] || code;
}

/** Visual stepper: Created → Shipped → Delivered → Released */
export const TIMELINE_STEPS = [
  { label: 'Created' },
  { label: 'Shipped' },
  { label: 'Delivered' },
  { label: 'Released' }
];

/** Current step index 0..3, or -1 if cancelled/disputed */
export function timelineProgressIndex(status: DealStatusCode): number {
  if (status === 'CA' || status === 'DI') return -1;
  switch (status) {
    case 'CR':
      return 0;
    case 'PA':
    case 'SE':
    case 'SH':
      return 1;
    case 'DE':
      return 2;
    case 'RE':
      return 3;
    default:
      return 0;
  }
}

export function isActiveDashboardStatus(code: DealStatusCode): boolean {
  return ['CR', 'PA', 'SE', 'SH', 'DE'].includes(code);
}

/** Released (funds settled) */
export function isReleasedStatus(code: DealStatusCode): boolean {
  return code === 'RE';
}

export function isCancelledStatus(code: DealStatusCode): boolean {
  return code === 'CA';
}

export function isDisputedStatus(code: DealStatusCode): boolean {
  return code === 'DI';
}
