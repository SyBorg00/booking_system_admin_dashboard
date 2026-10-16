import { apiFetch } from "@/lib/api/client";

export interface AvailableSlot {
    start: string;
    end: string;
}

export interface GenerateAvailabilityData {
    staff_id: number;
    service_ids: number[];
    date: string;
}

export interface AvailabilityResponse {
    available_slots: AvailableSlot[];
}

export async function getAvailableSlots(
    businessId: number,
    data: GenerateAvailabilityData
): Promise<AvailableSlot[]> {
    const params = new URLSearchParams();

    params.set("staff_id", String(data.staff_id));
    params.set("date", data.date);

    for (const serviceId of data.service_ids) {
        params.append("service_ids[]", String(serviceId));
    }

    const response = await apiFetch<AvailabilityResponse>(
        `/businesses/${businessId}/availability?${params.toString()}`
    );

    return response.available_slots;
}


