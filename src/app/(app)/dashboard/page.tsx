"use client";

import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div>
            <div>
                <h1 className="text-3xl text-[var(--text-primary)] font-bold">
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
        <Card>
            <div>
                <p className="text-sm text-[var(--text-primary)]">
                    {title}
                </p>

                <p className="mt-2 text-2xl text-[var(--text-primary)] font-bold ">
                    {value}
                </p>
            </div>
        </Card>
    );
}
