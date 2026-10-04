"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

export default function TestApiPage() {
    const [message, setMessage] = useState("Testing API...");
    const [error, setError] = useState("");

    useEffect(() => {
        async function testApi() {
            try {
                const response = await apiFetch("/businesses");

                console.log(response);

                setMessage("Successfully connected to Laravel API.");
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong."
                );
            }
        }

        testApi();
    }, []);

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold">
                API Connection Test
            </h1>

            {error ? (
                <p className="mt-4 text-red-500">
                    {error}
                </p>
            ) : (
                <p className="mt-4">
                    {message}
                </p>
            )}
        </main>
    );
}