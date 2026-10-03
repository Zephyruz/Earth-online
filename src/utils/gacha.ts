import { activeBanner, cardPool } from "../data/defaults";
import { CardDefinition, CardRarity } from "../types/game";

export const rollRarity = (): CardRarity => {
  const value = Math.random();
  if (value < activeBanner.fourStarRate) return 4;
  if (value < activeBanner.fourStarRate + activeBanner.threeStarRate) return 3;
  return 2;
};

export const rollGuaranteedRarity = (): CardRarity => Math.random() < activeBanner.fourStarRate / (activeBanner.fourStarRate + activeBanner.threeStarRate) ? 4 : 3;

export const pickCard = (rarity: CardRarity): CardDefinition => {
  const pool = cardPool.filter((card) => card.rarity === rarity);
  const totalWeight = pool.reduce((sum, card) => sum + card.weight, 0);
  let cursor = Math.random() * totalWeight;
  for (const card of pool) {
    cursor -= card.weight;
    if (cursor <= 0) return card;
  }
  return pool[pool.length - 1];
};
