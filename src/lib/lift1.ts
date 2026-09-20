// Lift1 configuration — values meant to be changed without touching logic.
export const LIFT1 = {
  name: "Lift1",
  tagline: "LIFT A LIFE",
  philosophy: "One Shilling. One Community. One Life at a Time.",
  secondary: "You don't have to be rich to change someone's life.",
  currency: "KSh",
  baseContribution: 1,
  suggestedAmounts: [1, 20, 50, 100, 500],
  platformFeeEnabled: false,
  platformFeePercentage: 0,
};

export const REQUEST_CATEGORIES = [
  "Emergency",
  "Medical",
  "Education",
  "Rent / Housing",
  "Food / Basic Needs",
  "Family Support",
  "Livelihood",
  "Small Business Restart",
  "Disaster / Emergency",
  "Other",
];

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  NEEDS_MORE_INFO: "More information needed",
  APPROVED: "Approved",
  DISBURSED: "Assistance sent",
  DECLINED: "Not approved",
};

export const REQUEST_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEEDS_MORE_INFO",
  "APPROVED",
  "DISBURSED",
  "DECLINED",
] as const;

export function statusTone(status: string) {
  switch (status) {
    case "APPROVED":
    case "DISBURSED":
      return "bg-primary/10 text-primary";
    case "DECLINED":
      return "bg-destructive/10 text-destructive";
    case "NEEDS_MORE_INFO":
      return "bg-accent/20 text-accent-foreground";
    case "UNDER_REVIEW":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export const COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

export function formatKes(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `${LIFT1.currency} ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}
