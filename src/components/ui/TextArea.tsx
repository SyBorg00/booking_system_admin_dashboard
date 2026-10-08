import type { TextareaHTMLAttributes } from "react";

interface TextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
}

export default function TextArea({
    label,
    error,
    hint,
    id,
    className = "",
    ...props
}: TextareaProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
            >
                {label}
            </label>

            <textarea
                id={id}
                className={`w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] ${className}`}
                {...props}
            />

            {hint && !error && (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {hint}
                </p>
            )}

            {error && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                    {error}
                </p>
            )}
        </div>
    );
}
