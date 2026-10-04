"use client";

import { useEffect, useState } from "react";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser =
            localStorage.getItem("auth_user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold">
                Dashboard
            </h1>

            {user && (
                <div className="mt-4">
                    <p>
                        Welcome, {user.first_name}!
                    </p>

                    <p>
                        Role: {user.role}
                    </p>
                </div>
            )}
        </main>
    );
}
