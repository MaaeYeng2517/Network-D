"use client";

import { useEffect, useRef } from "react";

function niceMax(v) {
  if (!isFinite(v) || v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * exp;
}
function fmtRate(mbps) {
  if (mbps >= 1000) return (mbps / 1000).toFixed(2) + " Gbps";
  if (mbps >= 1) return mbps.toFixed(2) + " Mbps";
  return (mbps * 1000).toFixed(0) + " Kbps";
}
function fmtPps(v) {
  if (v >= 1000) return (v / 1000).toFixed(1) + "k";
  return String(Math.round(v));
}

export default function LineChart({ series, height = 260, unit = "rate", emptyText = "ไม่มีข้อมูล" }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = cv.getBoundingClientRect();
      const W = Math.max(rect.width, 220);
      const H = Math.max(rect.height, 120);
      cv.width = W * dpr;
      cv.height = H * dpr;
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const pts = series || [];
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.textBaseline = "middle";

      const padL = 56, padR = 16, padT = 14, padB = 28;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;

      if (pts.length === 0) {
        ctx.fillStyle = "#8b98a9";
        ctx.textAlign = "center";
        ctx.fillText(emptyText, W / 2, H / 2);
        return;
      }

      const maxY = niceMax(Math.max(...pts.map((p) => p.y)));
      const yTicks = 4;
      ctx.textAlign = "right";
      for (let i = 0; i <= yTicks; i++) {
        const val = (maxY * i) / yTicks;
        const y = padT + plotH - (plotH * i) / yTicks;
        ctx.strokeStyle = "#222c39";
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();
        ctx.fillStyle = "#8b98a9";
        let lbl;
        if (unit === "pps" || unit === "count") lbl = fmtPps(val);
        else if (unit === "ms") lbl = val.toFixed(val < 10 ? 1 : 0) + "ms";
        else lbl = maxY >= 1000 ? (val / 1000).toFixed(1) + "G" : val.toFixed(val < 10 ? 1 : 0) + "M";
        ctx.fillText(lbl, padL - 8, y);
      }

      const xs = pts.map((p) => p.x);
      let xmin = Math.min(...xs);
      let xmax = Math.max(...xs);
      if (xmax <= xmin) xmax = xmin + 1;
      const xOf = (x) => padL + ((x - xmin) / (xmax - xmin)) * plotW;
      const yOf = (v) => padT + plotH - (v / maxY) * plotH;

      ctx.textAlign = "center";
      for (let i = 0; i <= 4; i++) {
        const xv = xmin + ((xmax - xmin) * i) / 4;
        const x = xOf(xv);
        ctx.fillStyle = "#8b98a9";
        const lbl = unit === "rate" ? xv.toFixed(1) + "s" : Math.round(xv);
        ctx.fillText(lbl, x, H - padB + 14);
      }

      const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
      grad.addColorStop(0, "rgba(62,166,255,0.35)");
      grad.addColorStop(1, "rgba(62,166,255,0.02)");
      ctx.beginPath();
      ctx.moveTo(xOf(xs[0]), yOf(pts[0].y));
      for (let i = 1; i < pts.length; i++) ctx.lineTo(xOf(xs[i]), yOf(pts[i].y));
      ctx.lineTo(xOf(xs[xs.length - 1]), padT + plotH);
      ctx.lineTo(xOf(xs[0]), padT + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(xOf(xs[0]), yOf(pts[0].y));
      for (let i = 1; i < pts.length; i++) ctx.lineTo(xOf(xs[i]), yOf(pts[i].y));
      ctx.strokeStyle = "#3ea6ff";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      const lx = xOf(xs[xs.length - 1]);
      const ly = yOf(pts[pts.length - 1].y);
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#3ea6ff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(62,166,255,0.4)";
      ctx.stroke();

      ctx.fillStyle = "#e6edf3";
      ctx.textAlign = "right";
      const cur = pts[pts.length - 1].y;
      const curLabel = unit === "rate" ? fmtRate(cur) : unit === "ms" ? cur.toFixed(1) + " ms" : Math.round(cur).toString();
      ctx.fillText(curLabel, W - padR, padT + 10);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(cv);
    return () => ro.disconnect();
  }, [series, height, unit, emptyText]);

  return <canvas ref={ref} style={{ width: "100%", height, display: "block" }} />;
}