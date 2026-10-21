"use client";

import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { apiFetch } from "@/lib/api/client";
import { createAppointment } from "@/lib/api/appointments";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import Input from "@/components/ui/Input";

/*
Interfaces for the data structures used in the appointment creation form 
(something that is not directly implemented in the appointment API helper:
- useful for the frontend form)
*/
interface Business {
    id: number;
    name: string;
    timezone: string;
}

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    status?: string;
}

interface StaffMember {
    id: number;
    first_name?: string;
    last_name?: string;
    user?: {
        first_name?: string;
        last_name?: string;
    } | null;
    status?: string;
}

interface Service {
    id: number;
    name: string;
    description?: string | null;
    price: string | number;
    currency?: string;
    duration_minutes: number;
    buffer_minutes: number;
    status?: string;
}

// Generic interface for API responses that return a list of items (different from the appointment API helper, as it will store customers, staff, and services)
interface ApiListResponse<T> {
    data: T[];
}

// This one is for a single item instad (used CURRENTLY by business)
interface ApiItemResponse<T> {
    data: T;
}

// Interface for the available time slots returned by the availability API
interface AvailableSlot {
    start: string;
    end: string;
}

// Interface for the response from the availability API
interface AvailabilityResponse {
    available_slots: AvailableSlot[];
}

// Helper function to get the full name of a staff member, falling back to "Staff #ID" if no name is available
function getStaffName(staff: StaffMember): string {
    const firstName =
        staff.user?.first_name ?? staff.first_name ?? "";
    const lastName =
        staff.user?.last_name ?? staff.last_name ?? "";

    return (
        [firstName, lastName].filter(Boolean).join(" ") ||
        `Staff #${staff.id}`
    );
}

// Helper function to format the price text for a more readable text
function formatPrice(price: string | number, currency = "PHP"): string {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return `${currency} ${price}`;
    }

    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
    }).format(amount);
}

export default function CreateAppointmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialBusinessId = searchParams.get("business_id") ?? "";
    const initialStaffId = searchParams.get("staff_id") ?? "";
    const initialDate = searchParams.get("date") ?? "";
    const initialStart = searchParams.get("start") ?? "";
    const initialServiceIds = (
        searchParams.get("service_ids") ?? ""
    )
        .split(",")
        .filter(Boolean);

    const [businessId, setBusinessId] = useState(initialBusinessId);
    const [businessTimezone, setBusinessTimezone] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [customerId, setCustomerId] = useState("");
    const [staffId, setStaffId] = useState(initialStaffId);
    const [selectedServiceIds, setSelectedServiceIds] =
        useState<string[]>(initialServiceIds);
    const [date, setDate] = useState(initialDate);
    const [startTime, setStartTime] = useState(initialStart);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [notes, setNotes] = useState("");

    const [loadingData, setLoadingData] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load the customers, staff, and services belonging to the business.
    useEffect(() => {
        if (!businessId || !Number.isInteger(Number(businessId))) {
            return;
        }

        let cancelled = false;

        async function loadFormData() {
            setLoadingData(true);
            setError("");

            try {
                const [businessResponse, customerResponse, staffResponse, serviceResponse] =
                    await Promise.all([
                        apiFetch<ApiItemResponse<Business>>(
                            `/businesses/${businessId}`
                        ),
                        apiFetch<ApiListResponse<Customer>>(
                            `/businesses/${businessId}/customers`
                        ),
                        apiFetch<ApiListResponse<StaffMember>>(
                            `/businesses/${businessId}/staff`
                        ),
                        apiFetch<ApiListResponse<Service>>(
                            `/businesses/${businessId}/services`
                        ),
                    ]);

                if (cancelled) return;

                setBusinessTimezone(businessResponse.data.timezone);
                setCustomers(customerResponse.data ?? []);
                setStaffMembers(
                    (staffResponse.data ?? []).filter(
                        (staff) => staff.status !== "inactive"
                    )
                );
                setServices(
                    (serviceResponse.data ?? []).filter(
                        (service) => service.status !== "inactive"
                    )
                );
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load appointment form data."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingData(false);
                }
            }
        }

        void loadFormData();

        return () => {
            cancelled = true;
        };
    }, [businessId]);

    // Remove selected services that are no longer available in the loaded list.
    useEffect(() => {
        if (services.length === 0) return;

        const availableIds = new Set(
            services.map((service) => String(service.id))
        );

        setSelectedServiceIds((current) =>
            current.filter((id) => availableIds.has(id))
        );
    }, [services]);

    // Helper function to extract the time part (HH:MM) from a datetime string
    function getTimePart(value: string): string {
        if (value.includes("T")) {
            return value.split("T")[1].slice(0, 5);
        }

        if (value.includes(" ")) {
            return value.split(" ")[1]?.slice(0, 5) ?? value.slice(0, 5);
        }

        return value.slice(0, 5);
    }

    // Load available time slots based on the selected staff, date, and services
    const loadAvailableSlots = useCallback(async () => {
        if (
            !businessId ||
            !staffId ||
            !date ||
            selectedServiceIds.length === 0
        ) {
            setAvailableSlots([]);
            return;
        }

        setLoadingSlots(true);
        setError("");
        setStartTime("");

        try {
            const params = new URLSearchParams();
            params.set("staff_id", staffId);
            params.set("date", date);

            selectedServiceIds.forEach((id) => {
                params.append("service_ids[]", id);
            });

            const response = await apiFetch<AvailabilityResponse>(
                `/businesses/${businessId}/availability?${params.toString()}`
            );

            const slots = response.available_slots ?? [];
            setAvailableSlots(slots);

            const matchingSlot = slots.find(
                (slot) => getTimePart(slot.start) === getTimePart(initialStart)
            );

            setStartTime(matchingSlot?.start ?? "");

        } catch (err) {
            setAvailableSlots([]);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load available slots."
            );
        } finally {
            setLoadingSlots(false);
        }
    }, [businessId, staffId, date, selectedServiceIds]);

    // Load available slots whenever the staff, date, or selected services change
    function toggleService(serviceId: number) {
        const id = String(serviceId);

        setSelectedServiceIds((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id]
        );

        setStartTime("");
        setAvailableSlots([]);
    }

    // Search for available slots when the user clicks the "Search available slots" button
    function handleSearchSlots() {
        void loadAvailableSlots();
    }

    // Handle form submission to create a new appointment
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (
            !businessId ||
            !customerId ||
            !staffId ||
            !date ||
            !startTime
        ) {
            setError(
                "Please select a business, customer, staff member, date, and available time."
            );
            return;
        }

        if (selectedServiceIds.length === 0) {
            setError("Please select at least one service.");
            return;
        }

        const selectedSlot = availableSlots.find(
            (slot) => slot.start === startTime
        );

        if (!selectedSlot) {
            setError(
                "Please search for availability and select a valid time slot."
            );
            return;
        }

        setSubmitting(true);

        try {
            // Uses the centralized appointments API helper.
            await createAppointment({
                business_id: Number(businessId),
                customer_id: Number(customerId),
                staff_id: Number(staffId),
                start_datetime: `${date} ${selectedSlot.start.length === 5
                    ? `${selectedSlot.start}:00`
                    : selectedSlot.start
                    }`,
                services: selectedServiceIds.map((id) => ({
                    service_id: Number(id),
                })),
                notes: notes.trim() || null,
            });

            router.push(
                `/appointments?business_id=${encodeURIComponent(businessId)}`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create appointment."
            );
        } finally {
            setSubmitting(false);
        }
    }

    const selectedServices = services.filter((service) =>
        selectedServiceIds.includes(String(service.id))
    );

    const totalPrice = selectedServices.reduce(
        (total, service) => total + Number(service.price || 0),
        0
    );

    const totalDuration = selectedServices.reduce(
        (total, service) =>
            total +
            Number(service.duration_minutes || 0) +
            Number(service.buffer_minutes || 0),
        0
    );

    const currency = selectedServices[0]?.currency ?? "PHP";

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Appointment"
                description="Schedule an appointment for a customer."
            />

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700"
                >
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                        Appointment details
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="businessId"
                                className="mb-1 block text-sm font-medium text-[var(--text-primary)]"
                            >
                                Business ID
                            </label>

                            <input
                                id="businessId"
                                type="number"
                                min="1"
                                value={businessId}
                                onChange={(event) => {
                                    setBusinessId(event.target.value);
                                    setStaffId("");
                                    setSelectedServiceIds([]);
                                    setAvailableSlots([]);
                                    setStartTime("");
                                }}
                                required
                                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)]"
                            />
                        </div>

                        <Select
                            label="Customer"
                            value={customerId}
                            onChange={(event) => setCustomerId(event.target.value)}
                            options={[
                                { value: "", label: "Select a customer" },
                                ...customers.map((customer) => ({
                                    value: String(customer.id),
                                    label: `${customer.first_name} ${customer.last_name}`,
                                })),
                            ]}
                        />

                        <Select
                            label="Staff member"
                            value={staffId}
                            onChange={(event) => {
                                setStaffId(event.target.value);
                                setAvailableSlots([]);
                                setStartTime("");
                            }}
                            options={[
                                { value: "", label: "Select staff" },
                                ...staffMembers.map((staff) => ({
                                    value: String(staff.id),
                                    label: getStaffName(staff),
                                })),
                            ]}
                        />
                    </div>
                </Card>

                <Card>
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                        Services
                    </h2>

                    {loadingData ? (
                        <p className="text-sm text-[var(--text-secondary)]">
                            Loading services...
                        </p>
                    ) : services.length === 0 ? (
                        <p className="text-sm text-[var(--text-secondary)]">
                            No active services were found for this business.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {services.map((service) => (
                                <label
                                    key={service.id}
                                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] p-4"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedServiceIds.includes(
                                            String(service.id)
                                        )}
                                        onChange={() =>
                                            toggleService(service.id)
                                        }
                                        className="mt-1"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-[var(--text-primary)]">
                                            {service.name}
                                        </div>

                                        {service.description && (
                                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                {service.description}
                                            </p>
                                        )}

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            {formatPrice(
                                                service.price,
                                                service.currency ?? "PHP"
                                            )}
                                            {" · "}
                                            {service.duration_minutes} min
                                            {service.buffer_minutes > 0 &&
                                                ` + ${service.buffer_minutes} min buffer`}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {selectedServices.length > 0 && (
                        <div className="mt-4 rounded-lg bg-[var(--surface)] p-4">
                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-[var(--text-secondary)]">
                                    Total price
                                </span>
                                <span className="font-semibold text-[var(--text-primary)]">
                                    {formatPrice(totalPrice, currency)}
                                </span>
                            </div>

                            <div className="mt-2 flex justify-between gap-4 text-sm">
                                <span className="text-[var(--text-secondary)]">
                                    Total duration including buffers
                                </span>
                                <span className="font-semibold text-[var(--text-primary)]">
                                    {totalDuration} minutes
                                </span>
                            </div>
                        </div>
                    )}
                </Card>

                <Card>
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                        Date and availability
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <Input label="Appointment Date"
                            type="date"
                            id="appointmentDate"
                            value={date}
                            onChange={(event) => {
                                setDate(event.target.value);
                                setAvailableSlots([]);
                                setStartTime("");
                            }}
                            required
                        />
                    </div>

                    <div className="mt-4">
                        <Button
                            type="button"
                            onClick={handleSearchSlots}
                            disabled={
                                loadingSlots ||
                                !businessId ||
                                !staffId ||
                                !date ||
                                selectedServiceIds.length === 0
                            }
                        >
                            {loadingSlots
                                ? "Searching..."
                                : "Search available slots"}
                        </Button>
                    </div>


                    {availableSlots.length > 0 && (
                        <div className="mt-5">
                            <Select
                                label={`Available time (${businessTimezone || "business local time"})`}
                                value={startTime}
                                onChange={(event) => setStartTime(event.target.value)}
                                options={[
                                    {
                                        value: "",
                                        label: "Select an available time",
                                    },
                                    ...availableSlots.map((slot) => ({
                                        value: slot.start,
                                        label: `${slot.start} – ${slot.end}`,
                                    })),
                                ]}
                            />
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                All appointment times are shown in the business's local timezone.
                            </p>
                        </div>

                    )}

                    {!loadingSlots &&
                        staffId &&
                        date &&
                        selectedServiceIds.length > 0 &&
                        availableSlots.length === 0 && (
                            <p className="mt-4 text-sm text-[var(--text-secondary)]">
                                Search for available slots to see the times
                                you can book.
                            </p>
                        )}
                </Card>

                <Card>
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                        Notes
                    </h2>

                    <TextArea
                        label="Appointment notes (optional)"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Add any additional information..."
                    />
                </Card>

                <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={submitting || loadingData}>
                        {submitting ? "Creating..." : "Create appointment"}
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.back()}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
