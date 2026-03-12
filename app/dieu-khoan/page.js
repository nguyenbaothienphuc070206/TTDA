export const metadata = {
  title: "Điều khoản sử dụng",
};

function Block({ title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-slate-300">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Điều khoản sử dụng
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Dùng ứng dụng nghĩa là bạn đồng ý với các điều khoản dưới đây.
        </p>
      </header>

      <div className="grid gap-4">
        <Block title="1) Mục đích">
          <p>
            Ứng dụng cung cấp lộ trình và bài tập tham khảo để hỗ trợ việc tự
            luyện. Nội dung không thay thế hướng dẫn trực tiếp từ huấn luyện
            viên.
          </p>
        </Block>

        <Block title="2) An toàn luyện tập">
          <ul className="list-disc pl-5">
            <li>Luôn khởi động kỹ và tập trong phạm vi thể lực.</li>
            <li>Dừng lại nếu đau nhói, chóng mặt hoặc có dấu hiệu chấn thương.</li>
            <li>Kỹ thuật khó nên có HLV/bạn tập giám sát.</li>
          </ul>
        </Block>

        <Block title="3) Trách nhiệm">
          <p>
            Người dùng tự chịu trách nhiệm cho việc luyện tập và quyết định áp
            dụng kỹ thuật. Chủ dự án/nhà phát triển không chịu trách nhiệm cho
            các chấn thương phát sinh do tập sai hoặc tập vượt khả năng.
          </p>
        </Block>

        <Block title="4) Sở hữu nội dung">
          <p>
            Nội dung bài học trong dự án này mang tính minh họa (demo) và có thể
            được chỉnh sửa/đóng góp tùy nhu cầu của bạn.
          </p>
        </Block>

        <Block title="5) Thay đổi điều khoản">
          <p>
            Điều khoản có thể được cập nhật khi ứng dụng thay đổi tính năng. Bạn
            nên kiểm tra lại khi có phiên bản mới.
          </p>
        </Block>
      </div>
    </div>
  );
}
