import "../../globals.css";

export const metadata = {
  title: "Network-D สำหรับการเรียนรู้",
};

export default function AuthLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body>{children}</body>
    </html>
  );
}