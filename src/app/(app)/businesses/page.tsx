"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
    getBusinesses,
    type Business,
} from "@/lib/api/businesses";

export default function BusinessesPage() {

    // State to hold the businesses data, loading state, and error message
    const [businesses, setBusinesses] =
        useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch the businesses data when the component mounts
    useEffect(() => {
        async function loadBusinesses() {
            try {
                const data = await getBusinesses();

                setBusinesses(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load businesses."
                );
            } finally {
                setLoading(false);
            }
        }

        loadBusinesses();
    }, []);

    if (loading) {
        return (
            <main className="p-6">
                <p>Loading businesses...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-6">
                <p className="text-red-500">{error}</p>
            </main>
        );
    }

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Businesses
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Manage your businesses.
                    </p>
                </div>
            </div>

            {businesses.length === 0 ? (
                <p className="mt-6 text-gray-500">
                    No businesses found.
                </p>
            ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((business) => (
                        <Link
                            key={business.id}
                            href={`/businesses/${business.id}`}
                            className="block rounded-lg border p-5 transition hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="text-lg font-semibold">
                                    {business.name}
                                </h2>

                                <span className="text-sm">
                                    {business.status}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                                {business.description ||
                                    "No description"}
                            </p>

                            <div className="mt-4 space-y-1 text-sm">
                                <p>
                                    Currency:{" "}
                                    {business.currency}
                                </p>

                                <p>
                                    Timezone:{" "}
                                    {business.timezone}
                                </p>
                            </div>

                            <p className="mt-4 text-sm font-medium">
                                View details →
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
