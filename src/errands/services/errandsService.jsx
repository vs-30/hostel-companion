import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase";

// Credits per item delivered
export const STORE_RULES = {
  canteen: { perItem: 5 },
  pharmacy: { perItem: 3 },
  xerox: { perItem: 3 },
  stationary: { perItem: 3 }
};

// Calculate credits based on number of items
export function calculatePoints(store, itemCount) {
  const rule = STORE_RULES[store];
  return itemCount * rule.perItem;
}

// When order is accepted (itemCount = total items like 2 dosa, 3 copies etc.)
export async function addCredits(userId, store, itemCount) {
  const points = calculatePoints(store, itemCount);
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    [`credits.${store}`]: increment(points)
  });

  return points;
}

// Redeem credits (2x price rule)
export async function redeemCredits(userId, store, itemPrice, currentCredits) {
  const requiredCredits = itemPrice * 2; // twice of item price

  if (currentCredits >= requiredCredits) {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      [`credits.${store}`]: increment(-requiredCredits)
    });

    return true; // Item is FREE
  }

  return false; // Not enough credits
}