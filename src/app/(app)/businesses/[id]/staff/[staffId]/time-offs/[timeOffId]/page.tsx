"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStaffTimeOff, deleteStaffTimeOff, type StaffTimeOff } from "@/lib/api/staffTimeOffs";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";

// Format date and time in a human-readable format
function formatDateTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function StaffTimeOffDetailPage() {
    const params = useParams();

    // Validate and parse businessId, staffId, and timeOffId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);
    const timeOffId = Number(params.timeOffId);

    // Define the base path for navigation
    const basePath =
        `/businesses/${businessId}/staff/${staffId}/time-offs`;

    // State for time-off data, loading status, and error messages
    const [timeOff, setTimeOff] = useState<StaffTimeOff | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch the time-off record when the component mounts or when IDs change
    useEffect(() => {
        async function loadTimeOff() {
            try {
                setLoading(true);
                setError("");

                const data = await getStaffTimeOff(
                    businessId,
                    staffId,
                    timeOffId
                );

                setTimeOff(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load the time-off record."
                );
            } finally {
                setLoading(false);
            }
        }

        if (
            Number.isInteger(businessId) &&
            businessId > 0 &&
            Number.isInteger(staffId) &&
            staffId > 0 &&
            Number.isInteger(timeOffId) &&
            timeOffId > 0
        ) {
            loadTimeOff();
        } else {
            setError("Invalid business, staff, or time-off ID.");
            setLoading(false);
        }
    }, [businessId, staffId, timeOffId]);

    // Handle deletion of the time-off record
    async function handleDelete() {
        await deleteStaffTimeOff(
            businessId,
            staffId,
            timeOffId
        );
    }

    return (
        <div>
            {/* HEADER */}
            <PageHeader
                title="Staff Time Off Details"
                description="View and manage this staff member's unavailable period."
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Link href={basePath}>
                    <Button variant="secondary">
                        Back to Time Off
                    </Button>
                </Link>

                {timeOff && (
                    <div className="flex flex-wrap gap-2">
                        <Link href={`${basePath}/${timeOff.id}/edit`}>
                            <Button>
                                Edit Time Off
                            </Button>
                        </Link>

                        <DeleteButton
                            onDelete={handleDelete}
                            redirectTo={basePath}
                            confirmationMessage="Are you sure you want to delete this time-off record?"
                            label="Delete Time Off"
                            deletingLabel="Deleting..."
                        />
                    </div>
                )}
            </div>

            {/* ERROR PAGE */}
            {error && (
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-[var(--danger)] p-4 text-sm text-[var(--danger)]"
                >
                    {error}
                </div>
            )}

            {/* MAIN BODY */}
            <div className="mt-6">
                <Card>
                    {loading ? (
                        <p className="text-sm text-[var(--text-secondary)]">
                            Loading time-off details...
                        </p>
                    ) : !timeOff ? (
                        <p className="text-sm text-[var(--text-secondary)]">
                            The time-off record could not be found.
                        </p>
                    ) : (

                        <div className="space-y-6">

                            {/* Time-off Details */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                    Time Off #{timeOff.id}
                                </h2>

                                <Badge>Time Off</Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Start Date and Time
                                    </p>

                                    <p className="mt-1 font-medium text-[var(--text-primary)]">
                                        {formatDateTime(
                                            timeOff.start_datetime
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        End Date and Time
                                    </p>

                                    <p className="mt-1 font-medium text-[var(--text-primary)]">
                                        {formatDateTime(
                                            timeOff.end_datetime
                                        )}
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Reason
                                    </p>

                                    <p className="mt-1 whitespace-pre-wrap text-[var(--text-primary)]">
                                        {timeOff.reason?.trim() ||
                                            "No reason provided"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Created At
                                    </p>

                                    <p className="mt-1 text-sm text-[var(--text-primary)]">
                                        {formatDateTime(
                                            timeOff.created_at
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Last Updated
                                    </p>

                                    <p className="mt-1 text-sm text-[var(--text-primary)]">
                                        {formatDateTime(
                                            timeOff.updated_at
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}


