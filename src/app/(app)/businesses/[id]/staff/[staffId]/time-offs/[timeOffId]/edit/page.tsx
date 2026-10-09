"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
    getStaffTimeOff,
    updateStaffTimeOff,
    type UpdateStaffTimeOffData,
} from "@/lib/api/staffTimeOffs";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";

function toLocalDateTimeInput(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (number: number) =>
        String(number).padStart(2, "0");

    return [
        date.getFullYear(),
        "-",
        pad(date.getMonth() + 1),
        "-",
        pad(date.getDate()),
        "T",
        pad(date.getHours()),
        ":",
        pad(date.getMinutes()),
    ].join("");
}

export default function EditStaffTimeOffPage() {
    const params = useParams();
    const router = useRouter();

    // Validate and parse businessId, staffId, and timeOffId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);
    const timeOffId = Number(params.timeOffId);

    // Define the base path for navigation
    const basePath =
        `/businesses/${businessId}/staff/${staffId}/time-offs`;

    // State for form fields and submission status
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Fetch the time-off record when the component mounts or when IDs change
    useEffect(() => {
        async function loadTimeOff() {
            try {
                setLoading(true);
                setError("");

                const timeOff = await getStaffTimeOff(
                    businessId,
                    staffId,
                    timeOffId
                );

                setStartDateTime(
                    toLocalDateTimeInput(timeOff.start_datetime)
                );

                setEndDateTime(
                    toLocalDateTimeInput(timeOff.end_datetime)
                );

                setReason(timeOff.reason ?? "");
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

    // Handle form submission
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");

        if (!startDateTime || !endDateTime) {
            setError("Please provide both the start and end dates.");
            return;
        }

        const start = new Date(startDateTime);
        const end = new Date(endDateTime);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            setError("Please provide valid dates and times.");
            return;
        }

        if (end.getTime() <= start.getTime()) {
            setError(
                "The end date and time must be after the start."
            );
            return;
        }

        const data: UpdateStaffTimeOffData = {
            start_datetime: start.toISOString(),
            end_datetime: end.toISOString(),
            reason: reason.trim() || null,
        };

        try {
            setSaving(true);

            await updateStaffTimeOff(
                businessId,
                staffId,
                timeOffId,
                data
            );

            router.push(`${basePath}/${timeOffId}`);
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update staff time off."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            {/* HEADER */}
            <PageHeader
                title="Edit Staff Time Off"
                description="Update this staff member's unavailable period."
            />

            <div className="mt-6">
                <Link href={`${basePath}/${timeOffId}`}>
                    <Button variant="secondary">
                        Back to Details
                    </Button>
                </Link>
            </div>

            {/* MAIN BODY */}
            <div className="mt-6">
                <Card>
                    {loading ? (
                        <p className="text-sm text-[var(--text-secondary)]">
                            Loading time-off record...
                        </p>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-[var(--danger)] p-3 text-sm text-[var(--danger)]"
                                >
                                    {error}
                                </div>
                            )}

                            {/* Start DateTime */}
                            <Input
                                name="start_datetime"
                                label="Start Date and Time"
                                type="datetime-local"
                                value={startDateTime}
                                onChange={(event) =>
                                    setStartDateTime(
                                        event.target.value
                                    )
                                }
                                required
                            />

                            {/* End DateTime */}
                            <Input
                                name="end_datetime"
                                label="End Date and Time"
                                type="datetime-local"
                                value={endDateTime}
                                onChange={(event) =>
                                    setEndDateTime(
                                        event.target.value
                                    )
                                }
                                required
                            />

                            {/* Reason */}
                            <TextArea
                                name="reason"
                                label="Reason (Optional)"
                                value={reason}
                                onChange={(event) =>
                                    setReason(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Vacation, personal leave, appointment"
                                rows={4}
                            />

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3">
                                <Link href={`${basePath}/${timeOffId}`}>
                                    <Button variant="secondary">
                                        Cancel
                                    </Button>
                                </Link>

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
                    )}
                </Card>
            </div>
        </div>
    );
}


