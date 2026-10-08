"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SubmitEvent } from "react";

import { getService, updateService, type Service } from "@/lib/api/services";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";

export default function EditServicePage() {
    const params = useParams();
    const router = useRouter();

    // Get the business ID and service ID from the URL parameters
    const businessId = Number(params.id);
    const serviceId = Number(params.serviceId);

    // State to hold the service data, form fields, loading state, saving state, and error message
    const [service, setService] = useState<Service | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("");
    const [bufferMinutes, setBufferMinutes] = useState("0");
    const [status, setStatus] = useState<"active" | "inactive">("active");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Fetch the service data when the component mounts or when the business ID or service ID changes
    useEffect(() => {
        async function loadService() {
            try {
                setLoading(true);
                setError(null);

                const data = await getService(businessId, serviceId);

                setService(data);

                setName(data.name);
                setDescription(data.description ?? "");
                setPrice(data.price.toString());
                setDurationMinutes(data.duration_minutes.toString());
                setBufferMinutes(data.buffer_minutes.toString());
                setStatus(data.status);
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

    // Handle form submission to update the service
    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            const data = {
                name,
                description: description || null,
                price: Number(price),
                duration_minutes: Number(durationMinutes),
                buffer_minutes: Number(bufferMinutes),
                status,
            };

            await updateService(businessId, serviceId, data);

            router.push(`/businesses/${businessId}/services/${serviceId}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update service."
            );
        } finally {
            setSaving(false);
        }
    }

    // Render loading state
    if (loading) {
        return (
            <div className="text-sm text-[var(--text-secondary)]">
                Loading service...
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Service"
                    backHref={`/businesses/${businessId}/services`}
                    backLabel="Back to Services"
                />

                <Card>
                    <p className="text-sm text-[var(--danger)]">{error}</p>
                </Card>
            </div>
        );
    }

    // Render the edit service form
    return (
        <div className="space-y-6">
            {/* HEADER SECTION */}
            <PageHeader
                title="Edit Service"
                description="Update the details of this service."
                backHref={`/businesses/${businessId}/services/${serviceId}`}
                backLabel="Back to Service"
            />

            {/* MAIN DETAILS SECTION */}
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm text-[var(--danger)]">{error}</p>
                        </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Service Name */}
                        <div className="sm:col-span-2">
                            <Input
                                label="Service Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Service Description */}
                        <div className="sm:col-span-2">
                            <TextArea
                                id="description"
                                label="Description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Describe the service..."
                                rows={4}
                            />
                        </div>

                        {/* Service Price */}
                        <Input
                            label="Price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />

                        {/* Service Duration */}
                        <Input
                            label="Duration (minutes)"
                            type="number"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                            required
                        />

                        {/* Service Buffer */}
                        <Input
                            label="Buffer Time (minutes)"
                            type="number"
                            value={bufferMinutes}
                            onChange={(e) => setBufferMinutes(e.target.value)}
                        />

                        {/* Service Status */}
                        <Select
                            id="status"
                            label="Status"
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value as
                                    | "active"
                                    | "inactive"
                                )
                            }
                            options={[
                                {
                                    label: "Active",
                                    value: "active",
                                },
                                {
                                    label: "Inactive",
                                    value: "inactive",
                                },
                            ]}
                        />
                    </div>

                    {/* BUTTON SECTION*/}
                    <div className="flex justify-end gap-3">

                        {/* Cancel button */}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.push(
                                    `/businesses/${businessId}/services/${serviceId}`
                                )
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        {/* Save Button */}
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

