"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getStaffHours,
    type StaffHour,
} from "@/lib/api/staffHours";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

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

export default function StaffHoursPage() {
    const params = useParams();

    // Validate and parse businessId and staffId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);

    // State management for staff hours, loading state, and error handling
    const [hours, setHours] = useState<StaffHour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch staff hours when the component mounts or when businessId/staffId changes
    useEffect(() => {
        async function loadHours() {
            try {
                setLoading(true);
                setError(null);

                const data = await getStaffHours(
                    businessId,
                    staffId
                );

                setHours(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load staff hours."
                );
            } finally {
                setLoading(false);
            }
        }

        loadHours();
    }, [businessId, staffId]);

    // Organize hours by day of the week for display
    const hoursByDay = DAYS.map((day, dayIndex) => ({
        day,
        dayIndex,
        schedules: hours
            .filter((hour) => hour.day_of_week === dayIndex)
            .sort((a, b) =>
                a.start_time.localeCompare(b.start_time)
            ),
    }));

    return (
        <div className="space-y-6">

            {/* HEADER SECTION */}
            <PageHeader
                title="Staff Hours"
                description="Manage this staff member's weekly working schedule."
                backHref={`/businesses/${businessId}/staff/${staffId}`}
                backLabel="Back to Staff"
                action={
                    <Link
                        href={`/businesses/${businessId}/staff/${staffId}/hours/create`}
                    >
                        <Button>Add Schedule</Button>
                    </Link>
                }
            />

            {/* MAIN BODY SECTION */}
            {loading && (
                <Card>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Loading staff hours...
                    </p>
                </Card>
            )}

            {error && (
                <Card>
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </Card>
            )}

            {!loading && !error && (
                <div className="space-y-4">
                    {hoursByDay.map(
                        ({ day, dayIndex, schedules }) => (

                            // The main body of the page is a list of cards, one for each day of the week, showing the schedules for that day. 
                            // If there are no schedules, it shows a message indicating that.
                            <Card key={dayIndex}>
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="font-semibold text-[var(--text-primary)]">
                                        {day}
                                    </h2>

                                    <span className="text-xs text-[var(--text-secondary)]">
                                        {schedules.length}{" "}
                                        {schedules.length === 1
                                            ? "schedule"
                                            : "schedules"}
                                    </span>
                                </div>

                                {schedules.length === 0 ? (
                                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                                        No schedule configured.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {schedules.map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="flex flex-col justify-between gap-3 rounded-md border border-[var(--border)] p-3 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {schedule.is_off ? (
                                                        <Badge variant="warning">
                                                            Day off
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="success">
                                                            Working
                                                        </Badge>
                                                    )}

                                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                                        {schedule.is_off
                                                            ? "Unavailable"
                                                            : `${formatTime(schedule.start_time)} – ${formatTime(schedule.end_time)}`}
                                                    </p>
                                                </div>

                                                <Link
                                                    href={`/businesses/${businessId}/staff/${staffId}/hours/${schedule.id}`}
                                                    className="text-sm font-medium text-[var(--primary)] hover:underline"
                                                >
                                                    View details
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
