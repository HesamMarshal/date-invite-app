export const FOOD_OPTIONS = [
  { emoji: "☕", label: "قهوه" },
  { emoji: "🍵", label: "چای" },
  { emoji: "🥤", label: "نوشیدنی سرد" },
  { emoji: "🍰", label: "بستنی" },
  { emoji: "🍕", label: "پیتزا" },
  { emoji: "🍔", label: "برگر" },
] as const;

export type FoodChoice = (typeof FOOD_OPTIONS)[number]["label"];

export function isValidFoodChoice(value: string): value is FoodChoice {
  return FOOD_OPTIONS.some((o) => o.label === value);
}
