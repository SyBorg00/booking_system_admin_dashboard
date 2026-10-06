interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger";
}

export default function Badge({
    children,
    variant = "default",
}: BadgeProps) {
    const variants = {
        default:
            "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
        success:
            "bg-green-100 text-green-700",
        warning:
            "bg-amber-100 text-amber-700",
        danger:
            "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]}`}
        >
            {children}
        </span>
    );
}
