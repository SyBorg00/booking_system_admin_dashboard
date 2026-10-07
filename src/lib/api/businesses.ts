import { apiFetch } from "@/lib/api/client";

// Main interface for a business object returned from the API
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

// Interface for creating a new business object to send to the API
export interface CreateBusinessData {
    name: string;
    slug?: string;
    description?: string | null;
    currency: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    timezone: string;
    logo?: string | null;
    status?: "active" | "inactive";
}

// Interface for updating an existing business object to send to the API
export interface UpdateBusinessData {
    name?: string;
    slug?: string;
    description?: string | null;
    currency?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    timezone?: string;
    logo?: string | null;
    status?: "active" | "inactive";
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

// call upon the POST business API from the Laravel backend
export async function createBusiness(
    data: CreateBusinessData
): Promise<Business> {
    const response = await apiFetch<BusinessResponse>(
        "/businesses",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response.data;
}

// call upon the PATCH business/{id} API from the Laravel backend
export async function updateBusiness(
    id: number,
    data: UpdateBusinessData
): Promise<Business> {
    const response = await apiFetch<BusinessResponse>(
        `/businesses/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );

    return response.data;
}