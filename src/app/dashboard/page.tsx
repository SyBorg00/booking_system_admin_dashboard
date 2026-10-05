"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

export default function DashboardPage() {
    const router = useRouter();

    const {
        user,
        authenticated,
        logout,
    } = useAuth();

    useEffect(() => {
        if (!authenticated) {
            router.replace("/login");
        }
    }, [authenticated, router]);

    if (!authenticated || !user) {
        return null;
    }

    return (
        <main className="p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Dashboard
                    </h1>

                    <p className="mt-2">
                        Welcome, {user.first_name}!
                    </p>

                    <p className="mt-1">
                        Role: {user.role}
                    </p>
                </div>

                <button
                    onClick={() => {
                        logout();
                        router.replace("/login");
                    }}
                    className="rounded bg-black px-4 py-2 text-white"
                >
                    Logout
                </button>
            </div>
        </main>
    );
}
