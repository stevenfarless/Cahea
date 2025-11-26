
import { app } from './firebase.js';
import { CAHDeck } from './CAHDeck.js';

// Get references to UI elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const packList = document.getElementById('packList');
const cardArea = document.getElementById('cardArea');

console.log('Firebase app:', app);


// Placeholder for Firebase Auth integration
loginBtn.onclick = () => {
    alert('Connect this to Firebase Authentication!');
};

logoutBtn.onclick = () => {
    alert('Connect this to Firebase Authentication!');
};

// Loads all card packs from cah-all-compact.json
async function loadPacks() {
    const deck = await CAHDeck.fromCompact('cah-all-compact.json');
    const packs = deck.listPacks();

    // Add each available pack to the pack list
    packs.forEach((pack, idx) => {
        const li = document.createElement('li');
        li.textContent = `${pack.name} (${pack.counts.total} cards)`;
        li.onclick = () => showCards(deck, idx);
        packList.appendChild(li);
    });
}

// Display all cards from the selected pack
function showCards(deck, packIdx) {
    const pack = deck.getPack(packIdx);
    cardArea.innerHTML = '<h3>White Cards</h3>'
        + pack.white.map(card => `<div class="card white">${card.text}</div>`).join('')
        + '<h3>Black Cards</h3>'
        + pack.black.map(card => `<div class="card black">${card.text}</div>`).join('');
}

// Initial load of packs
loadPacks();

const drawWhite = document.getElementById('drawWhite');
const drawBlack = document.getElementById('drawBlack');
const drawResult = document.getElementById('drawResult');

let sharedDeck; // cache the deck for drawing

async function loadPacks() {
    const deck = await CAHDeck.fromCompact('cah-all-compact.json');
    sharedDeck = deck;
    // ...rest of your code
}

drawWhite.onclick = () => {
    if (!sharedDeck) return;
    // Pick a random pack and card
    const packs = sharedDeck.deck;
    if (packs.length === 0) return;
    const pack = packs[Math.floor(Math.random() * packs.length)];
    const card = pack.white[Math.floor(Math.random() * pack.white.length)];
    drawResult.innerHTML = `<div class="card white">${card.text}</div>`;
};

drawBlack.onclick = () => {
    if (!sharedDeck) return;
    const packs = sharedDeck.deck;
    if (packs.length === 0) return;
    const pack = packs[Math.floor(Math.random() * packs.length)];
    const card = pack.black[Math.floor(Math.random() * pack.black.length)];
    drawResult.innerHTML = `<div class="card black">${card.text}</div>`;
};
