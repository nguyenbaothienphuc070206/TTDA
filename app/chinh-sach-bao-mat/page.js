export const metadata = {
  title: "Chính sách bảo mật",
};

function Block({ title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-slate-300">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Chính sách bảo mật
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Trang này giải thích cách ứng dụng xử lý dữ liệu của bạn.
        </p>
      </header>

      <div className="grid gap-4">
        <Block title="1) Dữ liệu chúng tôi lưu">
          <p>
            Ứng dụng hiện tại <strong>không yêu cầu đăng nhập</strong> và
            <strong> không có backend</strong> để thu thập dữ liệu người dùng.
          </p>
          <p className="mt-3">
            Những thứ được lưu trên thiết bị của bạn (trình duyệt) gồm:
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>Tiến độ bài học đã hoàn thành.</li>
            <li>Lịch tập 7 ngày bạn tạo.</li>
          </ul>
        </Block>

        <Block title="2) Dữ liệu được lưu ở đâu">
          <p>
            Dữ liệu được lưu <strong>cục bộ</strong> bằng <em>localStorage</em>
            của trình duyệt. Bạn có thể xóa bằng cách xóa dữ liệu trang web trong
            trình duyệt.
          </p>
        </Block>

        <Block title="3) Chia sẻ dữ liệu với bên thứ ba">
          <p>
            Ứng dụng không gửi dữ liệu tiến độ/lịch tập của bạn lên server, và
            không chủ đích chia sẻ cho bên thứ ba.
          </p>
        </Block>

        <Block title="4) Bảo mật">
          <p>
            Ứng dụng đã bật các cấu hình bảo mật web phổ biến (security headers)
            để giảm rủi ro XSS/clickjacking và các hành vi nhúng trái phép.
          </p>
          <p className="mt-3">
            Tuy nhiên, không có hệ thống nào đảm bảo “tuyệt đối 100%”. Bạn nên:
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>Dùng trình duyệt cập nhật.</li>
            <li>Không cài extension lạ có thể đọc dữ liệu trình duyệt.</li>
            <li>Chỉ truy cập từ nguồn/đường dẫn tin cậy.</li>
          </ul>
        </Block>

        <Block title="5) Liên hệ">
          <p>
            Nếu bạn muốn bổ sung trang liên hệ (email, form) hoặc triển khai đăng
            nhập, mình có thể thêm theo yêu cầu.
          </p>
        </Block>
      </div>
    </div>
  );
}
