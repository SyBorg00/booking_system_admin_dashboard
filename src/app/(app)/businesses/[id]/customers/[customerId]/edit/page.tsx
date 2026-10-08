
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SubmitEvent } from "react";

import {
    getCustomer,
    updateCustomer,
    type UpdateCustomerData,
} from "@/lib/api/customers";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";

export default function EditCustomerPage() {
    const params = useParams();
    const router = useRouter();

    // Get the business ID and customer ID from the URL parameters
    const businessId = Number(params.id);
    const customerId = Number(params.customerId);

    // State to hold form fields, loading state, saving state, and error message
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(
        null
    );

    // Fetch the customer data when the component mounts or when the business ID or customer ID changes
    useEffect(() => {
        async function loadCustomer() {
            try {
                setLoading(true);
                setError(null);

                const customer = await getCustomer(
                    businessId,
                    customerId
                );

                setFirstName(customer.first_name);
                setLastName(customer.last_name);
                setEmail(customer.email ?? "");
                setPhone(customer.phone ?? "");
                setNotes(customer.notes ?? "");
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load customer."
                );
            } finally {
                setLoading(false);
            }
        }

        loadCustomer();
    }, [businessId, customerId]);

    // Handle form submission to update the customer data
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);

            const data: UpdateCustomerData = {
                first_name: firstName,
                last_name: lastName,
                email: email || null,
                phone: phone || null,
                notes: notes || null,
            };

            await updateCustomer(
                businessId,
                customerId,
                data
            );

            router.push(
                `/businesses/${businessId}/customers/${customerId}`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update customer."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="text-sm text-[var(--text-secondary)]">
                Loading customer...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Customer"
                description="Update this customer's information."
                backHref={`/businesses/${businessId}/customers/${customerId}`}
                backLabel="Back to Customer"
            />

            <Card>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* First Name and Last Name fields in a grid layout */}
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

                    {/* Email field */}
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

                    {/* Phone field */}
                    <Input
                        id="phone"
                        label="Phone"
                        value={phone}
                        onChange={(event) =>
                            setPhone(event.target.value)
                        }
                        placeholder="09171234567"
                    />

                    {/* Notes field */}
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

                    {/* Display error for invalid inputs */}
                    {error && (
                        <p className="text-sm text-[var(--danger)]">
                            {error}
                        </p>
                    )}

                    {/* Action buttons for canceling or saving changes */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.push(
                                    `/businesses/${businessId}/customers/${customerId}`
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
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
