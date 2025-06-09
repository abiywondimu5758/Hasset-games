import { makeAutoObservable } from "mobx";

class UserStore {
  userProfile = null;
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUserProfile(profile) {
    this.userProfile = profile;
    this.loading = false;
    this.error = null;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
  }

  clearUserProfile() {
    this.userProfile = null;
  }
}

export const userStore = new UserStore();
