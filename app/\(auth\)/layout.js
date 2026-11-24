import "./globals.css";

export const metadata = {
  title: "เข้าสู่ระบบ - iPerf3 Dashboard",
};

export default function AuthLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}