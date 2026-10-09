"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
    createStaffTimeOff,
    type CreateStaffTimeOffData,
} from "@/lib/api/staffTimeOffs";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";

export default function CreateStaffTimeOffPage() {
    const params = useParams();
    const router = useRouter();

    // Validate and parse businessId and staffId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);

    // Define the base path for navigation
    const basePath =
        `/businesses/${businessId}/staff/${staffId}/time-offs`;

    // State for form fields and submission status
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [reason, setReason] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Handle form submission
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");

        if (
            !Number.isInteger(businessId) ||
            businessId <= 0 ||
            !Number.isInteger(staffId) ||
            staffId <= 0
        ) {
            setError("Invalid business or staff ID.");
            return;
        }

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

        const data: CreateStaffTimeOffData = {
            start_datetime: start.toISOString(),
            end_datetime: end.toISOString(),
            reason: reason.trim() || null,
        };

        try {
            setSaving(true);

            await createStaffTimeOff(
                businessId,
                staffId,
                data
            );

            router.push(basePath);
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create staff time off."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            {/* PAGE HEADER */}
            <PageHeader
                title="Add Staff Time Off"
                description="Record when this staff member will be unavailable."
            />

            {/* BACK BUTTON */}
            <div className="mt-6">
                <Link href={basePath}>
                    <Button variant="secondary">
                        Back to Time Off
                    </Button>
                </Link>
            </div>

            {/* MAIN BODY */}
            <div className="mt-6">
                <Card>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Error message text block */}
                        {error && (
                            <div
                                role="alert"
                                className="rounded-lg border border-[var(--danger)] p-3 text-sm text-[var(--danger)]"
                            >
                                {error}
                            </div>
                        )}

                        {/* Start DateTime Inputs */}
                        <div>
                            <Input
                                name="start_datetime"
                                type="datetime-local"
                                label="Start Date and Time"
                                value={startDateTime}
                                onChange={(event) =>
                                    setStartDateTime(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        {/* End DateTime Inputs */}
                        <div>
                            <Input
                                name="end_datetime"
                                type="datetime-local"
                                label="End Date and Time"
                                value={endDateTime}
                                onChange={(event) =>
                                    setEndDateTime(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        {/* Reason TextArea Input */}
                        <div>
                            <TextArea
                                name="reason"
                                label="Reason"
                                value={reason}
                                onChange={(event) =>
                                    setReason(event.target.value)
                                }
                                placeholder="e.g. Vacation, personal leave, appointment"
                                rows={4}
                            />
                        </div>

                        {/* Form action buttons */}
                        <div className="flex justify-end gap-3">
                            <Link href={basePath}>
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
                                    : "Create Time Off"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}


