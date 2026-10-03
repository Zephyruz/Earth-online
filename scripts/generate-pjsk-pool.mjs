import { mkdir, writeFile } from "node:fs/promises";

const SOURCE = "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main";
const CN_CARDS_SOURCE = "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-cn-diff/main/cards.json";
const GACHA_ID = 345;
const characterNames = {
  1: "星乃一歌", 2: "天马咲希", 3: "望月穗波", 4: "日野森志步", 5: "花里实乃理", 6: "桐谷遥", 7: "桃井爱莉", 8: "日野森雫", 9: "小豆泽心羽", 10: "白石杏", 11: "东云彰人", 12: "青柳冬弥", 13: "天马司", 14: "凤笑梦", 15: "草薙宁宁", 16: "神代类", 17: "宵崎奏", 18: "朝比奈真冬", 19: "东云绘名", 20: "晓山瑞希", 21: "初音未来", 22: "镜音铃", 23: "镜音连", 24: "巡音流歌", 25: "MEIKO", 26: "KAITO"
};

const load = async (name) => {
  const response = await fetch(`${SOURCE}/${name}.json`);
  if (!response.ok) throw new Error(`Failed to load ${name}: ${response.status}`);
  return response.json();
};

const loadUrl = async (url, label) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${label}: ${response.status}`);
  return response.json();
};

const [gachas, cards, supplies, cnCards] = await Promise.all([load("gachas"), load("cards"), load("cardSupplies"), loadUrl(CN_CARDS_SOURCE, "Simplified Chinese cards")]);
const gacha = gachas.find((item) => item.id === GACHA_ID);
if (!gacha) throw new Error(`Gacha ${GACHA_ID} was not found.`);
const detailByCard = new Map(gacha.gachaDetails.map((item) => [item.cardId, item]));
const supplyById = new Map(supplies.map((item) => [item.id, item.cardSupplyType]));
const pickupIds = new Set(gacha.gachaPickups.map((item) => item.cardId));
const cnCardById = new Map(cnCards.map((item) => [item.id, item]));
const assetRoot = "https://storage.sekai.best/sekai-jp-assets/character/member";

const pool = cards
  .filter((card) => detailByCard.has(card.id))
  .map((card) => {
    const rarity = Number(card.cardRarityType.slice(-1));
    const supply = supplyById.get(card.cardSupplyId) ?? "normal";
    const cnCard = cnCardById.get(card.id);
    return {
      id: `pjsk-${card.id}`,
      sourceId: card.id,
      character: characterNames[card.characterId] ?? `角色 ${card.characterId}`,
      title: cnCard?.prefix || card.prefix,
      titleJa: card.prefix,
      ...(cnCard?.gachaPhrase ? { gachaPhrase: cnCard.gachaPhrase.trim() } : {}),
      rarity,
      attribute: card.attr,
      imageUrl: `${assetRoot}/${card.assetbundleName}/card_normal.webp`,
      ...(rarity >= 3 ? { trainedImageUrl: `${assetRoot}/${card.assetbundleName}/card_after_training.webp` } : {}),
      featured: pickupIds.has(card.id),
      limited: supply !== "normal",
      festival: supply === "colorful_festival_limited",
      weight: detailByCard.get(card.id).weight
    };
  })
  .sort((a, b) => a.sourceId - b.sourceId);

if (pool.length !== gacha.gachaDetails.length) throw new Error(`Expected ${gacha.gachaDetails.length} cards, generated ${pool.length}.`);
await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
await writeFile(new URL("../src/data/pjsk-gacha-345.generated.json", import.meta.url), `${JSON.stringify(pool, null, 2)}\n`, "utf8");
console.log(`Generated gacha ${GACHA_ID}: ${pool.length} cards (${pool.filter((card) => card.rarity === 2).length} 2★, ${pool.filter((card) => card.rarity === 3).length} 3★, ${pool.filter((card) => card.rarity === 4).length} 4★).`);
