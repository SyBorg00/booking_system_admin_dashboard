"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api/client";
import {
    getAvailableSlots,
    type AvailableSlot,
} from "@/lib/api/availability";
import {
    getStaffServices,
    type StaffService,
} from "@/lib/api/staffServices";

interface StaffMember {
    id: number;
    user?: {
        first_name?: string;
        last_name?: string;
    } | null;
    first_name?: string;
    last_name?: string;
    position?: string | null;
}

interface ApiListResponse<T> {
    data: T[];
}

function getStaffName(staff: StaffMember): string {
    const firstName = staff.user?.first_name ?? staff.first_name ?? "";
    const lastName = staff.user?.last_name ?? staff.last_name ?? "";

    return `${firstName} ${lastName}`.trim() || `Staff #${staff.id}`;
}

function getLocalDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}



export default function AvailabilityPage() {
    const params = useParams<{ id: string }>();
    const businessId = Number(params.id);

    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [assignedServices, setAssignedServices] = useState<StaffService[]>(
        []
    );

    const [staffId, setStaffId] = useState("");
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [date, setDate] = useState(getLocalDate());

    const [slots, setSlots] = useState<AvailableSlot[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const [loadingStaff, setLoadingStaff] = useState(true);
    const [loadingServices, setLoadingServices] = useState(false);
    const [searching, setSearching] = useState(false);

    const [error, setError] = useState("");
    const [optionsError, setOptionsError] = useState("");

    const loadStaff = useCallback(async () => {
        if (!Number.isInteger(businessId) || businessId <= 0) {
            setOptionsError("Invalid business ID.");
            setLoadingStaff(false);
            return;
        }

        setLoadingStaff(true);
        setOptionsError("");

        try {
            const response = await apiFetch<ApiListResponse<StaffMember>>(
                `/businesses/${businessId}/staff`
            );

            setStaffMembers(response.data ?? []);
        } catch (err) {
            setOptionsError(
                err instanceof Error
                    ? err.message
                    : "Failed to load staff members."
            );
        } finally {
            setLoadingStaff(false);
        }
    }, [businessId]);

    useEffect(() => {
        void loadStaff();
    }, [loadStaff]);

    // Load only the services assigned to the selected staff member.
    useEffect(() => {
        if (!staffId) {
            setAssignedServices([]);
            setLoadingServices(false);
            return;
        }

        let cancelled = false;

        async function loadAssignedServices() {
            setLoadingServices(true);
            setAssignedServices([]);
            setSelectedServiceIds([]);
            setSlots([]);
            setHasSearched(false);
            setError("");

            try {
                const services = await getStaffServices(
                    businessId,
                    Number(staffId)
                );

                if (!cancelled) {
                    setAssignedServices(services);
                }
            } catch (err) {
                if (!cancelled) {
                    setAssignedServices([]);
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load the staff member's assigned services."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingServices(false);
                }
            }
        }

        void loadAssignedServices();

        return () => {
            cancelled = true;
        };
    }, [businessId, staffId]);

    const activeAssignedServices = useMemo(
        () =>
            assignedServices.filter(
                (service) => service.status === "active"
            ),
        [assignedServices]
    );

    function handleStaffChange(value: string) {
        setStaffId(value);
        setAssignedServices([]);
        setSelectedServiceIds([]);
        setSlots([]);
        setHasSearched(false);
        setError("");
    }

    function toggleService(serviceId: number) {
        setSelectedServiceIds((current) =>
            current.includes(serviceId)
                ? current.filter((id) => id !== serviceId)
                : [...current, serviceId]
        );

        setSlots([]);
        setHasSearched(false);
        setError("");
    }

    async function handleSearch(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSlots([]);
        setHasSearched(false);

        if (!staffId) {
            setError("Please select a staff member.");
            return;
        }

        if (selectedServiceIds.length === 0) {
            setError("Please select at least one assigned service.");
            return;
        }

        if (!date) {
            setError("Please select a date.");
            return;
        }

        setSearching(true);

        try {
            const availableSlots = await getAvailableSlots(businessId, {
                staff_id: Number(staffId),
                service_ids: selectedServiceIds,
                date,
            });

            setSlots(availableSlots);
            setHasSearched(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to retrieve available slots."
            );
        } finally {
            setSearching(false);
        }
    }

    function getBookingHref(slot: AvailableSlot): string {
        const query = new URLSearchParams({
            business_id: String(businessId),
            staff_id: staffId,
            date,
            start: slot.start,
        });

        selectedServiceIds.forEach((serviceId) => {
            query.append("service_ids", String(serviceId));
        });

        return `/appointments/create?${query.toString()}`;
    }

    return (
        <main className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                    Availability
                </h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Find available appointment times for a staff member's
                    assigned services.
                </p>
            </header>

            {optionsError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700"
                >
                    {optionsError}
                </div>
            )}

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Search available slots
                </h2>

                {loadingStaff ? (
                    <p className="mt-4 text-sm text-[var(--text-secondary)]">
                        Loading staff members...
                    </p>
                ) : (
                    <form onSubmit={handleSearch} className="mt-5 space-y-5">
                        <div>
                            <label
                                htmlFor="staff"
                                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                            >
                                Staff member
                            </label>

                            <select
                                id="staff"
                                value={staffId}
                                onChange={(event) =>
                                    handleStaffChange(event.target.value)
                                }
                                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                                required
                            >
                                <option value="">
                                    Select staff member
                                </option>

                                {staffMembers.map((staff) => (
                                    <option
                                        key={staff.id}
                                        value={staff.id}
                                    >
                                        {getStaffName(staff)}
                                        {staff.position
                                            ? ` — ${staff.position}`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            {staffMembers.length === 0 &&
                                !optionsError && (
                                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                                        No staff members were found for this
                                        business.
                                    </p>
                                )}
                        </div>

                        <div>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                                    Assigned services
                                </h3>

                                {staffId && (
                                    <Link
                                        href={`/businesses/${businessId}/staff/${staffId}/services`}
                                        className="inline-flex items-center rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:opacity-75"
                                    >
                                        Manage Staff Services
                                    </Link>
                                )}
                            </div>

                            {!staffId ? (
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Select a staff member to view their
                                    assigned services.
                                </p>
                            ) : loadingServices ? (
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Loading assigned services...
                                </p>
                            ) : activeAssignedServices.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        This staff member has no active
                                        assigned services.
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Assign services before searching
                                        for availability.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {activeAssignedServices.map((service) => {
                                        const checked =
                                            selectedServiceIds.includes(
                                                service.id
                                            );

                                        return (
                                            <label
                                                key={service.id}
                                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${checked
                                                    ? "border-[var(--primary)]"
                                                    : "border-[var(--border)]"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleService(
                                                            service.id
                                                        )
                                                    }
                                                    className="mt-1"
                                                />

                                                <span className="min-w-0">
                                                    <span className="block text-sm font-medium text-[var(--text-primary)]">
                                                        {service.name}
                                                    </span>

                                                    <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                                                        {service.duration_minutes}{" "}
                                                        min
                                                        {service.buffer_minutes >
                                                            0
                                                            ? ` + ${service.buffer_minutes} min buffer`
                                                            : ""}
                                                    </span>

                                                    <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                                                        {service.currency}{" "}
                                                        {Number(
                                                            service.price
                                                        ).toFixed(2)}
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {selectedServiceIds.length > 0 && (
                            <p className="text-sm text-[var(--text-secondary)]">
                                {selectedServiceIds.length} service
                                {selectedServiceIds.length !== 1 ? "s" : ""}{" "}
                                selected
                            </p>
                        )}

                        <div>
                            <label
                                htmlFor="date"
                                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                            >
                                Appointment date
                            </label>

                            <input
                                id="date"
                                type="date"
                                value={date}
                                min={getLocalDate()}
                                onChange={(event) => {
                                    setDate(event.target.value);
                                    setSlots([]);
                                    setHasSearched(false);
                                    setError("");
                                }}
                                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                                required
                            />
                        </div>

                        {error && (
                            <p role="alert" className="text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={
                                searching ||
                                loadingServices ||
                                !staffId ||
                                activeAssignedServices.length === 0
                            }
                            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {searching
                                ? "Searching..."
                                : "Find available slots"}
                        </button>
                    </form>
                )}
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Available time slots
                </h2>

                {!hasSearched && !searching && (
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        Select a staff member, one or more of their assigned
                        services, and a date to see available times.
                    </p>
                )}

                {searching && (
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        Checking availability...
                    </p>
                )}

                {hasSearched && !searching && slots.length === 0 && (
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        No available slots were found for the selected
                        criteria.
                    </p>
                )}

                {hasSearched && slots.length > 0 && (
                    <>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            {slots.length} available slot
                            {slots.length !== 1 ? "s" : ""} found for {date}.
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {slots.map((slot, index) => (
                                <div
                                    key={`${slot.start}-${slot.end}-${index}`}
                                    className="rounded-lg border border-[var(--border)] p-4"
                                >
                                    <p className="font-medium text-[var(--text-primary)]">
                                        {slot.start} – {slot.end}
                                    </p>

                                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                        Available
                                    </p>

                                    <Link
                                        href={getBookingHref(slot)}
                                        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                    >
                                        Book this slot
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

