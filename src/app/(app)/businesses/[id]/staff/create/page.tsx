"use client";

import { type SubmitEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    createStaff,
    type CreateStaffData,
} from "@/lib/api/staff";

import {
    getUsers,
    type User,
} from "@/lib/api/users";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function CreateStaffPage() {
    const params = useParams();
    const router = useRouter();

    const businessId = Number(params.id);

    const [users, setUsers] = useState<User[]>([]);

    const [userId, setUserId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [position, setPosition] = useState("");

    const [loadingUsers, setLoadingUsers] =
        useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await getUsers();

                setUsers(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load users."
                );
            } finally {
                setLoadingUsers(false);
            }
        }

        loadUsers();
    }, []);

    function handleUserChange(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        const selectedUserId = event.target.value;

        setUserId(selectedUserId);

        const selectedUser = users.find(
            (user) => user.id === Number(selectedUserId)
        );

        if (selectedUser) {
            setFirstName(selectedUser.first_name);
            setLastName(selectedUser.last_name);
        }
    }

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSaving(true);

        const data: CreateStaffData = {
            user_id: Number(userId),
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            position,
        };

        try {
            const staff = await createStaff(
                businessId,
                data
            );

            router.push(
                `/businesses/${businessId}/staff/${staff.id}`
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create staff member."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add Staff"
                description="Add a staff member to this business."
                backHref={`/businesses/${businessId}/staff`}
                backLabel="Back to staff"
            />

            <Card>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <Select
                        id="user"
                        label="User Account"
                        value={userId}
                        onChange={handleUserChange}
                        disabled={loadingUsers || saving}
                        required
                        options={[
                            {
                                label: loadingUsers
                                    ? "Loading users..."
                                    : "Select a user",
                                value: "",
                            },
                            ...users.map((user) => ({
                                label: `${user.first_name} ${user.last_name} — ${user.email}`,
                                value: String(user.id),
                            })),
                        ]}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        <Input
                            id="first_name"
                            label="First Name"
                            value={firstName}
                            onChange={(event) =>
                                setFirstName(
                                    event.target.value
                                )
                            }
                            required
                            disabled={saving}
                        />

                        <Input
                            id="last_name"
                            label="Last Name"
                            value={lastName}
                            onChange={(event) =>
                                setLastName(
                                    event.target.value
                                )
                            }
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Input
                            id="phone"
                            label="Phone"
                            type="tel"
                            value={phone}
                            onChange={(event) =>
                                setPhone(
                                    event.target.value
                                )
                            }
                            disabled={saving}
                        />

                        <Input
                            id="position"
                            label="Position"
                            value={position}
                            onChange={(event) =>
                                setPosition(
                                    event.target.value
                                )
                            }
                            required
                            disabled={saving}
                            placeholder="e.g. Hair Stylist"
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.push(
                                    `/businesses/${businessId}/staff`
                                )
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                saving ||
                                loadingUsers ||
                                !userId
                            }
                        >
                            {saving
                                ? "Creating..."
                                : "Add Staff"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
