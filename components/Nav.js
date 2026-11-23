"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { href: "/", label: "หน้าแรก", match: (p) => p === "/" },
  { href: "/lessons", label: "บทเรียน", match: (p) => p.startsWith("/lessons") },
  { href: "/practical", label: "ปฏิบัติการ", match: (p) => p.startsWith("/practical") },
  { href: "/assessment", label: "การประเมิน", match: (p) => p.startsWith("/assessment") },
  { href: "/topology", label: "ออกแบบเครือข่าย", match: (p) => p.startsWith("/topology") },
  { href: "/iperf", label: "iPerf3 Dashboard", match: (p) => p.startsWith("/iperf") },
  { href: "/tcpdump", label: "tcpdump", match: (p) => p.startsWith("/tcpdump") },
  { href: "/tshark", label: "tshark", match: (p) => p.startsWith("/tshark") },
  { href: "/traceroute", label: "Traceroute", match: (p) => p.startsWith("/traceroute") },
  { href: "/scapy", label: "Scapy", match: (p) => p.startsWith("/scapy") },
];

export default function Nav() {
  const p = usePathname();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
  }

  return (
    <nav className="nav">
      <button className="nav-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="เมนู">
        {open ? "✕" : "☰"}
      </button>
      <div className={`nav-links${open ? " open" : ""}`}>
        {LINKS.map((l) => (
          <Link key={l.href} className={l.match(p) ? "active" : ""} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
      </div>
      {user && (
        <div className="user-menu">
          <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-expanded={userMenuOpen}>
            <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
            <span className="user-name">{user.username}</span>
            <span className="caret">▼</span>
          </button>
          {userMenuOpen && (
            <div className="user-dropdown">
              <button className="dropdown-item" onClick={handleLogout}>ออกจากระบบ</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}