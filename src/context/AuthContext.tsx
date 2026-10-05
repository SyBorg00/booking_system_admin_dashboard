"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/lib/api/auth";
import { clearAuth, getUser, isAuthenticated, } from "@/lib/auth";

// Create a context for authentication
interface AuthContextType {
    user: User | null;
    authenticated: boolean;
    loading: boolean;
    logout: () => void;
}

// Create the AuthContext with an initial value of undefined
const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );

// Create a provider component for the AuthContext
interface AuthProviderProps {
    children: ReactNode;
}

// Create the AuthProvider component that will wrap the application and provide authentication state
export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [authenticated, setAuthenticated] =
        useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getUser();

        setUser(storedUser);
        setAuthenticated(isAuthenticated());
        setLoading(false);
    }, []);

    // Logout function that clears the authentication state and localStorage
    function logout() {
        clearAuth();

        setUser(null);
        setAuthenticated(false);
    }

    // Provide the authentication state and logout function to the context
    return (
        <AuthContext.Provider
            value={{
                user,
                authenticated,
                loading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Create a custom hook to use the AuthContext
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within an AuthProvider."
        );
    }

    return context;
}
