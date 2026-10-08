"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    createService,
    type CreateServiceData,
} from "@/lib/api/services";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function CreateServicePage() {
    const params = useParams();
    const router = useRouter();

    // Business ID is extracted from the URL parameters and converted to a number
    const businessId = Number(params.id);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [durationMinutes, setDurationMinutes] =
        useState("");
    const [bufferMinutes, setBufferMinutes] = useState("0");
    const [status, setStatus] = useState<
        "active" | "inactive"
    >("active");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            const data: CreateServiceData = {
                name,
                description: description || null,
                price: Number(price),
                duration_minutes: Number(durationMinutes),
                buffer_minutes: Number(bufferMinutes),
                status,
            };

            const service = await createService(
                businessId,
                data
            );

            router.push(
                `/businesses/${businessId}/services/${service.id}`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create service."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add Service"
                description="Create a new service for this business."
                backHref={`/businesses/${businessId}/services`}
                backLabel="Back to services"
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
                        {/* Service Name */}
                        <div className="sm:col-span-2">
                            <Input
                                id="name"
                                label="Service Name"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Facial Treatment"
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
                            id="price"
                            label="Price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(event) =>
                                setPrice(
                                    event.target.value
                                )
                            }
                            placeholder="0.00"
                            required
                        />

                        {/* Service Duration */}
                        <Input
                            id="duration_minutes"
                            label="Duration"
                            type="number"
                            min="1"
                            value={durationMinutes}
                            onChange={(event) =>
                                setDurationMinutes(
                                    event.target.value
                                )
                            }
                            placeholder="30"
                            hint="Duration in minutes."
                            required
                        />

                        {/* Service Buffer */}
                        <Input
                            id="buffer_minutes"
                            label="Buffer Time"
                            type="number"
                            min="0"
                            value={bufferMinutes}
                            onChange={(event) =>
                                setBufferMinutes(
                                    event.target.value
                                )
                            }
                            hint="Additional time blocked after the service."
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

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.push(
                                    `/businesses/${businessId}/services`
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
                                ? "Creating..."
                                : "Create Service"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
