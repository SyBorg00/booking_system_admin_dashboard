"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DeleteButton from "@/components/ui/DeleteButton";
import { deleteStaff } from "@/lib/api/staff";

import { getStaffMember, type Staff } from "@/lib/api/staff";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function StaffDetailPage() {

    // Get the business ID and staff ID from the URL parameters
    const params = useParams();
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);


    // State to hold the staff member data, loading state, and error message
    const [staff, setStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);
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

    // Always best to have a loading state, error state, and a not found state for the staff member
    if (loading) {
        return (
            <div className="text-sm text-[var(--text-secondary)]">
                Loading staff member...
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Staff Member"
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

    if (!staff) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Staff Member"
                    backHref={`/businesses/${businessId}/staff`}
                    backLabel="Back to staff"
                />

                <Card>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Staff member not found.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${staff.user.first_name} ${staff.user.last_name}`}
                description="View staff member information."
                backHref={`/businesses/${businessId}/staff`}
                backLabel="Back to staff"
                action={
                    <Link
                        href={`/businesses/${businessId}/staff/${staff.id}/edit`}
                    >
                        <Button>
                            Edit Staff
                        </Button>
                    </Link>
                }
            />

            {/* Display information about the staff*/}
            <Card>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Staff Information
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Basic information about this staff member.
                        </p>
                    </div>


                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                First Name
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-primary)]">
                                {staff.user.first_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                Last Name
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-primary)]">
                                {staff.user.last_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                Phone
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-primary)]">
                                {staff.phone ?? "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                Position
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-primary)]">
                                {staff.position ?? "Not specified"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                User ID
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-primary)]">
                                {staff.user_id}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                Staff ID
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-primary)]">
                                {staff.id}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Display the staff status */}
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Staff Status
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            This staff record is currently active.
                        </p>
                    </div>

                    <Badge variant="success">
                        Active
                    </Badge>
                </div>
            </Card>

            {/* Display the staff hours */}
            <div className="mt-6">
                <Card>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                Staff Hours
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Manage working periods and days off
                                for this staff member.
                            </p>
                        </div>

                        <Link
                            href={`/businesses/${businessId}/staff/${staff.id}/hours`}
                        >
                            <Button variant="secondary">
                                Manage Hours
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>


            {/* Display the staff time-offs */}
            <div className="mt-6">
                <Card>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                Staff Time Off
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Manage vacations, leave, and other periods when this
                                staff member is unavailable.
                            </p>
                        </div>

                        <Link
                            href={`/businesses/${businessId}/staff/${staff.id}/time-offs`}
                        >
                            <Button variant="secondary">
                                Manage Time Off
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Display the staff service button */}
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Assigned Services
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Choose which services this staff member can provide.
                        </p>
                    </div>

                    <Link
                        href={`/businesses/${businessId}/staff/${staff.id}/services`}
                    >
                        <Button variant="secondary">
                            Manage Services
                        </Button>
                    </Link>
                </div>
            </Card>

            {/* Display the delete staff button */}
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Staff Management
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Remove this staff member from the business.
                        </p>
                    </div>

                    <DeleteButton
                        onDelete={() =>
                            deleteStaff(
                                businessId,
                                staff.id
                            )
                        }
                        redirectTo={`/businesses/${businessId}/staff`}
                        confirmationMessage={`Are you sure you want to remove ${staff.user.first_name} ${staff.user.last_name} from this business?`}
                        label="Delete Staff"
                        deletingLabel="Deleting..."
                    />

                </div>
            </Card>


        </div>
    );
}
