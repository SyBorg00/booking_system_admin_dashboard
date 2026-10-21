"use client";

import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatBusinessDateTime } from "@/lib/utils/date-time";

import { getAppointments, type Appointment, type AppointmentStatus } from "@/lib/api/appointments";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

// Define the status options for the filter dropdown
const statusOptions = [
    { value: "", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no_show", label: "No-show" },
];

// Helper function to display the customer's full name from the appointment object
function getCustomerName(appointment: Appointment): string {
    const customer = appointment.customer;

    if (!customer) {
        return `Customer #${appointment.customer_id}`;
    }

    const name = [customer.first_name, customer.last_name]
        .filter(Boolean)
        .join(" ");

    return name || customer.name || `Customer #${customer.id}`;
}

// Helper function to display the staff's name from the appointment object
function getStaffName(appointment: Appointment): string {
    const staff = appointment.staff;

    if (!staff) {
        return `Staff #${appointment.staff_id}`;
    }

    const firstName =
        staff.user?.first_name ?? staff.first_name ?? "";
    const lastName =
        staff.user?.last_name ?? staff.last_name ?? "";

    const name = [firstName, lastName]
        .filter(Boolean)
        .join(" ");

    return name || `Staff #${staff.id}`;
}


// Helper function to determine the badge variant based on the appointment status
function getStatusVariant(
    status: AppointmentStatus
): "default" | "success" | "warning" | "danger" {
    switch (status) {
        case "confirmed":
        case "completed":
            return "success";

        case "pending":
            return "warning";

        case "cancelled":
        case "no_show":
            return "danger";

        default:
            return "default";
    }
}

// Helper function to format the appointment status for display
function formatStatus(status: AppointmentStatus): string {
    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// The main component for the Appointments page
export default function AppointmentsPage() {

    // State variables for managing form inputs, appointments data, loading state, and error messages
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialBusinessId = searchParams.get("business_id") ?? "";
    const initialStatus = searchParams.get("status") ?? "";
    const initialDate = searchParams.get("date") ?? "";

    const [businessId, setBusinessId] = useState(initialBusinessId);
    const [status, setStatus] = useState(initialStatus);
    const [date, setDate] = useState(initialDate);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState("");

    // Function to load appointments based on the current filter criteria
    const loadAppointments = useCallback(async () => {
        const parsedBusinessId = Number(businessId);

        if (
            !businessId.trim() ||
            !Number.isInteger(parsedBusinessId) ||
            parsedBusinessId <= 0
        ) {
            setError("Enter a valid business ID.");
            setAppointments([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const results = await getAppointments({
                business_id: parsedBusinessId,
                ...(status
                    ? { status: status as AppointmentStatus }
                    : {}),
                ...(date ? { date } : {}),
            });

            setAppointments(results);
            setHasSearched(true);
        } catch (err) {
            setAppointments([]);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load appointments."
            );
            setHasSearched(false);
        } finally {
            setLoading(false);
        }
    }, [businessId, status, date]);

    // Use effect to load appointments when the component mounts if there's an initial business ID
    useEffect(() => {
        if (initialBusinessId) {
            void loadAppointments();
        }
        // Run the initial search when the page loads with a business ID.
    }, []);

    // Handle form submission to trigger the search for appointments
    function handleSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        void loadAppointments();
    }

    // Handle resetting the filters and clearing the appointments list
    function handleReset() {
        setStatus("");
        setDate("");
        setAppointments([]);
        setError("");
        setHasSearched(false);
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <PageHeader
                title="Appointments"
                description="View and filter appointments for a business."
            />

            {/* APPOINTMENT FILTER SEARCH SECTION*/}
            <Card>
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        {/* Input field for entering the business ID */}
                        <Input
                            label="Business ID"
                            type="number"
                            min="1"
                            value={businessId}
                            onChange={(event) =>
                                setBusinessId(event.target.value)
                            }
                            placeholder="Enter business ID"
                            required
                        />

                        {/* Dropdown select for filtering by appointment status */}
                        <Select
                            label="Status"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            options={statusOptions}
                        />

                        {/* Input field for selecting the appointment date */}
                        <Input
                            label="Appointment date"
                            type="date"
                            value={date}
                            onChange={(event) =>
                                setDate(event.target.value)
                            }
                        />
                    </div>

                    {/* Buttons for searching, resetting filters, and creating a new appointment */}
                    <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Loading..." : "Search"}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Reset filters
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.push(
                                    `/appointments/create?business_id=${encodeURIComponent(
                                        businessId
                                    )}`
                                )
                            }
                            disabled={!businessId.trim()}
                        >
                            Create appointment
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Display an error message if there's an error during the search */}
            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
                >
                    {error}
                </div>
            )}

            {/* APPOINTMENT RECORDS TABLE */}
            <Card>
                {/* Headers for this section */}
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Appointment Records
                    </h2>

                    <span className="text-sm text-[var(--text-secondary)]">
                        {hasSearched
                            ? `${appointments.length} appointment${appointments.length === 1 ? "" : "s"
                            }`
                            : "Not searched"}
                    </span>
                </div>

                {/* Conditional rendering based on the search state, loading state, and the number of appointments found */}
                {!hasSearched && !loading ? (
                    <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                        Enter a business ID and search to view appointments.
                    </p>
                ) : loading ? (
                    <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                        Loading appointments...
                    </p>
                ) : appointments.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                        No appointments found for the selected filters.
                    </p>
                ) : (
                    <div className="overflow-x-auto">

                        {/* Table displaying the list of appointments with relevant details */}
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                                    <th className="px-4 py-3 font-medium">
                                        Appointment
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Staff
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Start
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        End
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {appointments.map((appointment) => (
                                    <tr
                                        key={appointment.id}
                                        className="border-b border-[var(--border)] last:border-0"
                                    >
                                        <td className="px-4 py-4 font-medium text-[var(--text-primary)]">
                                            #{appointment.id}
                                        </td>

                                        <td className="px-4 py-4 text-[var(--text-primary)]">
                                            {getCustomerName(appointment)}
                                        </td>

                                        <td className="px-4 py-4 text-[var(--text-primary)]">
                                            {getStaffName(appointment)}
                                        </td>

                                        <td className="px-4 py-4 text-[var(--text-secondary)]">
                                            {appointment.business ? (
                                                formatBusinessDateTime(
                                                    appointment.start_datetime,
                                                    appointment.business.timezone,
                                                )
                                            ) : (
                                                "Business timezone unavailable"
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-[var(--text-secondary)]">
                                            {appointment.business ? (
                                                formatBusinessDateTime(
                                                    appointment.end_datetime,
                                                    appointment.business.timezone,
                                                )
                                            ) : (
                                                "Business timezone unavailable"
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <Badge
                                                variant={getStatusVariant(
                                                    appointment.status
                                                )}
                                            >
                                                {formatStatus(
                                                    appointment.status
                                                )}
                                            </Badge>
                                        </td>

                                        <td className="px-4 py-4">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() =>
                                                    router.push(
                                                        `/appointments/${appointment.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
