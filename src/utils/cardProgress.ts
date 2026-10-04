import { CardDefinition, OwnedCard } from "../types/game";

export const baseMaxLevel = (card: CardDefinition) => card.rarity === 4 ? 50 : card.rarity === 3 ? 40 : 30;
export const currentCardLevel = (owned: OwnedCard) => owned.level ?? 1;
export const maxCardLevel = (card: CardDefinition, owned: OwnedCard) => baseMaxLevel(card) + (owned.trained ? 10 : 0);
export const currentMasteryRank = (owned: OwnedCard) => owned.masteryRank ?? 0;

const practicePerLevel = { 2: 18, 3: 28, 4: 40 } as const;
const masteryPerRank = { 2: 20, 3: 100, 4: 500 } as const;

export const levelUpPreview = (card: CardDefinition, owned: OwnedCard) => {
  const level = currentCardLevel(owned);
  const targetLevel = Math.min(maxCardLevel(card, owned), level + 10);
  return { targetLevel, cost: (targetLevel - level) * practicePerLevel[card.rarity] };
};

export const trainingCost = (card: CardDefinition) => card.rarity === 4 ? 5 : 3;
export const masteryCost = (card: CardDefinition) => masteryPerRank[card.rarity];

