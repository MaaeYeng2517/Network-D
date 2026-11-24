"use client";

import Link from "next/link";
import { useState } from "react";
import { COURSE, PROJECT, OUTCOMES, WEEKS, PRACTICALS } from "@/lib/course-data";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [weeksExpanded, setWeeksExpanded] = useState(false);

  const LINKS = [
    { href: "/", label: "หน้าแรก", active: true },
    { href: "/lessons", label: "บทเรียน" },
    { href: "/practical", label: "ปฏิบัติการ" },
    { href: "/assessment", label: "การประเมิน" },
    { href: "/topology", label: "ออกแบบเครือข่าย" },
    { href: "/iperf", label: "iPerf3 Dashboard" },
    { href: "/tcpdump", label: "tcpdump" },
    { href: "/tshark", label: "tshark" },
    { href: "/traceroute", label: "Traceroute" },
    { href: "/scapy", label: "Scapy" },
  ];

  const visibleWeeks = weeksExpanded ? WEEKS : WEEKS.slice(0, 4);

  return (
    <div className="course">
      <header className="topbar">
        <div className="brand">
          MaaeYeng/NetworktoLearning
        </div>
        <nav className="nav">
          <button className="nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-label="เมนู">
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
          <div className={`nav-links${mobileMenuOpen ? " open" : ""}`}>
            {LINKS.map((l) => (
              <Link key={l.href} className={l.active ? "active" : ""} href={l.href} onClick={() => setMobileMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <div className="wrap">
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
            {visibleWeeks.map((w) => (
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
          {WEEKS.length > 4 && (
            <button
              className="btn-expand"
              onClick={() => setWeeksExpanded(!weeksExpanded)}
              aria-expanded={weeksExpanded}
            >
              {weeksExpanded ? "ย่อ" : "ขยาย"} {weeksExpanded ? "▲" : "▼"} ({WEEKS.length} เรื่อง)
            </button>
          )}
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
    </div>
  );
}