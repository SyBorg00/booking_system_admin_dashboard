interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export default function Card({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 ${className}`}
        >
            {children}
        </div>
    );
}
