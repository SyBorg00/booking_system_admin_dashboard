import { apiFetch } from "./client";

export interface User {
    id: number;
    name: string;
    email: string;
    role: "super_admin" | "admin" | "staff";
}

interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

// Login function
interface LoginCredentials {
    email: string;
    password: string;
}

// Login function
export async function login(
    credentials: LoginCredentials
): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}