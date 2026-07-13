import { Link } from "@/navigation";

export default function LocalAdminPlaceholder({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mt-8 rounded-lg border border-primary-200 p-8">
      <h3 className="text-xl font-bold text-primary-900">{title}</h3>
      <p className="mt-3 max-w-[680px] text-primary-500">
        This section requires the production database services. In local demo
        mode, submitted tools are managed from the review queue.
      </p>
      <Link
        className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground"
        href="/dashboard/review-manage"
      >
        Open Review Queue
      </Link>
    </div>
  );
}
