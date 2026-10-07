import Link from "next/link";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;

    //This is for the back button, if you want to add a back button to the page header
    backHref?: string;
    backLabel?: string;
}

export default function PageHeader({
    title,
    description,
    action,
    backHref,
    backLabel = "Back",

}: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            {backHref && (
                <Link
                    href={backHref}
                    className="inline-flex items-center text-sm font-medium text-[var(--primary)] transition hover:opacity-80"
                >
                    ← {backLabel}
                </Link>
            )}
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
