"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TABS = [
  { id: "instructors", label: "ผู้สอน", icon: "👨‍🏫" },
  { id: "students", label: "ผู้เรียน", icon: "👨‍🎓" },
  { id: "groups", label: "กลุ่ม", icon: "👥" },
  { id: "assessments", label: "การประเมิน", icon: "📋" },
  { id: "grading", label: "เก็บคะแนน", icon: "✏️" },
  { id: "results", label: "ผลการเรียน", icon: "📊" },
];

const MOCK_INSTRUCTORS = [
  { id: 1, name: "อาจารย์ สมชาย ใจดี", email: "somchai@ruts.ac.th", department: "วิศวกรรมเครือข่าย", courses: ["NET-ENG 201", "NET-ENG 301"], status: "active" },
  { id: 2, name: "อาจารย์ สuda รักเรียน", email: "suda@ruts.ac.th", department: "วิศวกรรมเครือข่าย", courses: ["NET-ENG 202"], status: "active" },
  { id: 3, name: "ผศ. ดร. วิชัย เน็ตเวิร์ก", email: "wichai@ruts.ac.th", department: "วิศวกรรมคอมพิวเตอร์", courses: ["NET-ENG 401"], status: "inactive" },
];

const MOCK_STUDENTS = [
  { id: 1, code: "65010001", name: "สมชาย เรียนดี", email: "65010001@student.ruts.ac.th", group: 1, year: 3, status: "active" },
  { id: 2, code: "65010002", name: "สมหญิง ขยันมาก", email: "65010002@student.ruts.ac.th", group: 1, year: 3, status: "active" },
  { id: 3, code: "65010003", name: "วิชัย เก่งมาก", email: "65010003@student.ruts.ac.th", group: 2, year: 3, status: "active" },
  { id: 4, code: "65010004", name: "สุดา รักการเรียน", email: "65010004@student.ruts.ac.th", group: 2, year: 3, status: "active" },
  { id: 5, code: "65010005", name: "มานะ เน็ตเวิร์ค", email: "65010005@student.ruts.ac.th", group: 3, year: 3, status: "active" },
  { id: 6, code: "65010006", name: "มานี พัคเก็ต", email: "65010006@student.ruts.ac.th", group: 3, year: 3, status: "inactive" },
];

const MOCK_GROUPS = [
  { id: 1, name: "กลุ่ม 1 - Network Design", instructor: "อาจารย์ สมชาย ใจดี", students: 2, project: "Enterprise Network" },
  { id: 2, name: "กลุ่ม 2 - Security", instructor: "อาจารย์ สuda รักเรียน", students: 2, project: "Firewall Configuration" },
  { id: 3, name: "กลุ่ม 3 - Monitoring", instructor: "ผศ. ดร. วิชัย เน็ตเวิร์ก", students: 2, project: "Grafana Dashboard" },
];

const MOCK_ASSESSMENTS = [
  { id: 1, name: "Lab 1-5: Network Configuration", weight: 20, type: "lab", week: "1-5", maxScore: 100 },
  { id: 2, name: "Lab 6-9: Programming & Automation", weight: 20, type: "lab", week: "6-9", maxScore: 100 },
  { id: 3, name: "Lab 3, 10-14: Analysis & Testing", weight: 15, type: "lab", week: "3,10-14", maxScore: 100 },
  { id: 4, name: "Lab Reports & Assignments", weight: 10, type: "report", week: "1-14", maxScore: 100 },
  { id: 5, name: "Integrated Project", weight: 15, type: "project", week: "15", maxScore: 100 },
  { id: 6, name: "Final Examination", weight: 20, type: "exam", week: "16", maxScore: 100 },
];

const MOCK_GRADES = [
  { studentId: 1, studentName: "สมชาย เรียนดี", group: 1, lab1: 85, lab2: 90, lab3: 88, report: 92, project: 87, exam: 78, total: 86.2, grade: "A" },
  { studentId: 2, studentName: "สมหญิง ขยันมาก", group: 1, lab1: 92, lab2: 95, lab3: 90, report: 94, project: 91, exam: 85, total: 91.4, grade: "A" },
  { studentId: 3, studentName: "วิชัย เก่งมาก", group: 2, lab1: 78, lab2: 82, lab3: 80, report: 85, project: 83, exam: 75, total: 80.5, grade: "B+" },
  { studentId: 4, studentName: "สุดา รักการเรียน", group: 2, lab1: 88, lab2: 85, lab3: 87, report: 90, project: 88, exam: 82, total: 86.6, grade: "A" },
  { studentId: 5, studentName: "มานะ เน็ตเวิร์ค", group: 3, lab1: 70, lab2: 75, lab3: 72, report: 78, project: 76, exam: 68, total: 72.8, grade: "C+" },
  { studentId: 6, studentName: "มานี พัคเก็ต", group: 3, lab1: 65, lab2: 70, lab3: 68, report: 72, project: 70, exam: 60, total: 67.2, grade: "C" },
];

const GRADE_SCALE = [
  { min: 80, max: 100, grade: "A", color: "#3fb950" },
  { min: 75, max: 79, grade: "B+", color: "#5bb8ff" },
  { min: 70, max: 74, grade: "B", color: "#6cc8ff" },
  { min: 65, max: 69, grade: "C+", color: "#7dd8ff" },
  { min: 60, max: 64, grade: "C", color: "#8ee8ff" },
  { min: 55, max: 59, grade: "D+", color: "#e3b341" },
  { min: 50, max: 54, grade: "D", color: "#d29922" },
  { min: 0, max: 49, grade: "F", color: "#f85149" },
];

function calculateGrade(score) {
  const g = GRADE_SCALE.find((s) => score >= s.min && score <= s.max);
  return g ? g.grade : "F";
}

function getGradeColor(grade) {
  const g = GRADE_SCALE.find((s) => s.grade === grade);
  return g ? g.color : "#f85149";
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("instructors");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [instructors, setInstructors] = useState(MOCK_INSTRUCTORS);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [assessments, setAssessments] = useState(MOCK_ASSESSMENTS);
  const [grades, setGrades] = useState(MOCK_GRADES);

  const filteredInstructors = instructors.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase()) ||
    i.department.toLowerCase().includes(search.toLowerCase())
  );
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.instructor.toLowerCase().includes(search.toLowerCase()) ||
    g.project.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAssessments = assessments.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGrades = grades.filter((g) =>
    g.studentName.toLowerCase().includes(search.toLowerCase()) ||
    g.group.toString().includes(search)
  );

  const handleAdd = (tab) => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (tab, id) => {
    if (!confirm("ยืนยันการลบ?")) return;
    switch (tab) {
      case "instructors":
        setInstructors(instructors.filter((i) => i.id !== id));
        break;
      case "students":
        setStudents(students.filter((s) => s.id !== id));
        break;
      case "groups":
        setGroups(groups.filter((g) => g.id !== id));
        break;
      case "assessments":
        setAssessments(assessments.filter((a) => a.id !== id));
        break;
    }
  };

  const handleSave = (data) => {
    if (editingItem) {
      switch (activeTab) {
        case "instructors":
          setInstructors(instructors.map((i) => (i.id === editingItem.id ? { ...i, ...data } : i)));
          break;
        case "students":
          setStudents(students.map((s) => (s.id === editingItem.id ? { ...s, ...data } : s)));
          break;
        case "groups":
          setGroups(groups.map((g) => (g.id === editingItem.id ? { ...g, ...data } : g)));
          break;
        case "assessments":
          setAssessments(assessments.map((a) => (a.id === editingItem.id ? { ...a, ...data } : a)));
          break;
      }
    } else {
      const newId = Date.now();
      switch (activeTab) {
        case "instructors":
          setInstructors([...instructors, { ...data, id: newId }]);
          break;
        case "students":
          setStudents([...students, { ...data, id: newId }]);
          break;
        case "groups":
          setGroups([...groups, { ...data, id: newId }]);
          break;
        case "assessments":
          setAssessments([...assessments, { ...data, id: newId }]);
          break;
      }
    }
    setShowModal(false);
  };

  const handleGradeSave = (studentId, field, value) => {
    const numValue = parseFloat(value) || 0;
    setGrades(grades.map((g) => {
      if (g.studentId !== studentId) return g;
      const updated = { ...g, [field]: numValue };
      const total = (
        updated.lab1 * 0.20 +
        updated.lab2 * 0.20 +
        updated.lab3 * 0.15 +
        updated.report * 0.10 +
        updated.project * 0.15 +
        updated.exam * 0.20
      );
      return { ...updated, total: Math.round(total * 10) / 10, grade: calculateGrade(total) };
    }));
  };

  const exportGrades = () => {
    const headers = ["รหัสนักศึกษา", "ชื่อ", "กลุ่ม", "Lab 1-5 (20%)", "Lab 6-9 (20%)", "Lab 3,10-14 (15%)", "Reports (10%)", "Project (15%)", "Exam (20%)", "รวม", "เกรด"];
    const rows = grades.map((g) => {
      const s = students.find((st) => st.id === g.studentId);
      return [s?.code || "", g.studentName, g.group, g.lab1, g.lab2, g.lab3, g.report, g.project, g.exam, g.total, g.grade];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ModalForm = () => {
    if (!showModal) return null;
    const titles = {
      instructors: "ผู้สอน",
      students: "ผู้เรียน",
      groups: "กลุ่ม",
      assessments: "การประเมิน",
    };
    const fields = {
      instructors: [
        { key: "name", label: "ชื่อ-นามสกุล", type: "text", required: true },
        { key: "email", label: "อีเมล", type: "email", required: true },
        { key: "department", label: "ภาควิชา", type: "text", required: true },
        { key: "courses", label: "วิชาที่สอน (คั่นด้วยจุลภาค)", type: "text" },
        { key: "status", label: "สถานะ", type: "select", options: ["active", "inactive"] },
      ],
      students: [
        { key: "code", label: "รหัสนักศึกษา", type: "text", required: true },
        { key: "name", label: "ชื่อ-นามสกุล", type: "text", required: true },
        { key: "email", label: "อีเมล", type: "email", required: true },
        { key: "group", label: "กลุ่ม", type: "number", required: true, min: 1 },
        { key: "year", label: "ชั้นปี", type: "number", required: true, min: 1, max: 4 },
        { key: "status", label: "สถานะ", type: "select", options: ["active", "inactive"] },
      ],
      groups: [
        { key: "name", label: "ชื่อกลุ่ม", type: "text", required: true },
        { key: "instructor", label: "อาจารย์ที่ปรึกษา", type: "text", required: true },
        { key: "students", label: "จำนวนนักศึกษา", type: "number", required: true, min: 1 },
        { key: "project", label: "หัวข้อโปรเจกต์", type: "text" },
      ],
      assessments: [
        { key: "name", label: "ชื่อการประเมิน", type: "text", required: true },
        { key: "type", label: "ประเภท", type: "select", options: ["lab", "report", "project", "exam"] },
        { key: "weight", label: "น้ำหนัก (%)", type: "number", required: true, min: 0, max: 100 },
        { key: "week", label: "เรื่อง", type: "text" },
        { key: "maxScore", label: "คะแนนเต็ม", type: "number", required: true },
      ],
    };

    const currentFields = fields[activeTab] || [];
    const values = editingItem || {};

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingItem ? "แก้ไข" : "เพิ่ม"}{titles[activeTab]}</h3>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target); const data = {}; formData.forEach((v, k) => { data[k] = (v.includes(",") && k === "courses") ? v.split(",").map((s) => s.trim()) : (k === "weight" || k === "group" || k === "year" || k === "maxScore") ? parseFloat(v) : v; }); handleSave(data); }}>
            {currentFields.map((f) => (
              <div key={f.key} className="form-group">
                <label>{f.label}{f.required && <span className="required">*</span>}</label>
                {f.type === "select" ? (
                  <select name={f.key} defaultValue={values[f.key] || f.options?.[0]} required={f.required}>
                    {f.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    name={f.key}
                    defaultValue={values[f.key] || ""}
                    required={f.required}
                    min={f.min}
                    max={f.max}
                    placeholder={f.label}
                  />
                )}
              </div>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button type="submit" className="btn primary">{editingItem ? "บันทึกการแก้ไข" : "เพิ่ม"}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="course admin-page">
      <header className="admin-header">
        <h1>🛠️ ระบบจัดการหลักสูตร NET-ENG</h1>
        <p>จัดการผู้สอน ผู้เรียน กลุ่ม การประเมิน เก็บคะแนน และผลการเรียน</p>
      </header>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab${activeTab === tab.id ? " active" : ""}`}
            onClick={() => { setActiveTab(tab.id); setSearch(""); }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="ค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn primary" onClick={() => handleAdd(activeTab)}>
          ➕ เพิ่ม{TABS.find((t) => t.id === activeTab)?.label}
        </button>
      </div>

      {activeTab === "instructors" && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อ-นามสกุล</th>
                <th>อีเมล</th>
                <th>ภาควิชา</th>
                <th>วิชาที่สอน</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.map((i) => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td>{i.name}</td>
                  <td>{i.email}</td>
                  <td>{i.department}</td>
                  <td>{Array.isArray(i.courses) ? i.courses.join(", ") : i.courses}</td>
                  <td><span className={`status-badge${i.status === "active" ? " active" : " inactive"}`}>{i.status === "active" ? "ใช้งาน" : "ยกเลิก"}</span></td>
                  <td className="actions">
                    <button className="btn-icon" onClick={() => handleEdit(i)} title="แก้ไข">✏️</button>
                    <button className="btn-icon danger" onClick={() => handleDelete("instructors", i.id)} title="ลบ">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "students" && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>รหัสนักศึกษา</th>
                <th>ชื่อ-นามสกุล</th>
                <th>อีเมล</th>
                <th>กลุ่ม</th>
                <th>ชั้นปี</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td className="mono">{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td><span className="group-badge">กลุ่ม {s.group}</span></td>
                  <td>{s.year}</td>
                  <td><span className={`status-badge${s.status === "active" ? " active" : " inactive"}`}>{s.status === "active" ? "ปกติ" : "หยุดชั่วคราว"}</span></td>
                  <td className="actions">
                    <button className="btn-icon" onClick={() => handleEdit(s)} title="แก้ไข">✏️</button>
                    <button className="btn-icon danger" onClick={() => handleDelete("students", s.id)} title="ลบ">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "groups" && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อกลุ่ม</th>
                <th>อาจารย์ที่ปรึกษา</th>
                <th>จำนวนนักศึกษา</th>
                <th>หัวข้อโปรเจกต์</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((g) => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td>{g.name}</td>
                  <td>{g.instructor}</td>
                  <td>{g.students} คน</td>
                  <td>{g.project}</td>
                  <td className="actions">
                    <button className="btn-icon" onClick={() => handleEdit(g)} title="แก้ไข">✏️</button>
                    <button className="btn-icon danger" onClick={() => handleDelete("groups", g.id)} title="ลบ">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "assessments" && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อการประเมิน</th>
                <th>ประเภท</th>
                <th>น้ำหนัก (%)</th>
                <th>เรื่อง</th>
                <th>คะแนนเต็ม</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.name}</td>
                  <td><span className="type-badge">{a.type}</span></td>
                  <td>{a.weight}%</td>
                  <td>{a.week}</td>
                  <td>{a.maxScore}</td>
                  <td className="actions">
                    <button className="btn-icon" onClick={() => handleEdit(a)} title="แก้ไข">✏️</button>
                    <button className="btn-icon danger" onClick={() => handleDelete("assessments", a.id)} title="ลบ">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="weight-summary">
            น้ำหนักรวม: {assessments.reduce((sum, a) => sum + a.weight, 0)}%
          </div>
        </div>
      )}

      {activeTab === "grading" && (
        <div className="grading-section">
          <div className="grading-toolbar">
            <h3>บันทึกคะแนนนักศึกษา</h3>
            <button className="btn primary" onClick={exportGrades}>📥 ส่งออก CSV</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table grading-table">
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ</th>
                  <th>กลุ่ม</th>
                  <th>Lab 1-5<br/><small>(20%)</small></th>
                  <th>Lab 6-9<br/><small>(20%)</small></th>
                  <th>Lab 3,10-14<br/><small>(15%)</small></th>
                  <th>Reports<br/><small>(10%)</small></th>
                  <th>Project<br/><small>(15%)</small></th>
                  <th>Exam<br/><small>(20%)</small></th>
                  <th>รวม</th>
                  <th>เกรด</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((g) => (
                  <tr key={g.studentId}>
                    <td className="mono">{students.find((s) => s.id === g.studentId)?.code || ""}</td>
                    <td>{g.studentName}</td>
                    <td><span className="group-badge">กลุ่ม {g.group}</span></td>
                    <td><input type="number" min="0" max="100" step="0.5" value={g.lab1} onChange={(e) => handleGradeSave(g.studentId, "lab1", e.target.value)} className="grade-input" /></td>
                    <td><input type="number" min="0" max="100" step="0.5" value={g.lab2} onChange={(e) => handleGradeSave(g.studentId, "lab2", e.target.value)} className="grade-input" /></td>
                    <td><input type="number" min="0" max="100" step="0.5" value={g.lab3} onChange={(e) => handleGradeSave(g.studentId, "lab3", e.target.value)} className="grade-input" /></td>
                    <td><input type="number" min="0" max="100" step="0.5" value={g.report} onChange={(e) => handleGradeSave(g.studentId, "report", e.target.value)} className="grade-input" /></td>
                    <td><input type="number" min="0" max="100" step="0.5" value={g.project} onChange={(e) => handleGradeSave(g.studentId, "project", e.target.value)} className="grade-input" /></td>
                    <td><input type="number" min="0" max="100" step="0.5" value={g.exam} onChange={(e) => handleGradeSave(g.studentId, "exam", e.target.value)} className="grade-input" /></td>
                    <td className="total-score">{g.total}</td>
                    <td><span className="grade-badge" style={{background: getGradeColor(g.grade)}}>
                      {g.grade}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "results" && (
        <div className="results-section">
          <div className="results-summary">
            <div className="summary-card">
              <h4>สถิติโดยรวม</h4>
              <div className="summary-stats">
                <div className="stat"><span className="stat-value">{students.filter(s => s.status === "active").length}</span><span className="stat-label">นักศึกษาทั้งหมด</span></div>
                <div className="stat"><span className="stat-value">{groups.length}</span><span className="stat-label">กลุ่มโปรเจกต์</span></div>
                <div className="stat"><span className="stat-value">{grades.filter(g => g.grade === "A").length}</span><span className="stat-label">ได้เกรด A</span></div>
                <div className="stat"><span className="stat-value">{Math.round(grades.reduce((sum, g) => sum + g.total, 0) / grades.length * 10) / 10}</span><span className="stat-label">คะแนนเฉลี่ย</span></div>
              </div>
            </div>
            <div className="summary-card">
              <h4>การกระจายเกรด</h4>
              <div className="grade-distribution">
                {GRADE_SCALE.slice().reverse().map((gs) => {
                  const count = grades.filter((g) => g.grade === gs.grade).length;
                  const pct = grades.length > 0 ? Math.round(count / grades.length * 100) : 0;
                  return (
                    <div key={gs.grade} className="grade-bar">
                      <span className="grade-label" style={{background: gs.color}}>{gs.grade}</span>
                      <div className="grade-bar-track">
                        <div className="grade-bar-fill" style={{width: `${pct}%`, background: gs.color}}></div>
                      </div>
                      <span className="grade-count">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="results-table-wrap">
            <h3>รายชื่อผลการเรียน</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>กลุ่ม</th>
                  <th>คะแนนรวม</th>
                  <th>เกรด</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {[...filteredGrades].sort((a, b) => b.total - a.total).map((g, idx) => (
                  <tr key={g.studentId}>
                    <td>{idx + 1}</td>
                    <td className="mono">{students.find((s) => s.id === g.studentId)?.code || ""}</td>
                    <td>{g.studentName}</td>
                    <td><span className="group-badge">กลุ่ม {g.group}</span></td>
                    <td className="total-score">{g.total}</td>
                    <td><span className="grade-badge" style={{background: getGradeColor(g.grade)}}>{g.grade}</span></td>
                    <td><span className={`status-badge${g.total >= 50 ? " active" : " inactive"}`}>{g.total >= 50 ? "ผ่าน" : "ไม่ผ่าน"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ModalForm />
    </div>
  );
}