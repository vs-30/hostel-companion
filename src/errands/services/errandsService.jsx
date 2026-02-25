// errands/services/errandsService.jsx
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase";

// Credits per item delivered
export const STORE_RULES = {
  canteen: { perItem: 10 },  // 10 credits per item
  pharmacy: { perItem: 8 },   // 8 credits per item
  xerox: { perItem: 5 },      // 5 credits per item
  stationary: { perItem: 5 }, // 5 credits per item
  default: { perItem: 10 }
};

// Calculate credits based on number of items
export function calculatePoints(store, itemCount) {
  const rule = STORE_RULES[store.toLowerCase()] || STORE_RULES.default;
  return itemCount * rule.perItem;
}

// When order is accepted with multiple items
export async function addCredits(userId, store, itemCount) {
  const points = calculatePoints(store, itemCount);
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    [`credits.${store.toLowerCase()}`]: increment(points),
    totalCredits: increment(points)
  });

  return points;
}

// When order is completed
export async function completeTask(taskId, acceptorId, store, itemCount) {
  const points = calculatePoints(store, itemCount);
  
  // Add credits to acceptor
  await addCredits(acceptorId, store, itemCount);
  
  // Update task status
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    status: "completed",
    completedAt: new Date(),
    creditsEarned: points
  });
  
  return points;
}

// Redeem credits (2x price rule)
export async function redeemCredits(userId, store, itemPrice, currentCredits) {
  const requiredCredits = itemPrice * 2; // twice of item price

  if (currentCredits >= requiredCredits) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`credits.${store}`]: increment(-requiredCredits),
      totalCredits: increment(-requiredCredits)
    });
    return true; // Item is FREE
  }
  return false; // Not enough credits
}