"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getServices,
    type Service,
} from "@/lib/api/services";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function ServicesPage() {
    const params = useParams();

    // 
    const businessId = Number(params.id);

    //
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 
    useEffect(() => {
        async function loadServices() {
            try {
                setLoading(true);
                setError(null);

                const data = await getServices(businessId);

                setServices(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load services."
                );
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, [businessId]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Services"
                description="Manage the services offered by this business."
                backHref={`/businesses/${businessId}`}
                backLabel="Back to business"
                action={
                    <Link
                        href={`/businesses/${businessId}/services/create`}
                    >
                        <Button>
                            Add Service
                        </Button>
                    </Link>
                }
            />

            {loading && (
                <Card>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Loading services...
                    </p>
                </Card>
            )}

            {error && !loading && (
                <Card>
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </Card>
            )}

            {!loading &&
                !error &&
                services.length === 0 && (
                    <Card>
                        <div className="py-8 text-center">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                No services yet
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Add the first service for this
                                business.
                            </p>

                            <div className="mt-4">
                                <Link
                                    href={`/businesses/${businessId}/services/create`}
                                >
                                    <Button>
                                        Add First Service
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                )}

            {!loading &&
                !error &&
                services.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {services.map((service) => (
                            <Link
                                key={service.id}
                                href={`/businesses/${businessId}/services/${service.id}`}
                                className="block"
                            >
                                <Card className="h-full transition hover:border-[var(--primary)] hover:shadow-sm">
                                    <div className="flex h-full flex-col">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <h2 className="truncate text-lg font-semibold text-[var(--text-primary)]">
                                                    {service.name}
                                                </h2>

                                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                    {service.description ||
                                                        "No description provided."}
                                                </p>
                                            </div>

                                            <Badge
                                                variant={
                                                    service.status ===
                                                        "active"
                                                        ? "success"
                                                        : "default"
                                                }
                                            >
                                                {service.status}
                                            </Badge>
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                                    Price
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                                                    {service.currency}{" "}
                                                    {Number(
                                                        service.price
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                                    Duration
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                                                    {
                                                        service.duration_minutes
                                                    }{" "}
                                                    min
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                                    Buffer
                                                </p>

                                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                    {
                                                        service.buffer_minutes
                                                    }{" "}
                                                    min
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                                    Service ID
                                                </p>

                                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                    {service.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
        </div>
    );
}
