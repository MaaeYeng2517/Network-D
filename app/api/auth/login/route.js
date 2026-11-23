import { NextResponse } from "next/server";

const AUTH_USER = process.env.AUTH_USER || "admin";
const AUTH_PASS_HASH = process.env.AUTH_PASS_HASH;
let AUTH_PASS_HASH_CACHE = AUTH_PASS_HASH;
if (!AUTH_PASS_HASH_CACHE) {
  const crypto = require("node:crypto");
  const defaultPass = process.env.AUTH_PASS || "changeme";
  AUTH_PASS_HASH_CACHE = crypto.createHash("sha256").update(defaultPass).digest("hex");
}

function verifyPassword(password) {
  const crypto = require("node:crypto");
  return crypto.createHash("sha256").update(password).digest("hex") === AUTH_PASS_HASH_CACHE;
}

function createSession(username) {
  const crypto = require("node:crypto");
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const { username, password } = data;
  const validUsers = {
    admin: process.env.AUTH_PASS || "changeme",
    student: "student",
  };
  if (validUsers[username] && password === validUsers[username]) {
    const token = createSession(username);
    const res = NextResponse.json({ success: true, username });
    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
}