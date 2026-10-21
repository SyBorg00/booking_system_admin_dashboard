"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { formatBusinessDateTime } from "@/lib/utils/date-time";
import { getAppointment, type Appointment, rescheduleAppointment, updateAppointment } from "@/lib/api/appointments";
import { type AvailableSlot, type AvailabilityResponse } from "@/lib/api/availability";
import Button from "@/components/ui/Button";

function getSlotTime(value: string): string {
    if (value.includes("T")) {
        return value.split("T")[1].slice(0, 5);
    }

    if (value.includes(" ")) {
        return value.split(" ")[1]?.slice(0, 5) ?? value.slice(0, 5);
    }

    return value.slice(0, 5);
}

function toAppointmentDateTime(date: string, time: string): string {
    // Availability normally returns HH:mm.
    // Preserve full datetime values if the API returns them.
    if (time.includes("T") || time.includes(" ")) {
        return time;
    }

    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
        throw new Error("The selected time slot has an invalid format.");
    }

    return `${date} ${time.length === 5 ? `${time}:00` : time}`;
}


const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-gray-100 text-gray-700",
};

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

function formatMoney(
    amount: string | number,
    currency = "PHP"
): string {
    const value = Number(amount);

    if (!Number.isFinite(value)) return String(amount);

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
        }).format(value);
    } catch {
        return `${currency} ${value.toFixed(2)}`;
    }
}

function DetailItem({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
            <div className="text-sm font-medium text-[var(--text-primary)]">
                {children}
            </div>
        </div>
    );
}

export default function AppointmentDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    // 
    const appointmentId = params.id;
    const [appointment, setAppointment] =
        useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // State and variables when rescheduling an appointment
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [rescheduling, setRescheduling] = useState(false);
    const [rescheduleError, setRescheduleError] = useState("");
    const [rescheduleSuccess, setRescheduleSuccess] = useState("");
    const [showReschedule, setShowReschedule] = useState(false);

    // State and variable for cancelling an appointment
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [cancelSuccess, setCancelSuccess] = useState("");

    // State and variable for handling statuses
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [statusSuccess, setStatusSuccess] = useState("");


    async function loadRescheduleSlots() {
        if (!appointment || !rescheduleDate) {
            setRescheduleError("Please select a date.");
            return;
        }

        const serviceIds = [
            ...new Set(
                (appointment.appointment_services ?? [])
                    .map((item) => item.service_id ?? item.service?.id)
                    .filter((id): id is number => typeof id === "number")
            ),
        ];

        if (serviceIds.length === 0) {
            setRescheduleError(
                "No booked service IDs were returned for this appointment."
            );
            return;
        }

        setLoadingSlots(true);
        setRescheduleError("");
        setRescheduleSuccess("");
        setAvailableSlots([]);
        setSelectedSlot("");

        try {
            const query = new URLSearchParams();

            query.set("staff_id", String(appointment.staff_id));
            query.set("date", rescheduleDate);

            serviceIds.forEach((id) => {
                query.append("service_ids[]", String(id));
            });

            const response = await apiFetch<AvailabilityResponse>(
                `/businesses/${appointment.business_id}/availability?${query.toString()}`
            );

            setAvailableSlots(response.available_slots ?? []);

            if (!response.available_slots?.length) {
                setRescheduleError(
                    "No available slots were found for this date."
                );
            }
        } catch (err) {
            setRescheduleError(
                err instanceof Error
                    ? err.message
                    : "Failed to load available slots."
            );
        } finally {
            setLoadingSlots(false);
        }
    }


    // RESCHEDULING HELPER FUNCTION
    async function handleReschedule() {
        if (!appointment || !rescheduleDate || !selectedSlot) {
            setRescheduleError(
                "Please select a date and an available time."
            );
            return;
        }

        const slot = availableSlots.find(
            (item) => item.start === selectedSlot
        );

        if (!slot) {
            setRescheduleError(
                "Please select a valid slot from the availability results."
            );
            return;
        }

        setRescheduling(true);
        setRescheduleError("");
        setRescheduleSuccess("");

        try {
            // Convert the selected business-local date and time
            // into the datetime format expected by your Laravel API.
            const startDatetime = toAppointmentDateTime(
                rescheduleDate,
                slot.start
            );
            await rescheduleAppointment(
                Number(appointmentId),
                {
                    start_datetime: startDatetime,
                }
            );

            // Fetch the updated appointment to get the new end time
            // and any other server-calculated fields.
            const updatedAppointment = await getAppointment(
                Number(appointmentId)
            );

            setAppointment(updatedAppointment);

            setRescheduleSuccess(
                "Appointment rescheduled successfully."
            );

            setShowReschedule(false);
            setAvailableSlots([]);
            setSelectedSlot("");
        } catch (err) {
            setRescheduleError(
                err instanceof Error
                    ? err.message
                    : "Failed to reschedule appointment."
            );
        } finally {
            setRescheduling(false);
        }
    }

    // CANCEL APPOINTMENT HELPER FUNCTION
    async function handleCancelAppointment() {
        if (!appointment) return;

        const currentStatus = appointment.status.toLowerCase();

        if (
            ["cancelled", "completed", "no_show"].includes(currentStatus)
        ) {
            setCancelError(
                "This appointment can no longer be cancelled."
            );
            setShowCancelDialog(false);
            return;
        }

        setCancelling(true);
        setCancelError("");
        setCancelSuccess("");

        try {
            // Update the appointment status using the API helper.
            await updateAppointment(appointment.id, {
                status: "cancelled",
            });

            // Fetch the latest appointment details from Laravel.
            const updatedAppointment = await getAppointment(
                appointment.id
            );

            setAppointment(updatedAppointment);

            setCancelSuccess("Appointment cancelled successfully.");
            setShowCancelDialog(false);
        } catch (err) {
            setCancelError(
                err instanceof Error
                    ? err.message
                    : "Failed to cancel appointment."
            );
        } finally {
            setCancelling(false);
        }
    }

    // STATUS HANDLING HELPER FUNCTION
    async function handleStatusChange(
        nextStatus: "confirmed" | "completed" | "no_show"
    ) {
        if (!appointment) return;

        const currentStatus = appointment.status.toLowerCase();

        const allowedTransitions: Record<string, string[]> = {
            pending: ["confirmed"],
            confirmed: ["completed", "no_show"],
        };

        if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
            setStatusError(
                `Cannot change status from "${currentStatus}" to "${nextStatus}".`
            );
            return;
        }

        setUpdatingStatus(true);
        setStatusError("");
        setStatusSuccess("");

        try {
            // Update the appointment status through the API helper.
            await updateAppointment(appointment.id, {
                status: nextStatus,
            });

            // Fetch the latest appointment details.
            const updatedAppointment = await getAppointment(
                appointment.id
            );

            setAppointment(updatedAppointment);

            setStatusSuccess(
                `Appointment status changed to "${nextStatus.replaceAll("_", " ")}".`
            );
        } catch (err) {
            setStatusError(
                err instanceof Error
                    ? err.message
                    : "Failed to update appointment status."
            );
        } finally {
            setUpdatingStatus(false);
        }
    }


    useEffect(() => {
        let cancelled = false;

        async function loadAppointment() {
            setLoading(true);
            setError("");

            try {
                const result = await getAppointment(Number(appointmentId));
                setAppointment(result);
                if (!result) {
                    throw new Error(
                        "The appointment response was empty or invalid."
                    );
                }
                if (!cancelled) {
                    setAppointment(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load appointment."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        if (appointmentId) {
            void loadAppointment();
        }

        return () => {
            cancelled = true;
        };
    }, [appointmentId]);

    // LOADING STATE PAGE
    if (loading) {
        return (
            <div className="p-6 text-[var(--text-secondary)]">
                Loading appointment details...
            </div>
        );
    }

    // ERROR STATE PAGE
    if (error || !appointment) {
        return (
            <div className="space-y-4 p-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm text-[var(--text-secondary)] hover:underline"
                >
                    ← Back
                </button>

                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error || "Appointment not found."}
                </div>
            </div>
        );
    }

    const services = appointment.appointment_services ?? [];

    const totalPrice = services.reduce(
        (total, item) => total + Number(item.price || 0),
        0
    );

    const currency = services.find((item) => item.currency)?.currency
        ?? "PHP";

    const status = appointment.status.toLowerCase();

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
            {/* Page header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <Link
                        href={`/appointments?business_id=${appointment.business_id}`}
                        className="text-sm text-[var(--text-secondary)] hover:underline"
                    >
                        ← Back to appointments
                    </Link>

                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        Appointment #{appointment.id}
                    </h1>

                    <p className="text-sm text-[var(--text-secondary)]">
                        View appointment information and booked services.
                    </p>
                </div>


                <div className="flex flex-wrap items-center gap-3">
                    <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles[status] ??
                            "bg-gray-100 text-gray-700"
                            }`}
                    >
                        {status.replaceAll("_", " ")}
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            setCancelError("");
                            setShowCancelDialog(true);
                        }}
                        disabled={
                            cancelling ||
                            ["cancelled", "completed", "no_show"].includes(status)
                        }
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel appointment
                    </button>
                </div>

            </div>

            {/* Schedule info section */}
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                    Schedule
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                    <DetailItem label="Start">
                        {appointment.business ? (
                            formatBusinessDateTime(
                                appointment.start_datetime,
                                appointment.business.timezone,
                            )
                        ) : (
                            "Business timezone unavailable"
                        )}
                    </DetailItem>

                    <DetailItem label="End">
                        {appointment.business ? (
                            formatBusinessDateTime(
                                appointment.end_datetime,
                                appointment.business.timezone,
                            )
                        ) : (
                            "Business timezone unavailable"
                        )}
                    </DetailItem>
                </div>
            </section>

            {/* STATUS HANDLING SECTION */}
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Appointment status
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Current status: {status.replaceAll("_", " ")}
                </p>

                {/* Button for chanGing the status of an appointment*/}
                <div className="mt-4 flex flex-wrap gap-3">

                    {status === "pending" && (
                        <Button
                            type="button"
                            onClick={() => handleStatusChange("confirmed")}
                            disabled={updatingStatus}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {updatingStatus ? "Updating..." : "Confirm appointment"}
                        </Button>
                    )}

                    {status === "confirmed" && (
                        <>
                            <Button
                                type="button"
                                onClick={() => handleStatusChange("completed")}
                                disabled={updatingStatus}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                {updatingStatus ? "Updating..." : "Mark completed"}
                            </Button>

                            <Button
                                type="button"
                                onClick={() => handleStatusChange("no_show")}
                                disabled={updatingStatus}
                                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-black/5 disabled:opacity-50"
                            >
                                {updatingStatus ? "Updating..." : "Mark no-show"}
                            </Button>
                        </>
                    )}

                    {["completed", "cancelled", "no_show"].includes(status) && (
                        <p className="text-sm text-[var(--text-secondary)]">
                            This appointment has reached a final status. No further status actions are available.
                        </p>
                    )}
                </div>

                {statusSuccess && (
                    <p role="status" className="mt-4 text-sm text-green-700">
                        {statusSuccess}
                    </p>
                )}

                {statusError && (
                    <p role="alert" className="mt-4 text-sm text-red-600">
                        {statusError}
                    </p>
                )}
            </section>

            {/* Reschedule Appointment */}
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Manage schedule
                        </h2>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Choose a new available date and time for this appointment.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            setShowReschedule((current) => !current);
                            setRescheduleError("");
                            setRescheduleSuccess("");
                        }}
                        disabled={
                            appointment.status === "cancelled" ||
                            appointment.status === "completed" ||
                            appointment.status === "no_show"
                        }
                    >
                        {showReschedule ? "Close" : "Reschedule"}
                    </Button>

                </div>

                {rescheduleSuccess && (
                    <p role="status" className="mt-4 text-sm text-green-700">
                        {rescheduleSuccess}
                    </p>
                )}

                {showReschedule && (
                    <div className="mt-5 space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="reschedule-date"
                                className="block text-sm font-medium text-[var(--text-primary)]"
                            >
                                New date
                            </label>

                            <input
                                id="reschedule-date"
                                type="date"
                                value={rescheduleDate}
                                onChange={(event) => {
                                    setRescheduleDate(event.target.value);
                                    setAvailableSlots([]);
                                    setSelectedSlot("");
                                    setRescheduleError("");
                                    setRescheduleSuccess("");
                                }}
                                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={loadRescheduleSlots}
                            disabled={loadingSlots || !rescheduleDate}
                            className="rounded-lg bg-[var(--text-primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] disabled:opacity-50"
                        >
                            {loadingSlots ? "Checking availability..." : "Find available times"}
                        </button>

                        {availableSlots.length > 0 && (
                            <div className="space-y-2">
                                <label
                                    htmlFor="reschedule-slot"
                                    className="block text-sm font-medium text-[var(--text-primary)]"
                                >
                                    Available time
                                </label>

                                <select
                                    id="reschedule-slot"
                                    value={selectedSlot}
                                    onChange={(event) => setSelectedSlot(event.target.value)}
                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                                >
                                    <option value="">Select a time</option>

                                    {availableSlots.map((slot) => (
                                        <option key={slot.start} value={slot.start}>
                                            {getSlotTime(slot.start)} – {getSlotTime(slot.end)}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={handleReschedule}
                                    disabled={rescheduling || !selectedSlot}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {rescheduling ? "Rescheduling..." : "Confirm reschedule"}
                                </button>
                            </div>
                        )}

                        {rescheduleError && (
                            <p role="alert" className="text-sm text-red-600">
                                {rescheduleError}
                            </p>
                        )}
                    </div>
                )}
            </section>


            {/* Customer and staff */}
            <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                        Customer
                    </h2>

                    <div className="space-y-4">
                        <DetailItem label="Name">
                            {getCustomerName(appointment)}
                        </DetailItem>

                        <DetailItem label="Email">
                            {appointment.customer?.email || "Not provided"}
                        </DetailItem>

                        <DetailItem label="Phone">
                            {appointment.customer?.phone || "Not provided"}
                        </DetailItem>
                    </div>
                </section>

                <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                        Staff member
                    </h2>

                    <div className="space-y-4">
                        <DetailItem label="Name">
                            {getStaffName(appointment)}
                        </DetailItem>

                        <DetailItem label="Staff ID">
                            {appointment.staff_id}
                        </DetailItem>

                        <DetailItem label="Business ID">
                            {appointment.business_id}
                        </DetailItem>
                    </div>
                </section>
            </div>

            {/* Services */}
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                    Booked services
                </h2>

                {services.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)]">
                        No service details were returned for this appointment.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {services.map((item, index) => (
                            <div
                                key={`${item.service_id ?? item.service?.id ?? "service"}-${index}`}
                                className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium text-[var(--text-primary)]">
                                        {item.service?.name ??
                                            `Service #${item.service_id ?? item.service?.id ?? "Unknown"}`}
                                    </p>

                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Duration: {item.duration_minutes ?? "—"} minutes
                                    </p>

                                    {(item.buffer_minutes ?? 0) > 0 && (
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Buffer: {item.buffer_minutes} minutes
                                        </p>
                                    )}
                                </div>

                                <p className="font-medium text-[var(--text-primary)]">
                                    {formatMoney(item.price, item.currency ?? currency)}
                                </p>
                            </div>
                        ))}

                        <div className="flex justify-between gap-4 pt-2">
                            <span className="font-semibold text-[var(--text-primary)]">
                                Total
                            </span>

                            <span className="text-lg font-bold text-[var(--text-primary)]">
                                {formatMoney(totalPrice, currency)}
                            </span>
                        </div>
                    </div>
                )}
            </section>

            {/* Notes */}
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">
                    Notes
                </h2>

                <p className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
                    {appointment.notes?.trim() || "No notes for this appointment."}
                </p>
            </section>

            {/* CANCEL DIALOG SECTION*/}
            {cancelSuccess && (
                <p role="status" className="text-sm text-green-700">
                    {cancelSuccess}
                </p>
            )}

            {cancelError && !showCancelDialog && (
                <p role="alert" className="text-sm text-red-600">
                    {cancelError}
                </p>
            )}

            {showCancelDialog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !cancelling
                        ) {
                            setShowCancelDialog(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-dialog-title"
                        className="w-full max-w-md space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
                    >
                        <h2
                            id="cancel-dialog-title"
                            className="text-xl font-semibold text-[var(--text-primary)]"
                        >
                            Cancel appointment?
                        </h2>

                        <p className="text-sm text-[var(--text-secondary)]">
                            Are you sure you want to cancel appointment #
                            {appointment.id}? This will change its status to
                            cancelled.
                        </p>

                        {cancelError && (
                            <p role="alert" className="text-sm text-red-600">
                                {cancelError}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={() => {
                                    setShowCancelDialog(false);
                                    setCancelError("");
                                }}
                                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] disabled:opacity-50"
                            >
                                Keep appointment
                            </button>

                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={handleCancelAppointment}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {cancelling
                                    ? "Cancelling..."
                                    : "Confirm cancellation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
