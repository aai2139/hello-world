export const BUDGET_OPTIONS = [
  { value: "under-25", label: "Under $25" },
  { value: "25-50", label: "$25–50" },
  { value: "50-plus", label: "$50+" },
] as const;

export const VIBE_OPTIONS = [
  { value: "food", label: "Food crawl" },
  { value: "culture", label: "Culture fix" },
  { value: "outdoors", label: "Outside energy" },
  { value: "night-owl", label: "Night owl" },
  { value: "surprise", label: "Surprise me" },
] as const;

export type Budget = (typeof BUDGET_OPTIONS)[number]["value"];
export type Vibe = (typeof VIBE_OPTIONS)[number]["value"];
export type VoteValue = -1 | 1;

export type SidequestStop = {
  label: string;
  activity: string;
};

export type Sidequest = {
  id: string;
  neighborhood: string;
  budget: Budget;
  vibe: Vibe;
  title: string;
  hook: string;
  stops: SidequestStop[];
  budgetNote: string;
  worthItCount: number;
  skipItCount: number;
  createdAt: string;
};

export function budgetLabel(value: Budget) {
  return BUDGET_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function vibeLabel(value: Vibe) {
  return VIBE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function isBudget(value: string): value is Budget {
  return BUDGET_OPTIONS.some((option) => option.value === value);
}

export function isVibe(value: string): value is Vibe {
  return VIBE_OPTIONS.some((option) => option.value === value);
}
