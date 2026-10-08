"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getCustomer,
    deleteCustomer,
    type Customer,
} from "@/lib/api/customers";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";

export default function CustomerDetailPage() {
    const params = useParams();

    // Get the business ID and customer ID from the URL parameters
    const businessId = Number(params.id);
    const customerId = Number(params.customerId);

    // State to hold the customer data, loading state, and error message
    const [customer, setCustomer] =
        useState<Customer | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadCustomer() {
            try {
                setLoading(true);
                setError(null);

                const data = await getCustomer(
                    businessId,
                    customerId
                );

                setCustomer(data);
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

    if (loading) {
        return (
            <div className="text-sm text-[var(--text-secondary)]">
                Loading customer...
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Customer"
                    backHref={`/businesses/${businessId}/customers`}
                    backLabel="Back to Customers"
                />

                <Card>
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </Card>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="space-y-4">
                <PageHeader
                    title="Customer"
                    backHref={`/businesses/${businessId}/customers`}
                    backLabel="Back to Customers"
                />

                <Card>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Customer not found.
                    </p>
                </Card>
            </div>
        );
    }

    // Render the customer details page
    const fullName =
        `${customer.first_name} ${customer.last_name}`.trim();

    return (
        <div className="space-y-6">
            {/* HEADER SECTION */}
            <PageHeader
                title={fullName}
                description="Customer details"
                backHref={`/businesses/${businessId}/customers`}
                backLabel="Back to Customers"
                action={
                    <Link
                        href={`/businesses/${businessId}/customers/${customer.id}/edit`}
                    >
                        <Button>
                            Edit Customer
                        </Button>
                    </Link>
                }
            />

            {/* MAIN DETAIL SECTION */}
            <Card>
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* First Name */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            First Name
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {customer.first_name}
                        </p>
                    </div>

                    {/* Last Name */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Last Name
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {customer.last_name}
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Email
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {customer.email ||
                                "Not provided"}
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Phone
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {customer.phone ||
                                "Not provided"}
                        </p>
                    </div>

                    {/* Customer ID */}
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Customer ID
                        </p>

                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {customer.id}
                        </p>
                    </div>

                    <div className="sm:col-span-2">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Notes
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-primary)]">
                            {customer.notes ||
                                "No notes provided."}
                        </p>
                    </div>
                </div>
            </Card>

            {/* DELETE CUSTOMER SECTION */}
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Delete Customer
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Remove this customer from the
                            business.
                        </p>
                    </div>

                    <DeleteButton
                        onDelete={() =>
                            deleteCustomer(
                                businessId,
                                customer.id
                            )
                        }
                        redirectTo={`/businesses/${businessId}/customers`}
                        confirmationMessage={`Are you sure you want to delete "${fullName}"?`}
                        label="Delete Customer"
                        deletingLabel="Deleting..."
                    />
                </div>
            </Card>
        </div>
    );
}
