import Link from "next/link";
import { WEEKS } from "@/lib/course-data";

export const metadata = { title: "บทเรียน | Network Course" };

export default function LessonsIndex() {
  return (
    <div className="course">
      <h1 className="page-title">บทเรียน</h1>
      <p className="page-sub">
        เลือกเรื่องเพื่ออ่านเนื้อหา เป้าหมาย คำศัพท์ และคำสั่งที่เกี่ยวข้อง
      </p>

      <div className="lesson-grid">
        {WEEKS.map((w) => (
          <Link className="lesson-card" href={`/lessons/${w.n}`} key={w.n}>
            <div className="lc-top">
              <span className="n">เรื่องที่ {w.n}</span>
              <span className="lc-en">{w.titleEn}</span>
            </div>
            <h3>{w.title}</h3>
            <p>{w.summary}</p>
            <div className="lc-meta">
              <span>{w.objectives.length} วัตถุประสงค์</span>
              <span>{w.sections.length} หัวข้อ</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}