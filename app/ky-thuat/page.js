import TechniqueLibrary from "@/components/TechniqueLibrary";

export const metadata = {
  title: "Thư viện kỹ thuật",
};

export default function TechniqueLibraryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Thư viện kỹ thuật (Wiki Vovinam)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Tra cứu đòn chân/đòn tay/tấn pháp/khóa gỡ/phản đòn bằng bộ lọc thông minh.
        </p>
      </header>

      <TechniqueLibrary />
    </div>
  );
}
