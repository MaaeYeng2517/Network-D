import "../globals.css";

export const metadata = {
  title: "Network-D สำหรับการเรียนรู้",
};

export default function AuthLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}