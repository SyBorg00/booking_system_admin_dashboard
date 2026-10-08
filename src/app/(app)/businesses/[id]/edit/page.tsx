"use client";

import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";

import {
    getBusiness,
    updateBusiness,
} from "@/lib/api/businesses";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";

export default function EditBusinessPage() {
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [currency, setCurrency] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [timezone, setTimezone] = useState("");
    const [status, setStatus] =
        useState<"active" | "inactive">("active");

    // Fetch the business data when the component mounts or when the ID changes
    useEffect(() => {
        async function loadBusiness() {
            try {
                const business = await getBusiness(id);

                setName(business.name);
                setSlug(business.slug);
                setDescription(business.description ?? "");
                setCurrency(business.currency);
                setPhone(business.phone ?? "");
                setEmail(business.email ?? "");
                setAddress(business.address ?? "");
                setTimezone(business.timezone);
                setStatus(business.status);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load business."
                );
            } finally {
                setLoading(false);
            }
        }

        loadBusiness();
    }, [id]);

    // Handle form submission to update the business
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSaving(true);

        try {
            await updateBusiness(id, {
                name,
                slug,
                description: description || null,
                currency,
                phone: phone || null,
                email: email || null,
                address: address || null,
                timezone,
                status,
            });

            router.push(`/businesses/${id}`);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update business."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="text-sm text-[var(--text-secondary)]">
                Loading business...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Business"
                description="Update the business information."
                backHref="/businesses"
                backLabel="Back to businesses"
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

                        <Input
                            id="slug"
                            type="text"
                            label="Slug"
                            value={slug}
                            onChange={(event) => setSlug(event.target.value)}
                            required
                            placeholder="demo-booking-business"
                        />
                    </div>

                    {/* Business Description */}
                    <TextArea
                        id="description"
                        label="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={4}
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
                        />

                        <Input
                            id="email"
                            type="email"
                            label="Phone"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />

                    </div>

                    {/* Address */}
                    <Input
                        id="address"
                        type="text"
                        label="Address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
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
                                router.push(`/businesses/${id}`)
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
