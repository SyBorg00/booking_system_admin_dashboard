"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getStaffHour,
    deleteStaffHour,
    type StaffHour,
} from "@/lib/api/staffHours";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";

// Formatting constants
const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

// Format time from "HH:mm:ss" to a more readable format
function formatTime(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function StaffHourDetailPage() {
    const params = useParams();

    // Parse businessId, staffId and staffHourId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);
    const staffHourId = Number(params.staffHourId);

    // State management for staff hours, loading state, and error handling
    const [staffHour, setStaffHour] = useState<StaffHour | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch staff hours when the component mounts or when businessId/staffId/staffHourId changes
    useEffect(() => {
        async function loadStaffHour() {
            try {
                setLoading(true);
                setError(null);

                const data = await getStaffHour(
                    businessId,
                    staffId,
                    staffHourId
                );

                setStaffHour(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load staff schedule."
                );
            } finally {
                setLoading(false);
            }
        }

        loadStaffHour();
    }, [businessId, staffId, staffHourId]);

    // Loading page state
    if (loading) {
        return (
            <p className="text-sm text-[var(--text-secondary)]">
                Loading staff schedule...
            </p>
        );
    }

    // Error page state
    if (error || !staffHour) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Staff Schedule"
                    backHref={`/businesses/${businessId}/staff/${staffId}/hours`}
                    backLabel="Back to Staff Hours"
                />

                <Card>
                    <p className="text-sm text-[var(--danger)]">
                        {error ?? "Staff schedule not found."}
                    </p>
                </Card>
            </div>
        );
    }

    const dayName =
        DAYS[staffHour.day_of_week] ?? "Unknown day";

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <PageHeader
                title={`${dayName} Schedule`}
                description="View and manage this staff schedule."
                backHref={`/businesses/${businessId}/staff/${staffId}/hours`}
                backLabel="Back to Staff Hours"
                action={
                    <Link
                        href={`/businesses/${businessId}/staff/${staffId}/hours/${staffHour.id}/edit`}
                    >
                        <Button>Edit Schedule</Button>
                    </Link>
                }
            />

            {/* MAIN BODY */}
            <Card>
                <div className="grid gap-6 sm:grid-cols-2">

                    {/* Day of week */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Day of Week
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {dayName}
                        </p>
                    </div>

                    {/* Schedule status */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Schedule Status
                        </p>

                        <div className="mt-1">
                            <Badge
                                variant={
                                    staffHour.is_off
                                        ? "warning"
                                        : "success"
                                }
                            >
                                {staffHour.is_off
                                    ? "Day off"
                                    : "Working"}
                            </Badge>
                        </div>
                    </div>

                    {/* Start and End Time (only if not a day off) */}
                    {!staffHour.is_off && (
                        <>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Start Time
                                </p>

                                <p className="mt-1 font-medium text-[var(--text-primary)]">
                                    {formatTime(
                                        staffHour.start_time
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    End Time
                                </p>

                                <p className="mt-1 font-medium text-[var(--text-primary)]">
                                    {formatTime(
                                        staffHour.end_time
                                    )}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Schedule ID */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Schedule ID
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {staffHour.id}
                        </p>
                    </div>
                </div>
            </Card>

            {/* DELETE SECTION */}
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Delete Schedule
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Remove this schedule record.
                        </p>
                    </div>

                    <DeleteButton
                        onDelete={() =>
                            deleteStaffHour(
                                businessId,
                                staffId,
                                staffHour.id
                            )
                        }
                        redirectTo={`/businesses/${businessId}/staff/${staffId}/hours`}
                        confirmationMessage={`Delete the ${dayName} schedule?`}
                        label="Delete Schedule"
                        deletingLabel="Deleting..."
                    />
                </div>
            </Card>
        </div>
    );
}
