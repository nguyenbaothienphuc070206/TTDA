"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";

import { PRODUCTS, formatVnd } from "@/data/store";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Martial Gear Showroom",
      description:
        "Browse by equipment groups and suggested combos. This is an affiliate model: click \"Buy from partner\" to open external stores.",
      affiliateNote:
        "When you purchase via links, the app may receive a commission (without increasing your price). Displayed prices are for reference; final prices are set by partner stores.",
      comboTitle: "Suggested combos",
      combos: [
        {
          title: "Beginner Combo",
          description: "Everything needed to start fundamentals (uniform + belt + protection).",
          ids: ["vo-phuc-basic", "dai-lam", "bao-ho-ong-quyen"],
        },
        {
          title: "Foundation Combo",
          description: "Minimal but standard setup (uniform + belt).",
          ids: ["vo-phuc-basic", "dai-lam"],
        },
        {
          title: "Weapon Basics Combo",
          description: "Suggested setup for basic staff technique training.",
          ids: ["con-nhua"],
        },
      ],
      categoryTitles: {
        "võ phục": "Uniform",
        "phù hiệu/đai": "Belts & badges",
        "bảo hộ": "Protection",
        "binh khí": "Weapons",
      },
      otherCategory: "Other",
      itemCount: (count) => `${count} items`,
      partnerDefault: "Partner",
      view3d: "View 3D",
      buyAt: (partner) => `Buy from ${partner} ->`,
      noPartnerLink: "Partner link unavailable",
      learnWeapon: "Learn about weapon",
      loadingAria: "Loading showroom",
      loadingProducts: "Loading product list...",
    };
  }

  if (id === "ja") {
    return {
      title: "武術ショールーム",
      description:
        "装備カテゴリ別に閲覧でき、練習向けのセットも提案します。これはアフィリエイト形式で、\"提携先で購入\" から外部ページを開きます。",
      affiliateNote:
        "リンク経由で購入されると、アプリに手数料が入る場合があります（価格は上がりません）。表示価格は参考で、実際の価格は提携先ページに準拠します。",
      comboTitle: "おすすめセット",
      combos: [
        {
          title: "初心者セット",
          description: "基礎練習の開始に必要な一式（道着 + 帯 + 防具）。",
          ids: ["vo-phuc-basic", "dai-lam", "bao-ho-ong-quyen"],
        },
        {
          title: "基礎セット",
          description: "最小構成で標準的（道着 + 帯）。",
          ids: ["vo-phuc-basic", "dai-lam"],
        },
        {
          title: "武器基礎セット",
          description: "基本棍術の練習向け提案。",
          ids: ["con-nhua"],
        },
      ],
      categoryTitles: {
        "võ phục": "道着",
        "phù hiệu/đai": "帯・ワッペン",
        "bảo hộ": "防具",
        "binh khí": "武器",
      },
      otherCategory: "その他",
      itemCount: (count) => `${count}点`,
      partnerDefault: "提携先",
      view3d: "3Dを見る",
      buyAt: (partner) => `${partner} で購入 ->`,
      noPartnerLink: "提携先リンクなし",
      learnWeapon: "武器を詳しく見る",
      loadingAria: "ショールームを読み込み中",
      loadingProducts: "商品一覧を読み込み中...",
    };
  }

  return {
    title: "Showroom Võ Thuật",
    description:
      "Phân loại theo nhóm trang bị và gợi ý combo phù hợp. Đây là mô hình Affiliate: bấm \"Mua tại đối tác\" để mở trang mua bên ngoài.",
    affiliateNote:
      "Khi bạn mua qua liên kết, ứng dụng có thể nhận hoa hồng (không làm tăng giá). Giá hiển thị chỉ để tham khảo; giá thực tế theo trang đối tác.",
    comboTitle: "Combo gợi ý",
    combos: [
      {
        title: "Combo Người Mới",
        description: "Đủ để bắt đầu tập nền tảng (võ phục + đai + bảo hộ).",
        ids: ["vo-phuc-basic", "dai-lam", "bao-ho-ong-quyen"],
      },
      {
        title: "Combo Nền Tảng",
        description: "Tối giản nhưng đúng chuẩn (võ phục + đai).",
        ids: ["vo-phuc-basic", "dai-lam"],
      },
      {
        title: "Combo Binh Khí",
        description: "Gợi ý cho buổi tập kỹ thuật côn cơ bản.",
        ids: ["con-nhua"],
      },
    ],
    categoryTitles: {
      "võ phục": "Võ phục",
      "phù hiệu/đai": "Đai & phù hiệu",
      "bảo hộ": "Bảo hộ",
      "binh khí": "Binh khí",
    },
    otherCategory: "Khác",
    itemCount: (count) => `${count} món`,
    partnerDefault: "Đối tác",
    view3d: "Xem 3D",
    buyAt: (partner) => `Mua tại ${partner} ->`,
    noPartnerLink: "Chưa có link đối tác",
    learnWeapon: "Tìm hiểu võ khí",
    loadingAria: "Đang tải showroom",
    loadingProducts: "Đang tải danh sách sản phẩm...",
  };
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

function ComboCard({ title, description, items, totalVnd }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-slate-300">{description}</div>
        </div>
        <div className="text-sm font-semibold text-white">{formatVnd(totalVnd)}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((p) => {
          const href = String(p.affiliateUrl || "").trim();
          return href ? (
            <a
              key={p.id}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              title={`Mở link mua: ${p.name}`}
            >
              {p.name}
            </a>
          ) : (
            <Pill key={p.id}>{p.name}</Pill>
          );
        })}
      </div>
    </div>
  );
}

function StorefrontEmptySkeleton({ copy }) {
  return (
    <div className="mt-6 grid gap-4" role="status" aria-live="polite" aria-label={copy.loadingAria}>
      <span className="sr-only">{copy.loadingProducts}</span>

      {[0, 1].map((idx) => (
        <section
          key={idx}
          className="rounded-3xl border border-blue-400/20 bg-slate-950/30 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-28 rounded-full bg-blue-300/20 animate-pulse" />
            <div className="h-3 w-12 rounded-full bg-blue-300/20 animate-pulse" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[0, 1].map((card) => (
              <div
                key={card}
                className="rounded-3xl border border-blue-400/20 bg-slate-950/20 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-40 max-w-full rounded-full bg-blue-300/20 animate-pulse" />
                    <div className="mt-2 h-3 w-64 max-w-full rounded-full bg-blue-300/20 animate-pulse" />
                  </div>
                  <div className="h-4 w-20 rounded-full bg-blue-300/20 animate-pulse" />
                </div>

                <div className="mt-4 h-11 w-full rounded-2xl bg-blue-500/15 animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Storefront() {
  const locale = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);

  const categories = useMemo(() => {
    const order = [
      { id: "võ phục", title: copy.categoryTitles["võ phục"] || copy.otherCategory },
      { id: "phù hiệu/đai", title: copy.categoryTitles["phù hiệu/đai"] || copy.otherCategory },
      { id: "bảo hộ", title: copy.categoryTitles["bảo hộ"] || copy.otherCategory },
      { id: "binh khí", title: copy.categoryTitles["binh khí"] || copy.otherCategory },
    ];

    const grouped = new Map();
    for (const p of PRODUCTS) {
      const key = String(p.category || "khác");
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(p);
    }

    return order
      .map((c) => ({ ...c, items: grouped.get(c.id) || [] }))
      .filter((c) => c.items.length);
  }, [copy]);

  const combos = useMemo(() => {
    const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
    const build = (title, description, ids) => {
      const items = ids.map((id) => byId.get(id)).filter(Boolean);
      const totalVnd = items.reduce((sum, p) => sum + (Number(p.priceVnd) || 0), 0);
      return { title, description, items, totalVnd };
    };

    return copy.combos
      .map((combo) => build(combo.title, combo.description, combo.ids))
      .filter((c) => c.items.length);
  }, [copy]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        {copy.description}
      </p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-300">
        {copy.affiliateNote}
      </div>

      {combos.length ? (
        <div className="mt-6">
          <div className="text-sm font-semibold text-white">{copy.comboTitle}</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {combos.map((c) => (
              <ComboCard
                key={c.title}
                title={c.title}
                description={c.description}
                items={c.items}
                totalVnd={c.totalVnd}
              />
            ))}
          </div>
        </div>
      ) : null}

      {categories.length ? (
        <div className="mt-6 grid gap-6">
          {categories.map((cat) => (
            <section key={cat.id} className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">{cat.title}</div>
                <div className="text-xs text-slate-300">{copy.itemCount(cat.items.length)}</div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {cat.items.map((p) => {
                  const href = String(p.affiliateUrl || "").trim();
                  const partnerName = String(p.partnerName || copy.partnerDefault).trim() || copy.partnerDefault;
                  const isWeapon = String(p.category || "") === "binh khí";
                  const weaponSlug = String(p.weaponSlug || "").trim();
                  const weaponHref = weaponSlug ? `/binh-khi/${weaponSlug}` : "";
                  const badges = [
                    ...(Array.isArray(p.badges) ? p.badges : []),
                    ...(isWeapon ? [copy.view3d] : []),
                  ];

                  return (
                    <div key={p.id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{p.name}</div>
                          <div className="mt-1 text-xs text-slate-300">{p.summary}</div>
                        </div>

                        <div className="text-sm font-semibold text-white">{formatVnd(p.priceVnd)}</div>
                      </div>

                      {badges.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {badges.map((b) => (
                            <Pill key={b}>{b}</Pill>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 grid gap-2">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                          >
                            {copy.buyAt(partnerName)}
                          </a>
                        ) : (
                          <div className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-300">
                            {copy.noPartnerLink}
                          </div>
                        )}

                        {isWeapon && weaponHref ? (
                          <a
                            href={weaponHref}
                            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                          >
                            {copy.learnWeapon}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <StorefrontEmptySkeleton copy={copy} />
      )}
    </div>
  );
}
