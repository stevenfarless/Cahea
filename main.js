import { db, doc, getDoc, setDoc } from './firebase.js';
import { auth } from './firebase.js';
import { CAHDeck } from './CAHDeck.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const emailInput = document.getElementById('authEmail');
const passwordInput = document.getElementById('authPassword');
const drawWhite = document.getElementById('drawWhite');
const drawBlack = document.getElementById('drawBlack');
const drawWhiteResult = document.getElementById('drawWhiteResult');
const drawBlackResult = document.getElementById('drawBlackResult');
const favoriteBtn = document.getElementById('favoriteBtn');
const favoritesList = document.getElementById('favoritesList');

let currentCombo = null;
let userFavorites = [];
let allWhiteCards = [];
let allBlackCards = [];

// Favorite button handler
favoriteBtn.onclick = saveFavorite;

// Load all cards on startup
async function loadAllCards() {
    try {
        const deck = await CAHDeck.fromCompact('cah-all-compact.json');
        allWhiteCards = [];
        allBlackCards = [];
        deck.deck.forEach(pack => {
            allWhiteCards.push(...pack.white);
            allBlackCards.push(...pack.black);
        });
        console.log(`Loaded ${allWhiteCards.length} white, ${allBlackCards.length} black cards`);
    } catch (err) {
        console.error('Failed to load cards:', err);
    }
}

signupBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Sign up successful! You are now logged in.');
    } catch (err) {
        alert('Sign up failed: ' + err.message);
    }
};

loginBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in!');
    } catch (err) {
        alert('Login failed: ' + err.message);
    }
};

logoutBtn.onclick = async () => {
    await signOut(auth);
    alert('Logged out!');
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = '';
        userGreeting.textContent = `Welcome, ${user.email}`;
        emailInput.style.display = 'none';
        passwordInput.style.display = 'none';
        loadFavorites();
    } else {
        loginBtn.style.display = '';
        signupBtn.style.display = '';
        logoutBtn.style.display = 'none';
        userGreeting.textContent = '';
        emailInput.style.display = '';
        passwordInput.style.display = '';
        userFavorites = [];
        displayFavorites();
        favoritesList.innerHTML = '<div style="color: var(--dracula-comment);">Log in to save favorites</div>';
    }
});

drawWhite.onclick = () => {
    if (allWhiteCards.length === 0) return;
    const card = allWhiteCards[Math.floor(Math.random() * allWhiteCards.length)];
    drawWhiteResult.innerHTML = `<div class="card white">${card.text}</div>`;
    
    const blackCard = drawBlackResult.querySelector('.card.black');
    if (blackCard) {
        currentCombo = {
            black: blackCard.textContent.trim(),
            white: card.text
        };
        favoriteBtn.disabled = false;
    }
};

drawBlack.onclick = () => {
    if (allBlackCards.length === 0) return;
    const card = allBlackCards[Math.floor(Math.random() * allBlackCards.length)];
    drawBlackResult.innerHTML = `<div class="card black">${card.text}</div>`;
    
    const whiteCard = drawWhiteResult.querySelector('.card.white');
    if (whiteCard) {
        currentCombo = {
            black: card.text,
            white: whiteCard.textContent.trim()
        };
        favoriteBtn.disabled = false;
    }
};

// Load/save favorites to user's Firebase document
async function loadFavorites() {
    if (!auth.currentUser) return;
    try {
        const userId = auth.currentUser.uid;
        const docRef = doc(db, 'favorites', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            userFavorites = docSnap.data().combos || [];
            displayFavorites();
        }
    } catch (err) {
        console.error('Failed to load favorites:', err);
    }
}

async function saveFavorite() {
    if (!currentCombo || !auth.currentUser) return;

    const userId = auth.currentUser.uid;
    userFavorites.unshift(currentCombo);
    if (userFavorites.length > 20) userFavorites = userFavorites.slice(0, 20);

    try {
        await setDoc(doc(db, 'favorites', userId), { combos: userFavorites }, { merge: true });
        displayFavorites();
        alert('⭐ Combo saved!');
    } catch (err) {
        console.error('Failed to save favorite:', err);
        alert('Failed to save - check console');
    }
}

function displayFavorites() {
    favoritesList.innerHTML = '';
    if (userFavorites.length === 0) {
        favoritesList.innerHTML = '<div style="color: var(--dracula-comment);">No favorites yet</div>';
        return;
    }
    userFavorites.forEach((combo) => {
        const div = document.createElement('div');
        div.className = 'fav-combo';
        div.innerHTML = `<strong>${combo.black}</strong><br><span style="font-size: 0.85rem; opacity: 0.8;">${combo.white}</span>`;
        div.onclick = () => restoreCombo(combo);
        favoritesList.appendChild(div);
    });
}

function restoreCombo(combo) {
    drawBlackResult.innerHTML = `<div class="card black">${combo.black}</div>`;
    drawWhiteResult.innerHTML = `<div class="card white">${combo.white}</div>`;
    currentCombo = combo;
    favoriteBtn.disabled = false;
}

// Initialize
loadAllCards();
