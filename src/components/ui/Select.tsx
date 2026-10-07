import type { SelectHTMLAttributes } from "react";

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps
    extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: SelectOption[];
    error?: string;
    hint?: string;
}

export default function Select({
    label,
    options,
    error,
    hint,
    id,
    className = "",
    ...props
}: SelectProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
            >
                {label}
            </label>

            <select
                id={id}
                className={`w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

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