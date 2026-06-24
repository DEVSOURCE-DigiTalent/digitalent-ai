export interface SelectOption {
  value: string;
  label: string;
}

export interface StatusBadge {
  status: string;
  label: string;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
}
