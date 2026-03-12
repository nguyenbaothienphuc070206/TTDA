import Storefront from "@/components/Storefront";

export const metadata = {
  title: "Cửa hàng",
};

export default function StorePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Cửa hàng
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Mua đồ tập & phụ kiện (demo). Giỏ hàng và đơn hàng được lưu trên máy của
          bạn.
        </p>
      </header>

      <Storefront />
    </div>
  );
}
