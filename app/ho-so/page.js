import ProfileDashboard from "@/components/ProfileDashboard";

export const metadata = {
  title: "Hồ sơ",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Hồ sơ học viên
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Bằng cấp số (demo), lịch sử lên đai và nhật ký tập luyện.
        </p>
      </header>

      <ProfileDashboard />
    </div>
  );
}
