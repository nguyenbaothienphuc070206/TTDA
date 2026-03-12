/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const permissionsPolicyDefault =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=*";
const permissionsPolicyAllowCamera =
  "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=*";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: permissionsPolicyDefault,
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: "base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'",
  },
];

if (isProd) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const securityHeadersAllowCamera = securityHeaders.map((h) =>
  h.key === "Permissions-Policy"
    ? { ...h, value: permissionsPolicyAllowCamera }
    : h
);

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/admin/diem-danh",
        headers: securityHeadersAllowCamera,
      },
      {
        source: "/admin/diem-danh/:path*",
        headers: securityHeadersAllowCamera,
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
