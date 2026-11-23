import Link from "next/link";
import { PRACTICALS, PROJECT, TOOLS, SCHEDULE, MODULES } from "@/lib/course-data";

export const metadata = { title: "ปฏิบัติการ | Network Course" };

export default function PracticalPage() {
  return (
    <div className="course">
      <h1 className="page-title">การปฏิบัติการ</h1>
      <p className="page-sub">
        ฝึกปฏิบัติต่อเนื่องด้วยเครื่องมือมาตรฐาน เพื่อเชื่อมโยงทฤษฎีกับงานจริง
        และพัฒนาทักษะการออกแบบ กำหนดค่า เขียนโปรแกรม และวิเคราะห์เครือข่าย
      </p>

      <div className="practical-list">
        {PRACTICALS.map((p) => {
          const module = MODULES.find((m) => {
            const [start, end] = m.weeks.split("–").map(Number);
            return p.n >= start && p.n <= end;
          });
          return (
            <article className="practical" key={p.n}>
              <Link href={`/practical/${p.n}`} className="practical-link">
                <div className="pr-head">
                  <span className="pr-n">{p.n}</span>
                  <h3>{p.topic}</h3>
                  <span className="pr-hours">{module?.name || p.module}</span>
                </div>
                <p className="pr-lab">{p.lab}</p>
                <div className="pr-meta">
                  <span>
                    <em>เครื่องมือ:</em> {p.tools}
                  </span>
                  <span>
                    <em>ผลการเรียนรู้:</em> {p.clo}
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <h2 className="section-title">เครื่องมือที่ใช้ในรายวิชา</h2>
      <div className="tool-links">
        {TOOLS.map((t) =>
          t.href ? (
            <Link key={t.name} href={t.href} className="tool-link">
              <b>{t.name}</b>
              <small>{t.desc}</small>
            </Link>
          ) : (
            <div key={t.name} className="tool-link">
              <b>{t.name}</b>
              <small>{t.desc}</small>
            </div>
          )
        )}
      </div>

      <h2 className="section-title">สัดส่วนเวลา</h2>
      <div className="pract-wrap">
        <table className="pract">
          <thead>
            <tr>
              <th>กิจกรรม</th>
              <th>สัดส่วน</th>
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map((s, i) => (
              <tr key={i}>
                <td>{s.activity}</td>
                <td className="c">{s.pct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">โครงงานปลายภาค (เรื่องสุดท้าย)</h2>
      <div className="project">
        <h3>{PROJECT.title}</h3>
        <p>{PROJECT.desc}</p>
      </div>
    </div>
  );
}