import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "Network-D",
  description: "บทเรียนและการปฏิบัติการระบบเครือข่ายและการสื่อสารข้อมูลคอมพิวเตอร์ 12 สัปดาห์",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}