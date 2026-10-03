import { CardDefinition, OwnedCard } from "../types/game";

export const baseMaxLevel = (card: CardDefinition) => card.rarity === 4 ? 50 : card.rarity === 3 ? 40 : 30;
export const currentCardLevel = (owned: OwnedCard) => owned.level ?? 1;
export const maxCardLevel = (card: CardDefinition, owned: OwnedCard) => baseMaxLevel(card) + (owned.trained ? 10 : 0);

