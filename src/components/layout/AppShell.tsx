"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
    },
    {
        name: "Businesses",
        href: "/businesses",
    },
    {
        name: "Services",
        href: "/services",
    },
    {
        name: "Customers",
        href: "/customers",
    },
    {
        name: "Appointments",
        href: "/appointments",
    },
];

interface AppShellProps {
    children: React.ReactNode;
}

export default function AppShell({
    children,
}: AppShellProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Get authentication state from the useAuth hook
    const { user, authenticated, loading, logout } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (loading) {
            return;
        }

        if (!authenticated || !user) {
            router.replace("/login");
        }
    }, [loading, authenticated, user, pathname, router]);

    // Render nothing while loading or if not authenticated
    if (loading) {
        return null;
    }

    if (!authenticated || !user) {
        return null;
    }

    // Handle logout and redirect to login page
    function handleLogout() {
        logout();
        router.replace("/login");
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="hidden w-64 border-r bg-white md:block">
                <div className="flex h-full flex-col">
                    <div className="border-b px-6 py-5">
                        <h1 className="text-xl text-[var(--text-primary)] font-bold">
                            Booking System
                        </h1>
                    </div>

                    <nav className="flex-1 space-y-1 p-4">
                        {navigation.map((item) => {
                            const active =
                                pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block rounded px-4 py-2 text-sm ${active
                                        ? "bg-black text-white"
                                        : "text-[var(--text-primary)] hover:bg-gray-100"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t p-4">
                        <p className="text-sm font-medium">
                            {user.first_name}{" "}
                            {user.last_name}
                        </p>

                        <p className="text-xs text-[var(--text-primary)]">
                            {user.role}
                        </p>

                        <button
                            onClick={handleLogout}
                            className="mt-3 w-full rounded border px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-gray-100"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="border-b bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-[var(--text-primary)]" >
                            Booking System
                        </h2>

                        <div className="text-sm text-[var(--text-primary)]">
                            {user.first_name}{" "}
                            {user.last_name}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
