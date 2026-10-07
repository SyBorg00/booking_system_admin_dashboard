"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getStaff, type Staff } from "@/lib/api/staff";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function BusinessStaffPage() {
    const params = useParams();

    const businessId = Number(params.id);

    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadStaff() {
            try {
                const data = await getStaff(businessId);

                setStaff(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load staff."
                );
            } finally {
                setLoading(false);
            }
        }

        loadStaff();
    }, [businessId]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff"
                description="Manage staff members for this business."
                backHref={`/businesses/${businessId}`}
                backLabel="Back to business"
                action={
                    <Link
                        href={`/businesses/${businessId}/staff/create`}
                    >
                        <Button>
                            Add Staff
                        </Button>
                    </Link>
                }
            />

            {loading && (
                <p className="text-sm text-[var(--text-secondary)]">
                    Loading staff...
                </p>
            )}

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && staff.length === 0 && (
                <Card>
                    <div className="space-y-3">
                        <p className="text-sm text-[var(--text-secondary)]">
                            No staff members found for this
                            business.
                        </p>

                        <Link
                            href={`/businesses/${businessId}/staff/create`}
                        >
                            <Button>
                                Add First Staff Member
                            </Button>
                        </Link>
                    </div>
                </Card>
            )}

            {!loading && !error && staff.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {staff.map((member) => (
                        <Link
                            key={member.id}
                            href={`/businesses/${businessId}/staff/${member.id}`}
                            className="block transition hover:-translate-y-0.5"
                        >
                            <Card className="h-full transition hover:shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg text-[var(--text-primary)] font-semibold">
                                            {member.user.first_name}{" "}
                                            {member.user.last_name}
                                        </h2>

                                        {member.position && (
                                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                {member.position}
                                            </p>
                                        )}
                                    </div>

                                    <Badge>
                                        Staff
                                    </Badge>
                                </div>

                                <div className="mt-4 space-y-1 text-sm text-[var(--text-primary)]">
                                    {member.phone && (
                                        <p>
                                            <span className="text-[var(--text-secondary)]">
                                                Phone:
                                            </span>{" "}
                                            {member.phone}
                                        </p>
                                    )}

                                    <p>
                                        <span className="text-[var(--text-secondary)]">
                                            Staff ID:
                                        </span>{" "}
                                        {member.id}
                                    </p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
