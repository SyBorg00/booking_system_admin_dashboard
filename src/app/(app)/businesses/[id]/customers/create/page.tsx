
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SubmitEvent } from "react";

import {
    createCustomer,
    type CreateCustomerData,
} from "@/lib/api/customers";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";

export default function CreateCustomerPage() {
    const params = useParams();
    const router = useRouter();

    // Get the business ID from the URL parameters
    const businessId = Number(params.id);

    // State to hold form fields, loading state, and error message
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle form submission to create a new customer
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const data: CreateCustomerData = {
                first_name: firstName,
                last_name: lastName,
                email: email || null,
                phone: phone || null,
                notes: notes || null,
            };

            const customer = await createCustomer(
                businessId,
                data
            );

            router.push(
                `/businesses/${businessId}/customers/${customer.id}`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create customer."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* HEADER SECTION */}
            <PageHeader
                title="Add Customer"
                description="Create a new customer for this business."
                backHref={`/businesses/${businessId}/customers`}
                backLabel="Back to Customers"
            />

            <Card>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Customer Name */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                            id="first_name"
                            label="First Name"
                            value={firstName}
                            onChange={(event) =>
                                setFirstName(
                                    event.target.value
                                )
                            }
                            required
                        />

                        <Input
                            id="last_name"
                            label="Last Name"
                            value={lastName}
                            onChange={(event) =>
                                setLastName(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

                    {/* Customer Email */}
                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="customer@example.com"
                    />

                    {/* Customer Phone */}
                    <Input
                        id="phone"
                        label="Phone"
                        value={phone}
                        onChange={(event) =>
                            setPhone(event.target.value)
                        }
                        placeholder="09171234567"
                    />

                    {/* Notes */}
                    <TextArea
                        id="notes"
                        label="Notes"
                        value={notes}
                        onChange={(event) =>
                            setNotes(event.target.value)
                        }
                        rows={4}
                        placeholder="Optional notes about this customer..."
                    />

                    {error && (
                        <p className="text-sm text-[var(--danger)]">
                            {error}
                        </p>
                    )}

                    {/* BUTTONS SECTION */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.push(
                                    `/businesses/${businessId}/customers`
                                )
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
                                : "Create Customer"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
