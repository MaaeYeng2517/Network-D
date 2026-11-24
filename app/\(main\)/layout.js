import "./globals.css";
import Nav from "@/components/Nav";
import { COURSE } from "@/lib/course-data";

export const metadata = {
  title: COURSE.title,
  description: "บทเรียนและการปฏิบัติการระบบเครือข่ายและการสื่อสารข้อมูลคอมพิวเตอร์ 12 สัปดาห์",
};

export default function MainLayout({ children }) {
  return (
    <>
      <header className="topbar">
        <div className="brand">
          MaaeYeng/NetworktoLearning
        </div>
        <Nav />
      </header>
      <div className="wrap">{children}</div>
    </>
  );
}