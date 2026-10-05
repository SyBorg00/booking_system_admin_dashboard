import type { User } from "./api/auth";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// Fetch the token in localStorage
export function getToken(): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(TOKEN_KEY);
}

// Fetch the user in localStorage
export function getUser(): User | null {
    if (typeof window === "undefined") return null;

    const user = localStorage.getItem(USER_KEY);

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user) as User;
    }
    catch {
        return null;
    }
}

// Store the token and user in localStorage (will be used after login to ensure security and persistence)
export function saveAuth(
    token: string,
    user: User
): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Clear the token and user from localStorage (will be used after logout to ensure security)
export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Check if the user is authenticated (i.e., if the token exists in localStorage... to ensure security in accessing every page)
export function isAuthenticated(): boolean {
    return getToken() !== null;
}