import { app } from './firebase.js';
import { CAHDeck } from './CAHDeck.js';

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const packList = document.getElementById('packList');
const cardArea = document.getElementById('cardArea');
const drawWhite = document.getElementById('drawWhite');
const drawBlack = document.getElementById('drawBlack');
const drawResult = document.getElementById('drawResult');

console.log('Firebase app:', app);

loginBtn.onclick = () => {
    alert('Connect this to Firebase Authentication!');
};

logoutBtn.onclick = () => {
    alert('Connect this to Firebase Authentication!');
};

let sharedDeck; // cache the deck for drawing and for displaying packs/cards

// Single, combined loadPacks function
async function loadPacks() {
    const deck = await CAHDeck.fromCompact('cah-all-compact.json');
    sharedDeck = deck;
    const packs = deck.listPacks();

    // Populate packList for selection
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

// Draw a random white card
drawWhite.onclick = () => {
    if (!sharedDeck) return;
    const packs = sharedDeck.deck;
    if (packs.length === 0) return;
    const pack = packs[Math.floor(Math.random() * packs.length)];
    const card = pack.white[Math.floor(Math.random() * pack.white.length)];
    drawResult.innerHTML = `<div class="card white">${card.text}</div>`;
};

// Draw a random black card
drawBlack.onclick = () => {
    if (!sharedDeck) return;
    const packs = sharedDeck.deck;
    if (packs.length === 0) return;
    const pack = packs[Math.floor(Math.random() * packs.length)];
    const card = pack.black[Math.floor(Math.random() * pack.black.length)];
    drawResult.innerHTML = `<div class="card black">${card.text}</div>`;
};

// Only ONE call to loadPacks on startup
loadPacks();
