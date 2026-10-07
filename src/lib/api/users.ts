import { apiFetch } from "@/lib/api/client";

// Interface for the User object returned by the API
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: "super_admin" | "admin" | "staff";
}

// Interface for the response from the API when fetching users
interface UserListResponse {
    data: User[];
}

// Function to fetch the list of users from the API
export async function getUsers(): Promise<User[]> {
    const response = await apiFetch<UserListResponse>(
        "/users"
    );

    return response.data;
}
