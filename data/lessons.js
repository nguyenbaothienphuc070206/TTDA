export const LEVELS = [
  {
    id: "co-ban",
    title: "Cơ bản",
    short: "Nền tảng",
    description:
      "Làm quen tư thế, di chuyển và đòn tay/chân căn bản. Tập chậm, đúng kỹ thuật trước khi tăng tốc.",
  },
  {
    id: "trung-cap",
    title: "Trung cấp",
    short: "Kết hợp",
    description:
      "Bắt đầu phối hợp động tác, phản xạ, tự vệ cơ bản và tăng độ bền. Luôn ưu tiên an toàn khớp gối/hông.",
  },
  {
    id: "nang-cao",
    title: "Nâng cao",
    short: "Ứng dụng",
    description:
      "Tập chuỗi kỹ thuật, đối luyện, thăng bằng và sức mạnh. Nên có người hướng dẫn khi tập động tác khó.",
  },
];

export const LESSONS = [
  {
    slug: "tu-the-chuan-bi",
    level: "co-ban",
    title: "Tư thế chuẩn bị + tấn cơ bản",
    minutes: 15,
    summary:
      "Căn chỉnh lưng, hông, gối; làm quen tấn trung bình để tạo nền cho mọi kỹ thuật.",
    goals: [
      "Đứng đúng trục (đầu–vai–hông) và giữ thăng bằng",
      "Biết cách siết bụng nhẹ, thả lỏng vai",
      "Giữ tấn 20–30 giây mà không đau gối",
    ],
    steps: [
      "Đứng thẳng, hai chân rộng bằng vai; thả lỏng vai và cổ.",
      "Hạ trọng tâm nhẹ: gối hướng theo mũi chân, không đổ vào trong.",
      "Giữ lưng thẳng tự nhiên, mắt nhìn thẳng; thở đều.",
      "Tập giữ 3 hiệp × 20 giây; nghỉ 20–30 giây mỗi hiệp.",
    ],
    mistakes: [
      "Gối chụm vào trong hoặc vượt quá mũi chân quá nhiều",
      "Căng vai, gồng cổ; thở nín",
      "Đổ người về trước làm mất thăng bằng",
    ],
    tips: [
      "Nếu đau gối: giảm độ hạ trọng tâm, ưu tiên đúng hướng gối",
      "Tập trước gương 3 phút để tự chỉnh tư thế",
    ],
  },
  {
    slug: "di-chuyen-co-ban",
    level: "co-ban",
    title: "Di chuyển cơ bản (tiến/lùi/ngang)",
    minutes: 18,
    summary:
      "Học cách bước ngắn, chắc; giữ khoảng cách và trục cơ thể khi di chuyển.",
    goals: [
      "Di chuyển mà không nhảy bật lên xuống",
      "Giữ trọng tâm ổn định và tay thủ đúng",
      "Tập được 2–3 phút liên tục",
    ],
    steps: [
      "Đứng tư thế thủ: hai tay cao, khuỷu gần thân.",
      "Tiến: bước chân trước một đoạn ngắn, chân sau kéo theo.",
      "Lùi: bước chân sau về sau, chân trước kéo theo.",
      "Ngang: bước sang trái/phải, giữ khoảng cách hai chân.",
      "Tập 4 hướng: mỗi hướng 30–45 giây; nghỉ 15 giây.",
    ],
    mistakes: [
      "Bước quá dài khiến mất thăng bằng",
      "Để tay rơi xuống thấp khi di chuyển",
      "Nhảy bật khiến khó kiểm soát",
    ],
    tips: [
      "Tưởng tượng có ly nước trên đầu: di chuyển êm",
      "Ưu tiên bước ngắn – chắc – đều",
    ],
  },
  {
    slug: "dam-thang-co-ban",
    level: "co-ban",
    title: "Đấm thẳng cơ bản (đòn tay)",
    minutes: 20,
    summary:
      "Tập lực từ chân–hông–vai; đấm nhanh gọn và thu tay về thủ.",
    goals: [
      "Đấm thẳng đúng đường (không vung ngang)",
      "Xoay nhẹ hông để tạo lực",
      "Thu tay về nhanh, bảo vệ cằm",
    ],
    steps: [
      "Tư thế thủ: tay trước che cằm, tay sau che má.",
      "Đấm tay trước: vai thả lỏng, khuỷu đi sát trục.",
      "Khi chạm mục tiêu tưởng tượng: siết nắm tay và thở ra.",
      "Thu tay về ngay để về tư thế thủ.",
      "Tập 3 hiệp: 30 giây đấm – 30 giây nghỉ.",
    ],
    mistakes: [
      "Đấm bằng vai (gồng vai) thay vì dùng trục cơ thể",
      "Khuỷu mở rộng khiến đòn bị hở",
      "Không thu tay về, hạ tay thủ",
    ],
    tips: [
      "Đấm vào không khí trước, sau đó mới tập bao đấm (nếu có)",
      "Giữ cổ tay thẳng để tránh đau",
    ],
  },
  {
    slug: "da-tong-truoc",
    level: "co-ban",
    title: "Đá tống trước (đòn chân cơ bản)",
    minutes: 22,
    summary:
      "Tập nâng gối, duỗi chân và thu về nhanh; giữ thăng bằng và bảo vệ hông.",
    goals: [
      "Nâng gối đúng hướng, không mở hông quá sớm",
      "Đá thẳng, thu chân về nhanh",
      "Giữ thăng bằng trên chân trụ",
    ],
    steps: [
      "Tư thế thủ; trọng tâm đều.",
      "Nâng gối chân đá lên trước (gối ngang hông hoặc thấp hơn tùy sức).",
      "Duỗi cẳng chân ra trước (tống), thở ra.",
      "Thu chân về (gập gối), đặt xuống nhẹ nhàng.",
      "Tập mỗi chân 10 lần × 3 hiệp; nghỉ 30 giây.",
    ],
    mistakes: [
      "Ngả người ra sau quá nhiều",
      "Đặt chân xuống mạnh gây đau gối",
      "Không thu chân về khiến mất nhịp",
    ],
    tips: [
      "Tập bám tường 1 tay để học thăng bằng",
      "Không cố đá cao khi chưa kiểm soát tốt",
    ],
  },
  {
    slug: "do-co-ban",
    level: "co-ban",
    title: "Đỡ cơ bản (gạt/chặn)",
    minutes: 18,
    summary:
      "Học 3 kiểu đỡ đơn giản để bảo vệ đầu và thân khi tập phản xạ.",
    goals: [
      "Đỡ gọn, không vung tay quá rộng",
      "Giữ cằm thấp, mắt nhìn thẳng",
      "Kết hợp đỡ + thu về tư thế thủ",
    ],
    steps: [
      "Tư thế thủ; khuỷu gần thân.",
      "Đỡ ngoài: tay gạt từ trong ra ngoài, dừng trước vai.",
      "Đỡ trong: tay gạt từ ngoài vào trong, che giữa thân.",
      "Chặn xuống: gập khuỷu, hạ tay chặn đòn thấp.",
      "Tập theo nhịp: 1–2–3–4 (đỡ/thu về).",
    ],
    mistakes: [
      "Vung tay rộng làm hở sườn",
      "Ngửa cằm, quên tay thủ",
      "Đỡ bằng cổ tay yếu thay vì cả cẳng tay",
    ],
    tips: [
      "Tập chậm để đúng vị trí, rồi mới tăng tốc",
      "Có thể tập cùng bạn: người kia ra đòn giả chậm",
    ],
  },

  {
    slug: "da-vong-cau",
    level: "trung-cap",
    title: "Đá vòng cầu (đá ngang)",
    minutes: 25,
    summary:
      "Tập xoay trụ, mở hông và đánh bằng mu bàn chân/cẳng chân (tùy bài tập).",
    goals: [
      "Xoay chân trụ đúng để bảo vệ gối",
      "Mở hông vừa đủ, không giật gối",
      "Thu chân về nhanh để giữ thăng bằng",
    ],
    steps: [
      "Từ tư thế thủ, nâng gối lên trước.",
      "Xoay chân trụ theo hướng đá; mở hông.",
      "Vung cẳng chân theo vòng cung, thở ra.",
      "Thu chân về, đặt xuống và về thủ.",
      "Tập 8–10 lần mỗi chân × 3 hiệp.",
    ],
    mistakes: [
      "Không xoay chân trụ làm xoắn gối",
      "Ngả người quá nhiều",
      "Hạ tay thủ khi đá",
    ],
    tips: [
      "Tập chậm, ưu tiên xoay trụ trước khi tăng lực",
      "Nếu khó thăng bằng, giảm biên độ đá",
    ],
  },
  {
    slug: "cho-goi-co-ban",
    level: "trung-cap",
    title: "Chỏ ngang + gối thẳng",
    minutes: 20,
    summary:
      "Bộ đôi cự ly gần: chỏ để tạo khoảng trống, gối để kết thúc nhanh.",
    goals: [
      "Giữ khuỷu khép, chỏ gọn",
      "Đưa hông theo đòn để có lực",
      "Giữ cổ và cằm an toàn",
    ],
    steps: [
      "Chỏ ngang: xoay thân, khuỷu ngang vai, tay còn lại che mặt.",
      "Gối thẳng: ôm tay giả (hoặc không), kéo hông vào, gối lên.",
      "Tập theo combo: chỏ–chỏ–gối, rồi nghỉ.",
      "3 hiệp × 45 giây; nghỉ 30 giây.",
    ],
    mistakes: [
      "Chỏ vung quá rộng",
      "Gối bằng chân thay vì kéo hông",
      "Quên tay che mặt",
    ],
    tips: [
      "Tập trước gương để kiểm soát khuỷu",
      "Giữ nhịp thở đều để không hụt hơi",
    ],
  },
  {
    slug: "khoa-tay-tu-ve-1",
    level: "trung-cap",
    title: "Tự vệ: khóa tay cơ bản 1",
    minutes: 28,
    summary:
      "Học cách thoát nắm cổ tay và khóa tay đơn giản (tập nhẹ, có bạn tập).",
    goals: [
      "Biết hướng thoát nắm cổ tay đúng",
      "Khóa gọn, không giật mạnh gây chấn thương",
      "Giữ khoảng cách an toàn khi tập đôi",
    ],
    steps: [
      "Bạn tập nắm cổ tay nhẹ.",
      "Xoay cổ tay theo điểm yếu (ngón cái) để thoát.",
      "Bước ra góc an toàn, giữ trục.",
      "Đặt tay lên khuỷu đối phương (nhẹ) để tạo khóa cơ bản.",
      "Dừng ngay khi bạn tập cảm thấy đau.",
    ],
    mistakes: [
      "Giật mạnh hoặc bẻ đột ngột",
      "Đứng đối diện trực diện, không bước góc",
      "Tập quá nhanh khi chưa thống nhất tín hiệu dừng",
    ],
    tips: [
      "Luôn thỏa thuận tín hiệu 'dừng' trước khi tập",
      "Ưu tiên kỹ thuật đúng – lực nhẹ",
    ],
  },
  {
    slug: "nga-an-toan",
    level: "trung-cap",
    title: "Ngã an toàn (cơ bản)",
    minutes: 18,
    summary:
      "Tập cách ngã và chống tay đúng để giảm chấn thương khi trượt/va chạm.",
    goals: [
      "Biết cách cuộn lưng và đập tay đúng (mức nhẹ)",
      "Giữ cằm và cổ an toàn",
      "Tập trên thảm/phần mềm",
    ],
    steps: [
      "Chọn mặt phẳng an toàn: thảm, nệm mỏng hoặc sàn có thảm.",
      "Tập ngồi xuống rồi lăn nhẹ ra sau, cằm hơi thu.",
      "Tay đập xuống chéo (nhẹ) để phân tán lực.",
      "Tập 6–8 lần, nghỉ; không tập khi chóng mặt.",
    ],
    mistakes: [
      "Ngửa cổ ra sau",
      "Chống tay thẳng cứng (dễ đau cổ tay)",
      "Tập trên nền cứng khi chưa quen",
    ],
    tips: [
      "Tập rất chậm và có người quan sát lần đầu",
      "Nếu có tiền sử chấn thương cổ/lưng, nên hỏi HLV",
    ],
  },

  {
    slug: "doi-luyen-1",
    level: "nang-cao",
    title: "Đối luyện 1 (song luyện cơ bản lên nâng cao)",
    minutes: 30,
    summary:
      "Tập phối hợp ra–đỡ–phản đòn theo nhịp, ưu tiên đúng khoảng cách và an toàn.",
    goals: [
      "Giữ nhịp đều, không vội",
      "Đúng khoảng cách để đòn không chạm mạnh",
      "Biết dừng khi mất kiểm soát",
    ],
    steps: [
      "Thống nhất tốc độ: chậm 50% trong 5 phút đầu.",
      "Lặp chuỗi 1: đòn tay – đỡ – phản đòn.",
      "Lặp chuỗi 2: đòn chân – né – phản đòn.",
      "Tăng tốc nhẹ nếu cả hai đều kiểm soát tốt.",
    ],
    mistakes: [
      "Tăng tốc quá sớm",
      "Đứng sai khoảng cách khiến đòn chạm mạnh",
      "Không giao tiếp khi tập đôi",
    ],
    tips: [
      "Đeo bảo hộ nếu có (găng, bảo vệ ống quyển)",
      "Quay video 10–20 giây để tự xem lại",
    ],
  },
  {
    slug: "da-bay-co-ban",
    level: "nang-cao",
    title: "Đá bay (nền tảng)",
    minutes: 25,
    summary:
      "Bài tập nền để nhảy–đá an toàn: bật, đáp, giữ gối/hông ổn định.",
    goals: [
      "Biết cách đáp mềm bằng mũi bàn chân",
      "Giữ gối thẳng hướng, không đổ vào trong",
      "Tập được 6–8 lần mà vẫn kiểm soát",
    ],
    steps: [
      "Khởi động kỹ cổ chân, gối, hông (5–7 phút).",
      "Tập bật tại chỗ: 10 lần × 2 hiệp.",
      "Tập nhảy nâng gối (không đá): 6–8 lần.",
      "Khi đã ổn: thêm động tác đá nhẹ và đáp mềm.",
    ],
    mistakes: [
      "Đáp gót mạnh gây sốc gối",
      "Đá quá cao khi chưa kiểm soát đáp",
      "Bỏ qua khởi động",
    ],
    tips: [
      "Ưu tiên đáp mềm – kiểm soát – rồi mới tăng độ cao",
      "Nếu đau cổ chân/gối, dừng và giảm cường độ",
    ],
  },
  {
    slug: "phan-don-nang-cao",
    level: "nang-cao",
    title: "Phản đòn nâng cao (nguyên tắc)",
    minutes: 22,
    summary:
      "Không chỉ là kỹ thuật: hiểu thời điểm, góc bước và cách giữ an toàn.",
    goals: [
      "Biết 3 nguyên tắc: né – góc – phản",
      "Giữ mắt quan sát và tay thủ",
      "Tập được với nhịp chậm, rõ",
    ],
    steps: [
      "Né: lùi/né ngang nhỏ, không nhảy.",
      "Góc: bước ra ngoài đường đòn.",
      "Phản: ra đòn ngắn gọn, rồi về thủ.",
      "Tập với bạn: mỗi người ra đòn giả chậm 10 lần.",
    ],
    mistakes: [
      "Né quá lớn khiến mất cơ hội phản",
      "Quên về thủ sau khi phản",
      "Đứng thẳng người, trọng tâm cao",
    ],
    tips: [
      "Tập nhịp: 1 (né) – 2 (góc) – 3 (phản)",
      "Đặt mục tiêu ‘an toàn’ trước ‘nhanh’",
    ],
  },
  {
    slug: "doi-khang-can-ban",
    level: "nang-cao",
    title: "Đối kháng: chiến lược căn bản",
    minutes: 20,
    summary:
      "Tập tư duy: khoảng cách, nhịp và lựa chọn đòn an toàn khi sparring.",
    goals: [
      "Biết 3 khoảng cách: xa – trung – gần",
      "Giữ nhịp thở và di chuyển tiết kiệm",
      "Chọn đòn an toàn, kiểm soát lực",
    ],
    steps: [
      "Khởi động 5 phút.",
      "Tập di chuyển giữ khoảng cách (2 phút).",
      "Tập 3 combo đơn giản (đòn tay + thoát ra).",
      "Spar nhẹ 3 hiệp × 1 phút (nếu có bảo hộ và người hướng dẫn).",
    ],
    mistakes: [
      "Đứng yên quá lâu",
      "Đánh mạnh khi không có bảo hộ",
      "Mất kiểm soát nhịp thở",
    ],
    tips: [
      "Nếu không có HLV: chỉ tập shadow + di chuyển",
      "Ưu tiên an toàn cho bạn tập",
    ],
  },
];

export function getLessonBySlug(slug) {
  return LESSONS.find((l) => l.slug === slug) || null;
}

export function getLessonsByLevel(levelId) {
  return LESSONS.filter((l) => l.level === levelId);
}
