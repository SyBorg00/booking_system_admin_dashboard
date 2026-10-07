"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";

interface DeleteButtonProps {
    onDelete: () => Promise<void>;
    redirectTo: string;

    confirmationMessage?: string;
    label?: string;
    deletingLabel?: string;
}

export default function DeleteButton({
    onDelete,
    redirectTo,
    confirmationMessage = "Are you sure you want to delete this item?",
    label = "Delete",
    deletingLabel = "Deleting...",
}: DeleteButtonProps) {
    const router = useRouter();

    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        const confirmed = window.confirm(
            confirmationMessage
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);
            setError(null);

            await onDelete();

            router.push(redirectTo);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete item."
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
            >
                {deleting
                    ? deletingLabel
                    : label}
            </Button>

            {error && (
                <p className="text-sm text-[var(--danger)]">
                    {error}
                </p>
            )}
        </div>
    );
}
