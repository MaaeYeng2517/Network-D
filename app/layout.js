import "./globals.css";
import ConditionalNav from "@/components/ConditionalNav";
import { COURSE } from "@/lib/course-data";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: COURSE.title,
  description: "บทเรียนและการปฏิบัติการระบบเครือข่ายและการสื่อสารข้อมูลคอมพิวเตอร์ 12 สัปดาห์",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>
          <header className="topbar">
            <div className="brand">
              <img src="/logo.png" alt="" style={{ width: 43, height: 43, marginRight: 8 }} />
              Network-d
            </div>
            <ConditionalNav />
          </header>
          <div className="wrap">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}