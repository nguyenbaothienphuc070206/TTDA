import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Đăng nhập Admin",
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <AdminLoginForm />
    </div>
  );
}
