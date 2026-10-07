"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SubmitEvent } from "react";

import { getStaffMember, updateStaff, type Staff } from "@/lib/api/staff";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditStaffPage() {
    const params = useParams();
    const router = useRouter();

    // Get the business ID and staff ID from the URL parameters
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);

    // State to hold the staff member data, form fields, loading state, saving state, and error message
    const [staff, setStaff] = useState<Staff | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [position, setPosition] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Fetch the staff member data when the component mounts or when the business ID or staff ID changes
    useEffect(() => {
        async function loadStaff() {
            try {
                setLoading(true);
                setError(null);

                const data = await getStaffMember(
                    businessId,
                    staffId
                );

                setStaff(data);

                setFirstName(data.user.first_name);
                setLastName(data.user.last_name);
                setPhone(data.phone ?? "");
                setPosition(data.position ?? "");
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load staff member."
                );
            } finally {
                setLoading(false);
            }
        }

        loadStaff();
    }, [businessId, staffId]);

    // Handle form submission to update the staff member's information
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            await updateStaff(
                businessId,
                staffId,
                {
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone || null,
                    position: position || null,
                }
            );

            router.push(
                `/businesses/${businessId}/staff/${staffId}`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update staff member."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="text-sm text-[var(--text-secondary)]">
                Loading staff member...
            </div>
        );
    }

    if (error && !staff) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Edit Staff"
                    backHref={`/businesses/${businessId}/staff`}
                    backLabel="Back to staff"
                />

                <Card>
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Staff"
                description="Update this staff member's information."
                backHref={`/businesses/${businessId}/staff/${staffId}`}
                backLabel="Back to staff"
            />
            <Card>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm text-[var(--danger)]">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Input
                            id="first_name"
                            label="First Name"
                            value={firstName}
                            onChange={(event) =>
                                setFirstName(event.target.value)
                            }
                            required
                        />

                        <Input
                            id="last_name"
                            label="Last Name"
                            value={lastName}
                            onChange={(event) =>
                                setLastName(event.target.value)
                            }
                            required
                        />

                        <Input
                            id="phone"
                            label="Phone"
                            type="tel"
                            value={phone}
                            onChange={(event) =>
                                setPhone(event.target.value)
                            }
                        />

                        <Input
                            id="position"
                            label="Position"
                            value={position}
                            onChange={(event) =>
                                setPosition(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.push(
                                    `/businesses/${businessId}/staff/${staffId}`
                                )
                            }
                            disabled={saving}
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
