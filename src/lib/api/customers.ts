import { apiFetch } from "@/lib/api/client";

// Interface representing a customer object
export interface Customer {
    id: number;
    business_id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// Interface representing the data required to create a new customer
export interface CreateCustomerData {
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
}

// Interface representing the data that can be updated for an existing customer
export interface UpdateCustomerData {
    first_name?: string;
    last_name?: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
}

// Response interfaces for API calls
interface CustomerListResponse {
    data: Customer[];
}

// Response interface for a single customer
interface CustomerResponse {
    data: Customer;
}

// Function to fetch a list of customers for a specific business
export async function getCustomers(
    businessId: number
): Promise<Customer[]> {
    const response =
        await apiFetch<CustomerListResponse>(
            `/businesses/${businessId}/customers`
        );

    return response.data;
}

// Function to fetch a specific customer by ID for a specific business
export async function getCustomer(
    businessId: number,
    customerId: number
): Promise<Customer> {
    const response =
        await apiFetch<CustomerResponse>(
            `/businesses/${businessId}/customers/${customerId}`
        );

    return response.data;
}

// Function to create a new customer for a specific business
export async function createCustomer(
    businessId: number,
    data: CreateCustomerData
): Promise<Customer> {
    const response =
        await apiFetch<CustomerResponse>(
            `/businesses/${businessId}/customers`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

    return response.data;
}

// Function to update an existing customer for a specific business
export async function updateCustomer(
    businessId: number,
    customerId: number,
    data: UpdateCustomerData
): Promise<Customer> {
    const response =
        await apiFetch<CustomerResponse>(
            `/businesses/${businessId}/customers/${customerId}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );

    return response.data;
}

// Function to delete a customer for a specific business
export async function deleteCustomer(
    businessId: number,
    customerId: number
): Promise<void> {
    await apiFetch(
        `/businesses/${businessId}/customers/${customerId}`,
        {
            method: "DELETE",
        }
    );
}
