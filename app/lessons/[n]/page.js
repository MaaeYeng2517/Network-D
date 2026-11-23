import Link from "next/link";
import { notFound } from "next/navigation";
import { WEEKS } from "@/lib/course-data";
import LessonSlides from "./LessonSlides";

export function generateStaticParams() {
  return WEEKS.map((w) => ({ n: String(w.n) }));
}

export const metadata = {
  title: "บทเรียน | Network Course",
};

export default async function LessonDetail({ params }) {
  const { n } = await params;
  const week = WEEKS.find((w) => w.n === Number(n));
  if (!week) notFound();

  const prev = WEEKS.find((w) => w.n === week.n - 1);
  const next = WEEKS.find((w) => w.n === week.n + 1);

  return (
    <div className="course lesson">
      <div className="crumbs">
        <Link href="/lessons">บทเรียน</Link>
        <span>/</span>
        <span>เรื่องที่ {week.n}</span>
      </div>

      <header className="lesson-head">
        <span className="n">เรื่องที่ {week.n}</span>
        <h1>{week.title}</h1>
        <div className="lesson-en">{week.titleEn}</div>
      </header>

      <LessonSlides week={week} prev={prev} next={next} />
    </div>
  );
}