import { auth } from './firebase.js';
import { CAHDeck } from './CAHDeck.js';
import { FavoritesManager } from './FavoritesManager.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// DOM Elements
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
const favoritesSection = document.getElementById('favoritesSection');
const favoritesContainer = document.getElementById('favoritesContainer');
const noFavoritesMsg = document.getElementById('noFavoritesMsg');
const addToFavoritesBtn = document.getElementById('addToFavoritesBtn');

// Global state
let allWhiteCards = [];
let allBlackCards = [];
let currentUser = null;
let favoritesManager = null;

// Current combination being displayed
let currentCombination = {
    white: null,
    black: null
};

// Auth handlers
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

// Auth state listener - runs when user logs in/out
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = '';
        userGreeting.textContent = `Welcome, ${user.email}`;
        emailInput.style.display = 'none';
        passwordInput.style.display = 'none';

        // Initialize favorites system for this user
        favoritesManager = new FavoritesManager(user.uid);
        await favoritesManager.loadFavorites();
        favoritesSection.classList.add('show');
        renderFavorites();
        updateFavoriteButton();
    } else {
        currentUser = null;
        favoritesManager = null;
        loginBtn.style.display = '';
        signupBtn.style.display = '';
        logoutBtn.style.display = 'none';
        userGreeting.textContent = '';
        emailInput.style.display = '';
        passwordInput.style.display = '';
        favoritesSection.classList.remove('show');
        addToFavoritesBtn.style.display = 'none';
    }
});

// Load card data
async function loadAllCards() {
    const deck = await CAHDeck.fromCompact('cah-all-compact.json');
    deck.deck.forEach((pack) => {
        allWhiteCards.push(...pack.white);
        allBlackCards.push(...pack.black);
    });
}

// Draw handlers
drawWhite.onclick = () => {
    if (allWhiteCards.length === 0) return;
    const card = allWhiteCards[Math.floor(Math.random() * allWhiteCards.length)];
    currentCombination.white = card.text;
    drawWhiteResult.innerHTML = `
        <div class="card white">
            ${card.text}
        </div>
    `;
    updateFavoriteButton();
};

drawBlack.onclick = () => {
    if (allBlackCards.length === 0) return;
    const card = allBlackCards[Math.floor(Math.random() * allBlackCards.length)];
    currentCombination.black = card.text;
    drawBlackResult.innerHTML = `
        <div class="card black">
            ${card.text}
        </div>
    `;
    updateFavoriteButton();
};

// Update the favorite button state
function updateFavoriteButton() {
    // Only show button if user is logged in and both cards are drawn
    if (!currentUser || !currentCombination.white || !currentCombination.black) {
        addToFavoritesBtn.style.display = 'none';
        return;
    }

    addToFavoritesBtn.style.display = 'flex';

    const isFav = favoritesManager.isFavorited(currentCombination.white, currentCombination.black);
    const heartIcon = addToFavoritesBtn.querySelector('.heart-icon');
    const btnLabel = addToFavoritesBtn.querySelector('.btn-label');

    if (isFav) {
        heartIcon.textContent = '❤️';
        btnLabel.textContent = 'Remove from Favorites';
        addToFavoritesBtn.classList.add('favorited');
    } else {
        heartIcon.textContent = '🤍';
        btnLabel.textContent = 'Add to Favorites';
        addToFavoritesBtn.classList.remove('favorited');
    }
}

// Add to favorites button click handler
addToFavoritesBtn.onclick = async () => {
    if (!currentCombination.white || !currentCombination.black) {
        alert('Please draw both cards first!');
        return;
    }

    const isFav = favoritesManager.isFavorited(currentCombination.white, currentCombination.black);

    if (isFav) {
        // Remove favorite
        const favId = favoritesManager.getFavoriteId(currentCombination.white, currentCombination.black);
        await favoritesManager.removeFavoriteById(favId);
    } else {
        // Add favorite
        await favoritesManager.addFavorite(currentCombination.white, currentCombination.black);
    }

    updateFavoriteButton();
    renderFavorites();
};

// Render favorites list
function renderFavorites() {
    if (!favoritesManager || favoritesManager.favorites.length === 0) {
        favoritesContainer.innerHTML = '';
        noFavoritesMsg.style.display = 'block';
        return;
    }

    noFavoritesMsg.style.display = 'none';
    favoritesContainer.innerHTML = favoritesManager.favorites
        .map(fav => `
            <div class="favorite-item">
                <div class="favorite-cards">
                    <div class="favorite-card black">${fav.black}</div>
                    <div class="favorite-card white">${fav.white}</div>
                </div>
                <button class="remove-favorite-btn" data-id="${fav.id}">Remove</button>
            </div>
        `)
        .join('');

    // Attach remove event listeners
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
        btn.onclick = async () => {
            const favId = btn.getAttribute('data-id');
            await favoritesManager.removeFavoriteById(favId);
            renderFavorites();
            updateFavoriteButton();
        };
    });
}

// Initialize app
loadAllCards();
