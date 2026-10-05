"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div>
            <div>
                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                    Welcome back, {user?.first_name}.
                </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Businesses"
                    value="—"
                />

                <DashboardCard
                    title="Staff"
                    value="—"
                />

                <DashboardCard
                    title="Customers"
                    value="—"
                />

                <DashboardCard
                    title="Appointments"
                    value="—"
                />
            </div>
        </div>
    );
}

interface DashboardCardProps {
    title: string;
    value: string;
}

function DashboardCard({
    title,
    value,
}: DashboardCardProps) {
    return (
        <div className="rounded-lg border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
                {title}
            </p>

            <p className="mt-2 text-2xl font-bold">
                {value}
            </p>
        </div>
    );
}
