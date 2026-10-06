interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function PageHeader({
    title,
    description,
    action,
}: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {description}
                    </p>
                )}
            </div>

            {action && (
                <div className="shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}
