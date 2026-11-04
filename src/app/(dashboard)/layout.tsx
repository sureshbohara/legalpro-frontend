import ProtectedRoute from "@/components/ui/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}