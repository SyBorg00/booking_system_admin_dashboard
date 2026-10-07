import type { InputHTMLAttributes } from "react";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export default function Input({
    label,
    error,
    hint,
    id,
    className = "",
    ...props
}: InputProps) {
    return (
        <div>
            {/* Input label */}
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
            >
                {label}
            </label>

            {/* Input field */}
            <input
                id={id}
                className={`w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] ${className}`}
                {...props}
            />

            {/* Hint config */}
            {hint && !error && (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {hint}
                </p>
            )}

            {/* Error config */}
            {error && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                    {error}
                </p>
            )}
        </div>
    );
}
