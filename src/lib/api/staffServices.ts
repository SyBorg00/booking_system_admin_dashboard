import { apiFetch } from "@/lib/api/client";

export interface StaffService {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
    price: string | number;
    currency: string;
    duration_minutes: number;
    buffer_minutes: number;
    status: "active" | "inactive";
}

interface StaffServicesResponse {
    data: StaffService[];
}

interface StaffServiceResponse {
    data: StaffService;
}

// Fetches the list of services assigned to a staff member
export async function getStaffServices(
    businessId: number,
    staffId: number
): Promise<StaffService[]> {
    const response = await apiFetch<StaffServicesResponse>(
        `/businesses/${businessId}/staff/${staffId}/services`
    );

    return response.data;
}

// Assigns a service to a staff member
export async function assignStaffService(
    businessId: number,
    staffId: number,
    serviceId: number
): Promise<StaffService> {
    const response = await apiFetch<StaffServiceResponse>(
        `/businesses/${businessId}/staff/${staffId}/services`,
        {
            method: "POST",
            body: JSON.stringify({
                service_id: serviceId,
            }),
        }
    );

    return response.data;
}

// Removes a service from a staff member
export async function removeStaffService(
    businessId: number,
    staffId: number,
    serviceId: number
): Promise<void> {
    await apiFetch(
        `/businesses/${businessId}/staff/${staffId}/services/${serviceId}`,
        {
            method: "DELETE",
        }
    );
}


