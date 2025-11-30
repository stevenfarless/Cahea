import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6AT8yOulXOncTX2qg4Z0-aq_1X3-ewK0",
  authDomain: "cahea-38948.firebaseapp.com",
  databaseURL: "https://cahea-38948-default-rtdb.firebaseio.com",
  projectId: "cahea-38948",
  storageBucket: "cahea-38948.firebasestorage.app",
  messagingSenderId: "703346033222",
  appId: "1:703346033222:web:ce1fc872e96491c5ab8047"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase auth and export it
export const auth = getAuth(app);

import { getDatabase, ref, set, get, remove } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

export const database = getDatabase(app);

// Helper function to manage favorites
export async function saveFavorite(userId, combination) {
  const favoriteId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const favRef = ref(database, `users/${userId}/favorites/${favoriteId}`);
  await set(favRef, combination);
  return favoriteId;
}

export async function removeFavorite(userId, favoriteId) {
  const favRef = ref(database, `users/${userId}/favorites/${favoriteId}`);
  await remove(favRef);
}

export async function getFavorites(userId) {
  const favRef = ref(database, `users/${userId}/favorites`);
  const snapshot = await get(favRef);
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
  }
  return [];
}
