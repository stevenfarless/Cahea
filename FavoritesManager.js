// FavoritesManager.js - Handles all favorites logic

import { saveFavorite, removeFavorite, getFavorites } from './firebase.js';

export class FavoritesManager {
    constructor(userId) {
        this.userId = userId;
        this.favorites = [];
    }

    async loadFavorites() {
        this.favorites = await getFavorites(this.userId);
    }

    async addFavorite(whiteCombination, blackCombination) {
        const favorite = {
            white: whiteCombination,
            black: blackCombination,
            timestamp: Date.now()
        };
        const id = await saveFavorite(this.userId, favorite);
        this.favorites.push({ id, ...favorite });
        return id;
    }

    async removeFavoriteById(favoriteId) {
        await removeFavorite(this.userId, favoriteId);
        this.favorites = this.favorites.filter(f => f.id !== favoriteId);
    }

    isFavorited(whiteCombination, blackCombination) {
        return this.favorites.some(fav =>
            fav.white === whiteCombination && fav.black === blackCombination
        );
    }

    getFavoriteId(whiteCombination, blackCombination) {
        const fav = this.favorites.find(f =>
            f.white === whiteCombination && f.black === blackCombination
        );
        return fav?.id;
    }
}
