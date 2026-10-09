import { apiFetch } from "@/lib/api/client";

// Interface for Staff Time Off
export interface StaffTimeOff {
    id: number;
    staff_id: number;
    start_datetime: string;
    end_datetime: string;
    reason: string | null;
    created_at: string;
    updated_at: string;
}

// Create and Update Staff Time Off Data Interfaces
export interface CreateStaffTimeOffData {
    start_datetime: string;
    end_datetime: string;
    reason?: string | null;
}

export interface UpdateStaffTimeOffData {
    start_datetime?: string;
    end_datetime?: string;
    reason?: string | null;
}

// Response Interfaces
interface StaffTimeOffListResponse {
    data: StaffTimeOff[];
}

interface StaffTimeOffResponse {
    data: StaffTimeOff;
}

// Fetch Staff Time Offs for a Staff Member
export async function getStaffTimeOffs(
    businessId: number,
    staffId: number
): Promise<StaffTimeOff[]> {
    const response = await apiFetch<StaffTimeOffListResponse>(
        `/businesses/${businessId}/staff/${staffId}/time-offs`
    );

    return response.data;
}

// Fetch a Single Staff Time Off by ID
export async function getStaffTimeOff(
    businessId: number,
    staffId: number,
    timeOffId: number
): Promise<StaffTimeOff> {
    const response = await apiFetch<StaffTimeOffResponse>(
        `/businesses/${businessId}/staff/${staffId}/time-offs/${timeOffId}`
    );

    return response.data;
}

// Create, Update, and Delete Staff Time Off
export async function createStaffTimeOff(
    businessId: number,
    staffId: number,
    data: CreateStaffTimeOffData
): Promise<StaffTimeOff> {
    const response = await apiFetch<StaffTimeOffResponse>(
        `/businesses/${businessId}/staff/${staffId}/time-offs`,
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response.data;
}

export async function updateStaffTimeOff(
    businessId: number,
    staffId: number,
    timeOffId: number,
    data: UpdateStaffTimeOffData
): Promise<StaffTimeOff> {
    const response = await apiFetch<StaffTimeOffResponse>(
        `/businesses/${businessId}/staff/${staffId}/time-offs/${timeOffId}`,
        {
            method: "PUT",
            body: JSON.stringify(data),
        }
    );

    return response.data;
}

export async function deleteStaffTimeOff(
    businessId: number,
    staffId: number,
    timeOffId: number
): Promise<void> {
    await apiFetch(
        `/businesses/${businessId}/staff/${staffId}/time-offs/${timeOffId}`,
        {
            method: "DELETE",
        }
    );
}


