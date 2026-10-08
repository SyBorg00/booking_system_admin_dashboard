"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getCustomers,
    type Customer,
} from "@/lib/api/customers";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CustomersPage() {
    const params = useParams();

    // Get the business ID from the URL parameters
    const businessId = Number(params.id);

    // State to hold the list of customers, loading state, and error message
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // fetch the list of customers when the component mounts or when the business ID changes
    useEffect(() => {
        async function loadCustomers() {
            try {
                setLoading(true);
                setError(null);

                const data =
                    await getCustomers(businessId);

                setCustomers(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load customers."
                );
            } finally {
                setLoading(false);
            }
        }

        loadCustomers();
    }, [businessId]);

    return (
        <div className="space-y-6">
            {/* HEADER SECTION */}
            <PageHeader
                title="Customers"
                description="Manage customers for this business."
                backHref={`/businesses/${businessId}`}
                backLabel="Back to Business"
                action={
                    <Link
                        href={`/businesses/${businessId}/customers/create`}
                    >
                        <Button>Add Customer</Button>
                    </Link>
                }
            />

            {/* Loading state page */}
            {loading && (
                <Card>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Loading customers...
                    </p>
                </Card>
            )}

            {/* Error state page */}
            {error && (
                <Card>
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </Card>
            )}

            {/* No customer state page */}
            {!loading &&
                !error &&
                customers.length === 0 && (
                    <Card>
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                No customers yet
                            </h2>

                            <p className="text-sm text-[var(--text-secondary)]">
                                Add your first customer to
                                this business.
                            </p>

                            <Link
                                href={`/businesses/${businessId}/customers/create`}
                            >
                                <Button>
                                    Add Customer
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}

            {!loading &&
                !error &&
                customers.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {customers.map((customer) => (
                            <Link
                                key={customer.id}
                                href={`/businesses/${businessId}/customers/${customer.id}`}
                                className="block"
                            >
                                <Card className="h-full transition hover:border-[var(--primary)]">
                                    <div className="space-y-3">
                                        <div>
                                            <h2 className="font-semibold text-[var(--text-primary)]">
                                                {
                                                    customer.first_name
                                                }{" "}
                                                {
                                                    customer.last_name
                                                }
                                            </h2>

                                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                                Customer #
                                                {customer.id}
                                            </p>
                                        </div>

                                        <div className="space-y-1 text-sm">
                                            {customer.email && (
                                                <p className="text-[var(--text-secondary)]">
                                                    {
                                                        customer.email
                                                    }
                                                </p>
                                            )}

                                            {customer.phone && (
                                                <p className="text-[var(--text-secondary)]">
                                                    {
                                                        customer.phone
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {customer.notes && (
                                            <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
                                                {
                                                    customer.notes
                                                }
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
        </div>
    );
}
