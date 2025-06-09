// AuthStore.js
import { jwtDecode } from "jwt-decode";
import { makeAutoObservable } from "mobx";
import { logout } from "../services/authServices";

class AuthStore {
  user = null;
  accessToken = localStorage.getItem("accessToken") || null;
  isLoggedOut = false; // New property to track logout state

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user) {
    this.user = user;
  }

  setAccessToken(token) {
    this.accessToken = token;
    localStorage.setItem("accessToken", token);
    this.isLoggedOut = false; // Reset logout state when a new token is set
  }

  isTokenExpired(token) {
    if (!token) return true;
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  }

  isAuthenticated() {
    return this.accessToken && !this.isLoggedOut;
  }

  clearAuth() {
    this.user = null;
    this.accessToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  logout() {
    logout();
    this.clearAuth();
    this.isLoggedOut = true; // Set logout state when logging out
  }
}

export const authStore = new AuthStore();
