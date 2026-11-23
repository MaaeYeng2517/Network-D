import Link from "next/link";
import { COURSE, PROJECT, OUTCOMES, WEEKS, PRACTICALS } from "@/lib/course-data";

export default function Home() {
  return (
    <div className="course">
      <section className="hero">
        <h1>{COURSE.titleTh}</h1>
        <p className="sub">
          {COURSE.title} — หลักสูตรปฏิบัติ {COURSE.weeks} สัปดาห์ ครอบคลุม Network Fundamentals,
          Switching & Routing, Network Programming, Services, Analysis, Monitoring, Automation,
          Security, Performance และโครงงานบูรณาการ
        </p>
      </section>

      <section>
        <div className="section-title-row">
          <h2 className="section-title">บทเรียน {COURSE.weeks} เรื่อง</h2>
          <Link className="more" href="/lessons">ดูทั้งหมด →</Link>
        </div>
        <div className="weeks">
          {WEEKS.map((w) => (
            <Link className="week" href={`/lessons/${w.n}`} key={w.n}>
              <div className="n">เรื่องที่ {w.n}</div>
              <h3>{w.title}</h3>
              <p className="desc">{w.summary}</p>
              <div className="lbl">วัตถุประสงค์</div>
              <ul>
                {w.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title-row">
          <h2 className="section-title">หัวข้อปฏิบัติการ</h2>
          <Link className="more" href="/practical">ดูทั้งหมด →</Link>
        </div>
        <div className="pract-wrap">
          <table className="pract">
            <thead>
              <tr>
                <th>สัปดาห์</th>
                <th>หัวข้อ</th>
                <th>เครื่องมือ</th>
                <th>ผลการเรียนรู้</th>
              </tr>
            </thead>
            <tbody>
              {PRACTICALS.map((p) => (
                <tr key={p.n}>
                  <td className="c">{p.n}</td>
                  <td>{p.topic}</td>
                  <td>{p.tools}</td>
                  <td>{p.clo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="section-title">โครงงาน</h2>
        <div className="project">
          <h3>{PROJECT.title}</h3>
          <p>{PROJECT.desc}</p>
        </div>
      </section>

      <section>
        <h2 className="section-title">ผลลัพธ์ที่คาดหวัง (CLO)</h2>
        <ul className="outcomes">
          {OUTCOMES.map((o) => (
            <li key={o.id}>
              <b className="clo-id">{o.id}</b> {o.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}