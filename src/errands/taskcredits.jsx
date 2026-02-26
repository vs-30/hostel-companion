// errands/utils/taskCredits.js

import { doc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Add 10 credits to a specific shop
 * @param {string} userId
 * @param {string} shopKey (canteen, pharmacy, xerox, stationary)
 */
export const addTaskCredits = async (userId, shopKey) => {
  if (!userId || !shopKey) return;

  try {
    await updateDoc(doc(db, "users", userId), {
      [`taskCredits.${shopKey}`]: increment(10)
    });
  } catch (error) {
    // If taskCredits doesn't exist yet, create it
    await setDoc(
      doc(db, "users", userId),
      {
        taskCredits: {
          [shopKey]: 10
        }
      },
      { merge: true }
    );
  }
};