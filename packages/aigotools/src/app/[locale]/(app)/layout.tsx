import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import CategorySidebar from "@/components/common/category-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="lg:pl-64">
      <CategorySidebar />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </div>
  );
}
