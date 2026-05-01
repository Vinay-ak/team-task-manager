import "./globals.css";

export const metadata = {
  title: "Team Task Manager",
  description: "A MERN stack team task management app"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
