import { apiFetch } from "@/lib/api/client";

// Staff Hours API
export interface StaffHour {
    id: number;
    staff_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_off: boolean;
    created_at: string;
    updated_at: string;
}

// Create Staff Hour Data
export interface CreateStaffHourData {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_off?: boolean;
}

// Update Staff Hour Data
export interface UpdateStaffHourData {
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
    is_off?: boolean;
}

// Response Interfaces
interface StaffHourListResponse {
    data: StaffHour[];
}

interface StaffHourResponse {
    data: StaffHour;
}

// Fetch Staff Hour List for a Staff Member
export async function getStaffHours(
    businessId: number,
    staffId: number
): Promise<StaffHour[]> {
    const response =
        await apiFetch<StaffHourListResponse>(
            `/businesses/${businessId}/staff/${staffId}/hours`
        );

    return response.data;
}

// Fetch a Single Staff Hour by ID
export async function getStaffHour(
    businessId: number,
    staffId: number,
    staffHourId: number
): Promise<StaffHour> {
    const response =
        await apiFetch<StaffHourResponse>(
            `/businesses/${businessId}/staff/${staffId}/hours/${staffHourId}`
        );

    return response.data;
}

// Create, Update, and Delete Staff Hours
export async function createStaffHour(
    businessId: number,
    staffId: number,
    data: CreateStaffHourData
): Promise<StaffHour> {
    const response =
        await apiFetch<StaffHourResponse>(
            `/businesses/${businessId}/staff/${staffId}/hours`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

    return response.data;
}

export async function updateStaffHour(
    businessId: number,
    staffId: number,
    staffHourId: number,
    data: UpdateStaffHourData
): Promise<StaffHour> {
    const response =
        await apiFetch<StaffHourResponse>(
            `/businesses/${businessId}/staff/${staffId}/hours/${staffHourId}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );

    return response.data;
}

export async function deleteStaffHour(
    businessId: number,
    staffId: number,
    staffHourId: number
): Promise<void> {
    await apiFetch(
        `/businesses/${businessId}/staff/${staffId}/hours/${staffHourId}`,
        {
            method: "DELETE",
        }
    );
}
