"use client";

import { useEffect, useState } from "react";

import {
    getBusinesses,
    type Business,
} from "@/lib/api/businesses";

export default function BusinessesPage() {
    const [businesses, setBusinesses] =
        useState<Business[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div>
            <div>
                <h1 className="text-3xl font-bold">
                    Businesses
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage businesses available to your
                    account.
                </p>
            </div>

            {loading && (
                <p className="mt-8 text-gray-500">
                    Loading businesses...
                </p>
            )}

            {error && (
                <div className="mt-8 rounded border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                businesses.length === 0 && (
                    <p className="mt-8 text-gray-500">
                        No businesses found.
                    </p>
                )}

            {!loading &&
                !error &&
                businesses.length > 0 && (
                    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {businesses.map((business) => (
                            <div
                                key={business.id}
                                className="rounded-lg border bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-semibold">
                                            {business.name}
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {business.slug}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${business.status ===
                                                "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {business.status}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-1 text-sm text-gray-600">
                                    <p>
                                        Currency:{" "}
                                        {business.currency}
                                    </p>

                                    <p>
                                        Timezone:{" "}
                                        {business.timezone}
                                    </p>

                                    {business.email && (
                                        <p>
                                            Email:{" "}
                                            {
                                                business.email
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
