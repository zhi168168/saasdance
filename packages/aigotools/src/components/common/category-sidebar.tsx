import {
  BadgePercent,
  BarChart3,
  ClipboardList,
  Code2,
  Crown,
  Folder,
  Gamepad2,
  GraduationCap,
  Home,
  Layers,
  LucideIcon,
  Mail,
  Megaphone,
  MousePointer2,
  Palette,
  PenLine,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

import { getAllCategories } from "@/lib/actions";
import { Link } from "@/navigation";

const iconMap: Record<string, LucideIcon> = {
  "badge-percent": BadgePercent,
  "bar-chart": BarChart3,
  "chart": BarChart3,
  "clipboard-list": ClipboardList,
  code: Code2,
  crown: Crown,
  folder: Folder,
  gamepad: Gamepad2,
  "graduation-cap": GraduationCap,
  layers: Layers,
  mail: Mail,
  megaphone: Megaphone,
  "mouse-pointer": MousePointer2,
  palette: Palette,
  "pen-line": PenLine,
  "shopping-cart": ShoppingCart,
  sparkles: Sparkles,
  "trending-up": TrendingUp,
  trophy: Trophy,
  users: Users,
  workflow: Workflow,
  zap: Zap,
};

export default async function CategorySidebar() {
  const groups = await getAllCategories();
  const categories = groups.flatMap((group) => group.children || []);

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-primary-200 bg-background/95 px-4 py-5">
      <Link
        className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-primary-800 hover:bg-primary-100"
        href="/"
      >
        <span className="grid h-7 w-7 place-items-center rounded-md border border-primary-200">
          <Home size={16} />
        </span>
        All
      </Link>

      <nav className="mt-3 flex-1 space-y-1 overflow-y-auto pr-1">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Folder;

          return (
            <Link
              key={category._id}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-primary-700 hover:bg-primary-100 hover:text-primary-900"
              href={`/search?c=${encodeURIComponent(category.name)}`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-md border border-primary-200 text-primary-500">
                <Icon size={15} />
              </span>
              <span className="truncate">{category.name}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-md border border-primary-200 px-3 text-sm font-bold text-primary-900 hover:bg-primary-100"
        href="/submit"
      >
        <Sparkles size={16} />
        Submit for free
      </Link>
    </aside>
  );
}
