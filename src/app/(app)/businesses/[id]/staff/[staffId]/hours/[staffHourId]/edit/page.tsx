"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SubmitEvent } from "react";

import {
    getStaffHour,
    updateStaffHour,
    type UpdateStaffHourData,
} from "@/lib/api/staffHours";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

// Options for days of the week
const DAY_OPTIONS = [
    { label: "Sunday", value: "0" },
    { label: "Monday", value: "1" },
    { label: "Tuesday", value: "2" },
    { label: "Wednesday", value: "3" },
    { label: "Thursday", value: "4" },
    { label: "Friday", value: "5" },
    { label: "Saturday", value: "6" },
];

export default function EditStaffHourPage() {
    const params = useParams();
    const router = useRouter();

    // Validate and parse businessId, staffId, and staffHourId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);
    const staffHourId = Number(params.staffHourId);

    // State management for staff hours, loading state, saving state, and error handling
    const [dayOfWeek, setDayOfWeek] = useState("1");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [isOff, setIsOff] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch staff hour details when the component mounts or when businessId/staffId/staffHourId changes
    useEffect(() => {
        async function loadStaffHour() {
            try {
                setLoading(true);
                setError(null);

                const schedule = await getStaffHour(
                    businessId,
                    staffId,
                    staffHourId
                );

                setDayOfWeek(
                    String(schedule.day_of_week)
                );
                setStartTime(
                    schedule.start_time.slice(0, 5)
                );
                setEndTime(
                    schedule.end_time.slice(0, 5)
                );
                setIsOff(schedule.is_off);
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

    // Handle form submission to update the staff hour
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            const data: UpdateStaffHourData = {
                day_of_week: Number(dayOfWeek),
                start_time: isOff ? "00:00" : startTime,
                end_time: isOff ? "00:00" : endTime,
                is_off: isOff,
            };

            await updateStaffHour(
                businessId,
                staffId,
                staffHourId,
                data
            );

            router.push(
                `/businesses/${businessId}/staff/${staffId}/hours/${staffHourId}`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update staff schedule."
            );
        } finally {
            setSaving(false);
        }
    }

    // Loading page state
    if (loading) {
        return (
            <p className="text-sm text-[var(--text-secondary)]">
                Loading staff schedule...
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {/* HEADER SECTION */}
            <PageHeader
                title="Edit Staff Schedule"
                description="Update this working period or day-off record."
                backHref={`/businesses/${businessId}/staff/${staffId}/hours/${staffHourId}`}
                backLabel="Back to Schedule"
            />

            {/* MAIN BODY SECTION */}
            <Card>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Day of week */}
                    <Select
                        id="day_of_week"
                        label="Day of Week"
                        value={dayOfWeek}
                        onChange={(event) =>
                            setDayOfWeek(event.target.value)
                        }
                        options={DAY_OPTIONS}
                        required
                    />

                    {/* Mark as day off checkbox */}
                    <div className="flex items-start gap-3 rounded-md border border-[var(--border)] p-4">
                        <input
                            id="is_off"
                            type="checkbox"
                            checked={isOff}
                            onChange={(event) =>
                                setIsOff(event.target.checked)
                            }
                            className="mt-1"
                        />

                        <div>
                            <label
                                htmlFor="is_off"
                                className="text-sm font-medium text-[var(--text-primary)]"
                            >
                                Mark as day off
                            </label>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Mark this schedule record as
                                a day off.
                            </p>
                        </div>
                    </div>

                    {/* Show start and end time inputs only if it's not marked as a day off */}
                    {!isOff && (
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input
                                id="start_time"
                                type="time"
                                label="Start Time"
                                value={startTime}
                                onChange={(event) =>
                                    setStartTime(
                                        event.target.value
                                    )
                                }
                                required
                            />

                            <Input
                                id="end_time"
                                type="time"
                                label="End Time"
                                value={endTime}
                                onChange={(event) =>
                                    setEndTime(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>
                    )}

                    {/* Display error message if any error occurs during form submission */}
                    {error && (
                        <p className="text-sm text-[var(--danger)]">
                            {error}
                        </p>
                    )}

                    {/* Form action buttons: Cancel and Save Changes */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={saving}
                            onClick={() =>
                                router.push(
                                    `/businesses/${businessId}/staff/${staffId}/hours/${staffHourId}`
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
