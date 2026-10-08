import { apiFetch } from "@/lib/api/client";

// Interface for the Service object returned by the API
export interface Service {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    duration_minutes: number;
    buffer_minutes: number;
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
}

// Interface for the data required to create a new service
export interface CreateServiceData {
    name: string;
    description?: string | null;
    price: number;
    duration_minutes: number;
    buffer_minutes?: number;
    status?: "active" | "inactive";
}

// Interface for the data required to update an existing service
export interface UpdateServiceData {
    name?: string;
    description?: string | null;
    price?: number;
    duration_minutes?: number;
    buffer_minutes?: number;
    status?: "active" | "inactive";
}

// Interfaces for the API responses
interface ServiceListResponse {
    data: Service[];
}

// Interface for the API response when fetching a single service
interface ServiceResponse {
    data: Service;
}

// Function to fetch all services for a given business
export async function getServices(
    businessId: number
): Promise<Service[]> {
    const response = await apiFetch<ServiceListResponse>(
        `/businesses/${businessId}/services`
    );

    return response.data;
}

// Function to fetch a single service by its ID for a given business
export async function getService(
    businessId: number,
    serviceId: number
): Promise<Service> {
    const response = await apiFetch<ServiceResponse>(
        `/businesses/${businessId}/services/${serviceId}`
    );

    return response.data;
}

// Function to create a new service for a given business
export async function createService(
    businessId: number,
    data: CreateServiceData
): Promise<Service> {
    const response = await apiFetch<ServiceResponse>(
        `/businesses/${businessId}/services`,
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response.data;
}

// Function to update an existing service for a given business
export async function updateService(
    businessId: number,
    serviceId: number,
    data: UpdateServiceData
): Promise<Service> {
    const response = await apiFetch<ServiceResponse>(
        `/businesses/${businessId}/services/${serviceId}`,
        {
            method: "PUT",
            body: JSON.stringify(data),
        }
    );

    return response.data;
}

// Function to delete a service for a given business
export async function deleteService(
    businessId: number,
    serviceId: number
): Promise<void> {
    await apiFetch(
        `/businesses/${businessId}/services/${serviceId}`,
        {
            method: "DELETE",
        }
    );
}
