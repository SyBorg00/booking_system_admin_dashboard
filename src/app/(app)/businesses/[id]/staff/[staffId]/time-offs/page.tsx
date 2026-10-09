"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getStaffTimeOffs,
    type StaffTimeOff,
} from "@/lib/api/staffTimeOffs";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

function formatDateTime(value: string): string {
    return new Date(value).toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function StaffTimeOffsPage() {
    const params = useParams();

    // Validate and parse businessId and staffId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);

    // State for time-offs, loading, and error
    const [timeOffs, setTimeOffs] = useState<StaffTimeOff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch time-offs when businessId or staffId changes
    useEffect(() => {
        async function loadTimeOffs() {
            try {
                setLoading(true);
                setError("");

                const data = await getStaffTimeOffs(
                    businessId,
                    staffId
                );

                setTimeOffs(
                    [...data].sort(
                        (a, b) =>
                            new Date(a.start_datetime).getTime() -
                            new Date(b.start_datetime).getTime()
                    )
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load staff time off."
                );
            } finally {
                setLoading(false);
            }
        }

        if (
            Number.isInteger(businessId) &&
            businessId > 0 &&
            Number.isInteger(staffId) &&
            staffId > 0
        ) {
            loadTimeOffs();
        } else {
            setError("Invalid business or staff ID.");
            setLoading(false);
        }
    }, [businessId, staffId]);

    const basePath =
        `/businesses/${businessId}/staff/${staffId}/time-offs`;

    return (
        <div>
            {/* HEADER */}
            <PageHeader
                title="Staff Time Off"
                description="Manage this staff member's unavailable periods."
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Link
                    href={`/businesses/${businessId}/staff/${staffId}`}
                >
                    <Button variant="secondary">
                        Back to Staff
                    </Button>
                </Link>

                <Link href={`${basePath}/create`}>
                    <Button>
                        Add Time Off
                    </Button>
                </Link>
            </div>

            {/* ERROR PAGE LOAD */}
            {error && (
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-[var(--danger)] p-4 text-sm text-[var(--danger)]"
                >
                    {error}
                </div>
            )}

            <div className="mt-6">
                <Card>
                    {loading ? (
                        <p className="text-sm text-[var(--text-secondary)]">
                            Loading time-off records...
                        </p>
                    ) : error ? (
                        <p className="text-sm text-[var(--text-secondary)]">
                            Time-off records could not be displayed.
                        </p>
                    ) : timeOffs.length === 0 ? (
                        <div className="py-8 text-center">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                No time off recorded
                            </h2>

                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                Add a record when this staff member will
                                be unavailable.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {timeOffs.map((timeOff) => (
                                <Link
                                    key={timeOff.id}
                                    href={`${basePath}/${timeOff.id}`}
                                    className="block rounded-lg border border-[var(--border)] p-4 transition hover:bg-[var(--surface)]"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-semibold text-[var(--text-primary)]">
                                                {formatDateTime(
                                                    timeOff.start_datetime
                                                )}
                                            </h2>

                                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                Until{" "}
                                                {formatDateTime(
                                                    timeOff.end_datetime
                                                )}
                                            </p>
                                        </div>

                                        <Badge>
                                            Time Off
                                        </Badge>
                                    </div>

                                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                                        {timeOff.reason?.trim() ||
                                            "No reason provided"}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}


