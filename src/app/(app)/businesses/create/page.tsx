"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";

import { createBusiness } from "@/lib/api/businesses";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

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
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1 block text-sm font-medium"
                            >
                                Business Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                                placeholder="Jules Beauty Salon"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="slug"
                                className="mb-1 block text-sm font-medium"
                            >
                                Slug
                            </label>

                            <input
                                id="slug"
                                type="text"
                                value={slug}
                                onChange={(event) =>
                                    setSlug(event.target.value)
                                }
                                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                                placeholder="jules-beauty-salon"
                            />

                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                Leave blank to generate automatically.
                            </p>
                        </div>
                    </div>

                    <div className="text-[var(--text-label)]">
                        <label
                            htmlFor="description"
                            className="mb-1 block text-sm font-medium"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            rows={4}
                            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                            placeholder="Describe the business..."
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 text-[var(--text-label)]">
                        <div>
                            <label
                                htmlFor="currency"
                                className="mb-1 block text-sm font-medium"
                            >
                                Currency
                            </label>

                            <input
                                id="currency"
                                type="text"
                                value={currency}
                                onChange={(event) =>
                                    setCurrency(
                                        event.target.value.toUpperCase()
                                    )
                                }
                                maxLength={3}
                                required
                                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] uppercase outline-none focus:border-[var(--primary)]"
                                placeholder="PHP"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="timezone"
                                className="mb-1 block text-sm font-medium"
                            >
                                Timezone
                            </label>

                            <input
                                id="timezone"
                                type="text"
                                value={timezone}
                                onChange={(event) =>
                                    setTimezone(event.target.value)
                                }
                                required
                                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                                placeholder="Asia/Manila"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 text-[var(--text-label)]">
                        <div>
                            <label
                                htmlFor="phone"
                                className="mb-1 block text-sm font-medium"
                            >
                                Phone
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(event.target.value)
                                }
                                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                                placeholder="09171234567"
                            />
                        </div>

                        <div className="text-[var(--text-label)]">
                            <label
                                htmlFor="email"
                                className="mb-1 block text-sm font-medium"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                                placeholder="hello@example.com"
                            />
                        </div>
                    </div>

                    <div className="text-[var(--text-label)]">
                        <label
                            htmlFor="address"
                            className="mb-1 block text-sm font-medium"
                        >
                            Address
                        </label>

                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(event) =>
                                setAddress(event.target.value)
                            }
                            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                            placeholder="Davao City"
                        />
                    </div>

                    <div className="text-[var(--text-label)]">
                        <label
                            htmlFor="status"
                            className="mb-1 block text-sm font-medium"
                        >
                            Status
                        </label>

                        <select
                            id="status"
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value as
                                    | "active"
                                    | "inactive"
                                )
                            }
                            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                        >
                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>
                    </div>

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
