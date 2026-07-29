import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WargaJagaWarga - Tanggap Darurat untuk Komunitas yang Lebih Aman",
  description:
    "Satu sentuhan, Satpam dan tetanggamu datang. Sistem peringatan darurat komunitas perumahan yang langsung ke pokok masalah.",
  keywords: [
    "wargajagawarga",
    "keamanan klaster",
    "tombol darurat",
    "satpam",
    "tanggap darurat",
    "komunitas perumahan",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
