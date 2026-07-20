import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "雀影连连｜麻将连连看",
  description: "现代国风麻将连连看游戏，挑战五重渐进关卡。",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
