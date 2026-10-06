"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
    getBusiness,
    type Business,
} from "@/lib/api/businesses";


// This page is for when you select a specific business from the list
export default function BusinessDetailPage() {
    const params = useParams();
    const id = Number(params.id);

    // State to hold the business data, loading state, and error message
    const [business, setBusiness] =
        useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch the business data when the component mounts or when the ID changes
    useEffect(() => {
        async function loadBusiness() {
            try {
                setLoading(true);
                setError("");

                const data = await getBusiness(id);

                setBusiness(data);
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

        if (Number.isInteger(id) && id > 0) {
            loadBusiness();
        } else {
            setError("Invalid business ID.");
            setLoading(false);
        }
    }, [id]);

    // always best to have a loading state, error state, and a not found state for the business
    if (loading) {
        return (
            <main className="p-6">
                <p>Loading business...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-6">
                <Link
                    href="/businesses"
                    className="text-sm underline"
                >
                    ← Back to businesses
                </Link>

                <p className="mt-6 text-red-500">
                    {error}
                </p>
            </main>
        );
    }

    if (!business) {
        return (
            <main className="p-6">
                <p>Business not found.</p>
            </main>
        );
    }

    return (
        <main className="p-6">
            <div className="mb-6">
                <Link
                    href="/businesses"
                    className="text-sm underline"
                >
                    ← Back to businesses
                </Link>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        {business.name}
                    </h1>

                    <p className="mt-1 text-gray-500">
                        {business.slug}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-sm ${business.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {business.status}
                </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                <section className="rounded-lg border p-5">
                    <h2 className="text-lg font-semibold">
                        Business Information
                    </h2>

                    <dl className="mt-4 space-y-3">
                        <div>
                            <dt className="text-sm text-gray-500">
                                Description
                            </dt>
                            <dd>
                                {business.description ||
                                    "No description"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm text-gray-500">
                                Currency
                            </dt>
                            <dd>{business.currency}</dd>
                        </div>

                        <div>
                            <dt className="text-sm text-gray-500">
                                Timezone
                            </dt>
                            <dd>{business.timezone}</dd>
                        </div>
                    </dl>
                </section>

                <section className="rounded-lg border p-5">
                    <h2 className="text-lg font-semibold">
                        Contact Information
                    </h2>

                    <dl className="mt-4 space-y-3">
                        <div>
                            <dt className="text-sm text-gray-500">
                                Phone
                            </dt>
                            <dd>
                                {business.phone ||
                                    "No phone number"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm text-gray-500">
                                Email
                            </dt>
                            <dd>
                                {business.email ||
                                    "No email address"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm text-gray-500">
                                Address
                            </dt>
                            <dd>
                                {business.address ||
                                    "No address"}
                            </dd>
                        </div>
                    </dl>
                </section>
            </div>

            <section className="mt-6 rounded-lg border p-5">
                <h2 className="text-lg font-semibold">
                    Record Information
                </h2>

                <dl className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                        <dt className="text-sm text-gray-500">
                            Created
                        </dt>
                        <dd>
                            {new Date(
                                business.created_at
                            ).toLocaleString()}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">
                            Last Updated
                        </dt>
                        <dd>
                            {new Date(
                                business.updated_at
                            ).toLocaleString()}
                        </dd>
                    </div>
                </dl>
            </section>
        </main>
    );
}
