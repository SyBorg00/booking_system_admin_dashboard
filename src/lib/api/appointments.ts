import { apiFetch } from "@/lib/api/client";

// Define the types for appointments and related data structures
export type AppointmentStatus =
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show";

// Interface for the appointment service details
export interface AppointmentService {
    id: number;
    appointment_id: number;
    service_id: number;
    price: string | number;
    currency: string;
    duration_minutes: number;
    buffer_minutes: number;

    service?: {
        id: number;
        name: string;
    } | null;
}

// Interface for the appointment details (THE MAIN INTERFACE)
export interface Appointment {
    id: number;
    business_id: number;
    customer_id: number;
    staff_id: number;
    start_datetime: string;
    end_datetime: string;
    status: AppointmentStatus;
    notes: string | null;
    created_at?: string;
    updated_at?: string;

    // Optional related entities
    customer?: {
        id: number;
        first_name?: string;
        last_name?: string;
        name?: string;
        email?: string | null;
        phone?: string | null;
    } | null;
    staff?: {
        id: number;
        first_name?: string;
        last_name?: string;
        user?: {
            first_name?: string;
            last_name?: string;
        } | null;
    } | null;
    business?: {
        id: number;
        name: string;
        timezone: string;
    } | null;

    // Optional array of appointment services (will call the AppointmentService interface)
    appointment_services?: AppointmentService[];
}

// Interface to be called in the CreateAppointmentData
export interface CreateAppointmentServiceData {
    service_id: number;
}

// Interface for creating the appointment data
export interface CreateAppointmentData {
    business_id: number;
    customer_id: number;
    staff_id: number;
    start_datetime: string;
    services: CreateAppointmentServiceData[];
    notes?: string | null;
}

// Interface for updating the selected appointment
export interface UpdateAppointmentData {
    customer_id?: number;
    staff_id?: number;
    start_datetime?: string;
    status?: AppointmentStatus;
    notes?: string | null;
}

// Interface for rescheduling the selected appointment
export interface RescheduleAppointmentData {
    start_datetime: string;
}

// Interface for appointment search filtering
export interface AppointmentFilters {
    business_id: number;
    staff_id?: number;
    customer_id?: number;
    status?: AppointmentStatus;
    date?: string;
}

// Interface for the response when fetching a list of appointments
interface AppointmentListResponse {
    data: Appointment[];
    count?: number;
}

// Interface for the response when fetching a single appointment
interface SingleAppointmentResponse {
    appointment?: Appointment;
    data?: Appointment;
    message?: string;
}

// Interface for the response when creating an appointment
interface CreatedAppointmentResponse {
    appointment?: Appointment;
    data?: Appointment;
    message?: string;
}

// Helper function to build query parameters for appointment filters
function buildFilters(filters: AppointmentFilters): string {
    const params = new URLSearchParams();

    params.set("business_id", String(filters.business_id));

    if (filters.staff_id !== undefined) {
        params.set("staff_id", String(filters.staff_id));
    }

    if (filters.customer_id !== undefined) {
        params.set("customer_id", String(filters.customer_id));
    }

    if (filters.status) {
        params.set("status", filters.status);
    }

    if (filters.date) {
        params.set("date", filters.date);
    }

    return params.toString();
}

// Get appointments matching the supplied filters
export async function getAppointments(
    filters: AppointmentFilters
): Promise<Appointment[]> {
    const query = buildFilters(filters);

    const response = await apiFetch<AppointmentListResponse>(
        `/appointments?${query}`
    );

    return response.data ?? [];
}

// Fetch a single appointment data via the ID
export async function getAppointment(
    appointmentId: number
): Promise<Appointment> {
    const response = await apiFetch<SingleAppointmentResponse>(
        `/appointments/${appointmentId}`
    );

    const appointment = response.appointment ?? response.data;

    if (!appointment) {
        throw new Error("The API did not return an appointment.");
    }

    return appointment;
}

// Function for creating an appointment
export async function createAppointment(
    data: CreateAppointmentData
): Promise<Appointment | null> {
    const response = await apiFetch<CreatedAppointmentResponse>(
        "/appointments",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response.appointment ?? response.data ?? null;
}

// Function to update an appointment's status and notes
export async function updateAppointment(
    appointmentId: number,
    data: UpdateAppointmentData
): Promise<Appointment | null> {
    const response = await apiFetch<SingleAppointmentResponse>(
        `/appointments/${appointmentId}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );

    return response.appointment ?? response.data ?? null;
}

// Function to reschedule an appointment
export async function rescheduleAppointment(
    appointmentId: number,
    data: RescheduleAppointmentData
): Promise<void> {
    await apiFetch<unknown>(
        `/appointments/${appointmentId}/reschedule`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );
}

// Function to delete an appointment: (NOT SUPPORTED YET, BUT THIS WILL BE THE STRUCTURE)
// export async function deleteAppointment(
//     appointmentId: number
// ): Promise<void> {
//     await apiFetch<unknown>(`/appointments/${appointmentId}`, {
//         method: "DELETE",
//     });
// }

