import { makeAutoObservable } from 'mobx';

class GamesStore {
  games = null;
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  setGames(games) {
    this.games = games;
    this.loading = false;
    this.error = null;
  }
  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
  }
  clearGames() {
    this.games = null;
  }
}

export const gamesStore = new GamesStore();
