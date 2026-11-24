"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    if (result === true) {
      router.push("/");
      router.refresh();
    } else {
      setError(result);
    }
    setLoading(false);
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="hd">
          <img src="/logo.svg" alt="" className="login-logo" />
          <div>
            <div className="login-title">Network-D</div>
            <div className="login-subtitle">แบบจำลองการเรียนรู้ระบบเครือข่ายคอมพิวเตอร์</div>
          </div>
        </div>
        <div className="bd">
          <form onSubmit={handleSubmit}>
            <label className="f" htmlFor="username">ชื่อผู้ใช้</label>
            <input
              className="login-input"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />

            <label className="f" htmlFor="password">รหัสผ่าน</label>
            <input
              className="login-input"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />

            <button type="submit" className="login-btn primary" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
          {error && <div className="login-error show">{error}</div>}
          <div className="login-hint">student / student</div>
        </div>
      </div>
    </div>
  );
}