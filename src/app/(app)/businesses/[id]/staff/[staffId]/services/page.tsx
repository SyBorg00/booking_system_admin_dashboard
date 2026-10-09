"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    assignStaffService,
    getStaffServices,
    removeStaffService,
    type StaffService,
} from "@/lib/api/staffServices";

import { getServices, type Service } from "@/lib/api/services";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

export default function StaffServicesPage() {
    const params = useParams();

    // Validate and parse businessId and staffId from params
    const businessId = Number(params.id);
    const staffId = Number(params.staffId);

    // Validate that businessId and staffId are valid numbers
    const basePath =
        `/businesses/${businessId}/staff/${staffId}/services`;

    // State variables
    const [assignedServices, setAssignedServices] =
        useState<StaffService[]>([]);

    const [availableServices, setAvailableServices] =
        useState<Service[]>([]);

    const [selectedServiceId, setSelectedServiceId] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removingServiceId, setRemovingServiceId] =
        useState<number | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load assigned and available services
    const loadServices = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [assigned, services] = await Promise.all([
                getStaffServices(businessId, staffId),
                getServices(businessId),
            ]);

            setAssignedServices(assigned);
            setAvailableServices(services);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load staff services."
            );
        } finally {
            setLoading(false);
        }
    }, [businessId, staffId]);

    // Use effect to load services on component mount or when businessId/staffId changes
    useEffect(() => {
        if (
            Number.isInteger(businessId) &&
            businessId > 0 &&
            Number.isInteger(staffId) &&
            staffId > 0
        ) {
            loadServices();
        } else {
            setError("Invalid business or staff ID.");
            setLoading(false);
        }
    }, [businessId, staffId, loadServices]);

    // Filter available services to only include those that are not assigned and are active
    const assignedIds = new Set(
        assignedServices.map((service) => service.id)
    );

    const unassignedServices = availableServices.filter(
        (service) =>
            !assignedIds.has(service.id) &&
            service.status === "active"
    );

    // Handle assigning a service to the staff member
    async function handleAssign() {
        if (!selectedServiceId) {
            setError("Please select a service.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await assignStaffService(
                businessId,
                staffId,
                Number(selectedServiceId)
            );

            setSelectedServiceId("");
            setSuccess("Service assigned successfully.");

            await loadServices();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to assign service."
            );
        } finally {
            setSaving(false);
        }
    }

    // Handle removing a service from the staff member
    async function handleRemove(serviceId: number) {
        const confirmed = window.confirm(
            "Remove this service from the staff member?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingServiceId(serviceId);
            setError("");
            setSuccess("");

            await removeStaffService(
                businessId,
                staffId,
                serviceId
            );

            setAssignedServices((current) =>
                current.filter(
                    (service) => service.id !== serviceId
                )
            );

            setSuccess("Service assignment removed.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to remove service assignment."
            );
        } finally {
            setRemovingServiceId(null);
        }
    }

    return (
        <div>
            {/* HEADER */}
            <PageHeader
                title="Staff Services"
                description="Manage the services this staff member can provide."
            />

            <div className="mt-6">
                <Link
                    href={`/businesses/${businessId}/staff/${staffId}`}
                >
                    <Button variant="secondary">
                        Back to Staff
                    </Button>
                </Link>
            </div>

            {/* ERROR */}
            {error && (
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-[var(--danger)] p-4 text-sm text-[var(--danger)]"
                >
                    {error}
                </div>
            )}

            {/* SUCCESSFUL PROCESS */}
            {success && (
                <div
                    role="status"
                    className="mt-6 rounded-lg border border-[var(--border)] p-4 text-sm text-[var(--text-primary)]"
                >
                    {success}
                </div>
            )}

            {/* SERVICE SELECTION SECTION */}
            <div className="mt-6">
                <Card>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Assign a Service
                    </h2>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Select an active service offered by this business.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            {/* Service Selector */}
                            <Select
                                name="service_id"
                                label="Service"
                                value={selectedServiceId}
                                onChange={(event) => setSelectedServiceId(event.target.value)}
                                required
                                options={[
                                    {
                                        value: "",
                                        label: "Select a service",
                                    },
                                    ...unassignedServices.map(
                                        (service) => ({
                                            value: String(service.id),
                                            label: service.name,
                                        })
                                    ),
                                ]}
                            />
                        </div>

                        {/* Assign Button */}
                        <Button
                            type="button"
                            onClick={handleAssign}
                            disabled={
                                loading ||
                                saving ||
                                !selectedServiceId
                            }
                        >
                            {saving
                                ? "Assigning..."
                                : "Assign Service"}
                        </Button>
                    </div>

                    {!loading &&
                        unassignedServices.length === 0 && (
                            <p className="mt-3 text-sm text-[var(--text-secondary)]">
                                No unassigned active services are available.
                            </p>
                        )}
                </Card>
            </div>

            {/* ASSIGNED SERVICES SECTION */}
            <div className="mt-6">
                <Card>
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Assigned Services
                        </h2>

                        <Badge>
                            {assignedServices.length} assigned
                        </Badge>
                    </div>

                    {loading ? (
                        <p className="mt-4 text-sm text-[var(--text-secondary)]">
                            Loading services...
                        </p>
                    ) : assignedServices.length === 0 ? (
                        <p className="mt-4 text-sm text-[var(--text-secondary)]">
                            No services have been assigned to this staff member.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {assignedServices.map((service) => (
                                <div
                                    key={service.id}
                                    className="flex flex-col gap-3 rounded-lg border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <h3 className="font-medium text-[var(--text-primary)]">
                                            {service.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            {service.currency}{" "}
                                            {Number(service.price).toFixed(2)}
                                            {" · "}
                                            {service.duration_minutes} minutes
                                        </p>

                                        {service.buffer_minutes > 0 && (
                                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                Buffer: {service.buffer_minutes} minutes
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={
                                            removingServiceId === service.id
                                        }
                                        onClick={() =>
                                            handleRemove(service.id)
                                        }
                                    >
                                        {removingServiceId === service.id
                                            ? "Removing..."
                                            : "Remove"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}


