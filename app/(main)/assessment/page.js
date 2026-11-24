import { ASSESSMENT, OUTCOMES } from "@/lib/course-data";

export const metadata = { title: "การประเมิน | Network Course" };

export default function AssessmentPage() {
  const { items, details, final, rubric, cloMap } = ASSESSMENT;

  return (
    <div className="course">
      <h1 className="page-title">การประเมินผล</h1>
      <p className="page-sub">{ASSESSMENT.intro}</p>

      <section className="lesson-section">
        <h2>สัดส่วนการประเมิน (รวม 100%)</h2>
        <div className="assess-items">
          {items.map((it, i) => (
            <div className="assess-item" key={i}>
              <div className="ai-weight">{it.weight}</div>
              <div className="ai-body">
                <b>{it.name}</b>
                <span>{it.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section">
        <h2>รายละเอียดการประเมินแต่ละช่วง</h2>
        <div className="pract-wrap">
          <table className="pract">
            <thead>
              <tr>
                <th>ช่วงเวลา</th>
                <th>การประเมิน</th>
                <th>คะแนน</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d, i) => (
                <tr key={i}>
                  <td>{d.period}</td>
                  <td>{d.item}</td>
                  <td className="c">{d.score}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2" className="c">
                  <b>รวม</b>
                </td>
                <td className="c">
                  <b>{details.reduce((a, d) => a + d.score, 0)}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>
          Final Examination (เรื่องที่ 16) — {final.total} คะแนน
        </h2>
        {final.parts.map((p, i) => (
          <div className="exam-part" key={i}>
            <div className="exam-head">
              <b>{p.name}</b>
              <span className="exam-score">{p.score} คะแนน</span>
            </div>
            <p className="exam-desc">{p.desc}</p>
            <ul>
              {p.topics.map((t, j) => (
                <li key={j}>{t}</li>
              ))}
            </ul>
          </div>
        ))}

        <h3 className="exam-sub">เกณฑ์การสอบปฏิบัติ (10 คะแนน)</h3>
        <div className="pract-wrap">
          <table className="pract">
            <thead>
              <tr>
                <th>เกณฑ์</th>
                <th>คะแนน</th>
              </tr>
            </thead>
            <tbody>
              {final.practicalCriteria.map((c, i) => (
                <tr key={i}>
                  <td>{c.criterion}</td>
                  <td className="c">{c.score}</td>
                </tr>
              ))}
              <tr>
                <td className="c">
                  <b>รวม</b>
                </td>
                <td className="c">
                  <b>{final.practicalCriteria.reduce((a, c) => a + c.score, 0)}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>ความสัมพันธ์ระหว่าง CLO กับการประเมิน</h2>
        <div className="pract-wrap">
          <table className="pract">
            <thead>
              <tr>
                <th>CLO</th>
                <th>ผลลัพธ์การเรียนรู้</th>
                <th>วิธีประเมิน</th>
              </tr>
            </thead>
            <tbody>
              {cloMap.map((c, i) => (
                <tr key={i}>
                  <td className="c">
                    <b>{c.clo}</b>
                  </td>
                  <td>{c.outcome}</td>
                  <td>{c.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>เกณฑ์การประเมิน (Rubric)</h2>
        <ol className="rubric">
          {rubric.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>
      </section>

      <section className="lesson-section">
        <h2>ผลลัพธ์การเรียนรู้ (CLO)</h2>
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