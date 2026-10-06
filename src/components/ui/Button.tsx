interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
}

export default function Button({
    variant = "primary",
    className = "",
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary:
            "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
        secondary:
            "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
        danger:
            "bg-[var(--danger)] text-white hover:opacity-90",
    };

    return (
        <button
            {...props}
            className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
