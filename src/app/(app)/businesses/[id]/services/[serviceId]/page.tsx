"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getService,
    deleteService,
    type Service,
} from "@/lib/api/services";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";

export default function ServiceDetailPage() {
    const params = useParams();

    const businessId = Number(params.id);
    const serviceId = Number(params.serviceId);

    const [service, setService] = useState<Service | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadService() {
            try {
                setLoading(true);
                setError(null);

                const data = await getService(
                    businessId,
                    serviceId
                );

                setService(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load service."
                );
            } finally {
                setLoading(false);
            }
        }

        loadService();
    }, [businessId, serviceId]);

    if (loading) {
        return (
            <div className="text-sm text-[var(--text-secondary)]">
                Loading service...
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Service"
                    backHref={`/businesses/${businessId}/services`}
                    backLabel="Back to Services"
                />

                <Card>
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </Card>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Service"
                    backHref={`/businesses/${businessId}/services`}
                    backLabel="Back to Services"
                />

                <Card>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Service not found.
                    </p>
                </Card>
            </div>
        );
    }

    const statusVariant =
        service.status === "active"
            ? "success"
            : "default";

    return (
        <div className="space-y-6">
            {/* SERVICE DETAIL PAGE HEADER */}
            <PageHeader
                title={service.name}
                description={
                    service.description ??
                    "Service details"
                }
                backHref={`/businesses/${businessId}/services`}
                backLabel="Back to Services"
                action={
                    <Link
                        href={`/businesses/${businessId}/services/${service.id}/edit`}
                    >
                        <Button>Edit Service</Button>
                    </Link>
                }
            />

            {/*MAIN SERVICE DETAIL INFO */}
            <Card>
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Service Name */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Name
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {service.name}
                        </p>
                    </div>

                    {/* Service Status */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Status
                        </p>

                        <div className="mt-1">
                            <Badge variant={statusVariant}>
                                {service.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Service Price */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Price
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {service.currency}{" "}
                            {Number(service.price).toFixed(2)}
                        </p>
                    </div>

                    {/* Service Duration */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Duration
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {service.duration_minutes}{" "}
                            minutes
                        </p>
                    </div>

                    {/* Service Buffer */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Buffer Time
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {service.buffer_minutes}{" "}
                            minutes
                        </p>
                    </div>

                    {/* Service ID */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Service ID
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {service.id}
                        </p>
                    </div>

                    {/* Service Description */}
                    <div className="sm:col-span-2">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Description
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-primary)]">
                            {service.description ||
                                "No description provided."}
                        </p>
                    </div>
                </div>
            </Card>

            {/* DELETE SERVICE SECTION */}
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Delete Service
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Permanently remove this service
                            from the business.
                        </p>
                    </div>

                    <DeleteButton
                        onDelete={() =>
                            deleteService(
                                businessId,
                                service.id
                            )
                        }
                        redirectTo={`/businesses/${businessId}/services`}
                        confirmationMessage={`Are you sure you want to delete "${service.name}"?`}
                        label="Delete Service"
                        deletingLabel="Deleting..."
                    />
                </div>
            </Card>
        </div>
    );
}
