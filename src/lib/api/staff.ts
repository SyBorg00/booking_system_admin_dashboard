import { apiFetch } from "@/lib/api/client";

// Interface definitions for Staff and related data structures
export interface Staff {
    id: number;
    user_id: number;
    business_id: number;
    phone: string | null;
    position: string | null;
    created_at: string;
    updated_at: string;
    user: StaffUser;
}

// Interface for a user associated with a staff member
interface StaffUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

// Interface for creating a new staff member
export interface CreateStaffData {
    user_id: number;
    first_name: string;
    last_name: string;
    phone?: string | null;
    position?: string | null;
}

// Interface for updating an existing staff member
export interface UpdateStaffData {
    first_name?: string;
    last_name?: string;
    phone?: string | null;
    position?: string | null;
}

// Response interfaces for API calls
interface StaffListResponse {
    data: Staff[];
}

// Response interface for a single staff member
interface StaffResponse {
    data: Staff;
}

// Function to fetch a list of staff members, optionally filtered by business ID
export async function getStaff(
    businessId: number
): Promise<Staff[]> {
    const response = await apiFetch<StaffListResponse>(
        `/businesses/${businessId}/staff`
    );

    return response.data;
}

// Function to fetch a single staff member by ID
export async function getStaffMember(
    businessId: number,
    staffId: number
): Promise<Staff> {
    const response = await apiFetch<StaffResponse>(
        `/businesses/${businessId}/staff/${staffId}`
    );

    return response.data;
}

// Function to create a new staff member
export async function createStaff(
    businessId: number,
    data: CreateStaffData
): Promise<Staff> {
    const response = await apiFetch<StaffResponse>(
        `/businesses/${businessId}/staff`,
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response.data;
}

// Function to update an existing staff member by ID
export async function updateStaff(
    businessId: number,
    staffId: number,
    data: UpdateStaffData
): Promise<Staff> {
    const response = await apiFetch<StaffResponse>(
        `/businesses/${businessId}/staff/${staffId}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );

    return response.data;
}

// Function to delete a staff member by ID
export async function deleteStaff(
    businessId: number,
    staffId: number
): Promise<void> {
    await apiFetch(
        `/businesses/${businessId}/staff/${staffId}`,
        {
            method: "DELETE",
        }
    );
}