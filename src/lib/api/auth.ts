import { ReactNode } from "react";
import { apiFetch } from "./client";

// User interface
export interface User {
    last_name: ReactNode;
    first_name: ReactNode;
    id: number;
    name: string;
    email: string;
    role: "super_admin" | "admin" | "staff";
}

// Login response interface
interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

// Login Credentials interface
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