"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SubmitEvent } from "react";

import {
    createStaffHour,
    type CreateStaffHourData,
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

export default function CreateStaffHourPage() {
    const params = useParams();
    const router = useRouter();

    // Validate and parse businessId and staffId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);

    // State management for staff hours, saving state, and error handling
    const [dayOfWeek, setDayOfWeek] = useState("1");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [isOff, setIsOff] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle form submission to create a new staff hour
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            const data: CreateStaffHourData = {
                day_of_week: Number(dayOfWeek),
                start_time: isOff ? "00:00" : startTime,
                end_time: isOff ? "00:00" : endTime,
                is_off: isOff,
            };

            await createStaffHour(
                businessId,
                staffId,
                data
            );

            router.push(
                `/businesses/${businessId}/staff/${staffId}/hours`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create staff schedule."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">

            {/* HEADER SECTION*/}
            <PageHeader
                title="Add Staff Schedule"
                description="Add a working period or mark a day off."
                backHref={`/businesses/${businessId}/staff/${staffId}/hours`}
                backLabel="Back to Staff Hours"
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


                    <div className="flex items-start gap-3 rounded-md border border-[var(--border)] p-4">
                        {/* Is day off checkbox */}
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
                                Use this when the staff member
                                should be unavailable for the
                                selected day.
                            </p>
                        </div>
                    </div>

                    {/* Start-End Time selection (if day off is not checked)*/}
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

                    {/* Error notification for any invalid process*/}
                    {error && (
                        <p className="text-sm text-[var(--danger)]">
                            {error}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={saving}
                            onClick={() =>
                                router.push(
                                    `/businesses/${businessId}/staff/${staffId}/hours`
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
                                : "Create Schedule"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
