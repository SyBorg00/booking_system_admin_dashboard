import { apiFetch } from "@/lib/api/client";

export interface Business {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    currency: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    timezone: string;
    logo: string | null;
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
}

interface BusinessListResponse {
    data: Business[];
}

// call upon the GET business API from the Laravel backend
export async function getBusinesses(): Promise<
    Business[]
> {
    const response =
        await apiFetch<BusinessListResponse>(
            "/businesses"
        );

    return response.data;
}
