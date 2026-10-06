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

// For the GET /businesses API response, expect array list of businesses
interface BusinessListResponse {
    data: Business[];
}

// For the GET /businesses/{id} API response, expect a single business object
interface BusinessResponse {
    data: Business;
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

// call upon the GET business/{id} API from the Laravel backend
export async function getBusiness(id: number): Promise<Business> {

    const response =
        await apiFetch<BusinessResponse>(
            `/businesses/${id}`
        );

    return response.data;
}