"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";

import { createBusiness } from "@/lib/api/businesses";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";

export default function CreateBusinessPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [currency, setCurrency] = useState("PHP");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [timezone, setTimezone] = useState("Asia/Manila");
    const [status, setStatus] =
        useState<"active" | "inactive">("active");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle form submission
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const business = await createBusiness({
                name,
                slug: slug || undefined,
                description: description || null,
                currency,
                phone: phone || null,
                email: email || null,
                address: address || null,
                timezone,
                status,
            });

            router.push(`/businesses/${business.id}`);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create business."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Business"
                description="Add a new business to your booking system."
                backHref="/businesses"
                backLabel="Back to Businesses"
            />

            <Card>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2 text-[var(--text-label)]">

                        {/* Business Name and slug */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Input
                                id="name"
                                type="text"
                                label="Business Name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                placeholder="Demo Booking Business"
                            />

                            <div>
                                <Input
                                    id="slug"
                                    type="text"
                                    label="Slug"
                                    value={slug}
                                    onChange={(event) => setSlug(event.target.value)}
                                    required
                                    placeholder="demo-booking-business"
                                />
                                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                    Leave blank to generate automatically.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Business Description */}
                    <TextArea
                        id="description"
                        label="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={4}
                        placeholder="Describe the business..."
                    />

                    {/*Currency and Timezone */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Input
                            id="currency"
                            type="text"
                            label="Currency Type"
                            value={currency}
                            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                            required
                            maxLength={3}
                            placeholder="PHP"
                        />

                        <Input
                            id="timezone"
                            type="text"
                            label="Timezone"
                            value={timezone}
                            onChange={(event) => setTimezone(event.target.value)}
                            required
                            placeholder="Asia/Manila"
                        />
                    </div>

                    {/* Contact Information */}
                    <div className="grid gap-6 md:grid-cols-2">

                        <Input
                            id="phone"
                            type="tel"
                            label="Phone"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder="09171234567"
                        />

                        <Input
                            id="email"
                            type="email"
                            label="Phone"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="hello@example.com"
                        />
                    </div>

                    {/* Address */}
                    <Input
                        id="address"
                        type="text"
                        label="Address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        placeholder="Davao City"
                    />

                    {/* Status */}
                    <Select
                        id="status"
                        label="Status"
                        value={status}
                        onChange={(event) =>
                            setStatus(
                                event.target.value as "active" | "inactive"
                            )
                        }
                        options={[
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                        ]}
                    />

                    <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.push("/businesses")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create Business"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
