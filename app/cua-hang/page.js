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
          Cửa hàng theo mô hình Affiliate: bấm “Mua tại đối tác” để mở trang mua
          hàng bên ngoài. Ứng dụng có thể nhận hoa hồng khi bạn mua qua liên kết.
        </p>
      </header>

      <Storefront />
    </div>
  );
}
