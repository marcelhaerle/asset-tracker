export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString();
};

export const formatCurrency = (amount: number | null): string => {
  if (amount === null) return 'Not specified';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const intervalLabel = (months: number): string => {
  switch (months) {
    case 3: return 'Quarterly (3 months)';
    case 6: return 'Bi-annually (6 months)';
    case 12: return 'Annually (12 months)';
    default: return `Every ${months} months`;
  }
};