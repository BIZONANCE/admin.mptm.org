import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://admin-mptm-org.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "महाराष्ट्र प्रांतिक तैलिक महासभा-अमरावती विभाग, अमरावती | Admin Dashboard",
  description: "महाराष्ट्र प्रांतिक तैलिक महासभा - अमरावती विभाग (अमरावती) अधिकृत प्रशासक डॅशबोर्ड. सर्व सदस्य नोंदणी फॉर्म डेटा, शुल्क संकलन व अहवाल व्यवस्थापन.",
  keywords: [
    "महाराष्ट्र प्रांतिक तैलिक महासभा",
    "अमरावती विभाग",
    "अमरावती",
    "तैलिक महासभा नोंदणी",
    "जय संताजी",
    "Admin Dashboard",
    "Member Registration",
  ],
  authors: [{ name: "MPTM Amravati" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/mptm.png",
  },
  openGraph: {
    title: "महाराष्ट्र प्रांतिक तैलिक महासभा-अमरावती विभाग, अमरावती | Admin Dashboard",
    description: "महाराष्ट्र प्रांतिक तैलिक महासभा - अमरावती विभाग अधिकृत प्रशासक डॅशबोर्ड",
    siteName: "MPTM Amravati Admin Dashboard",
    images: [
      {
        url: `${siteUrl}/Share.jpeg`,
        width: 800,
        height: 600,
        alt: "MPTM Amravati Share Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "महाराष्ट्र प्रांतिक तैलिक महासभा-अमरावती विभाग | Admin Dashboard",
    description: "महाराष्ट्र प्रांतिक तैलिक महासभा - अमरावती विभाग अधिकृत प्रशासक डॅशबोर्ड",
    images: [`${siteUrl}/Share.jpeg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mr"
      className={`${jakarta.variable} ${geistSans.variable} ${geistMono.variable} ${devanagari.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/mptm.png" />
        <meta property="og:image" content={`${siteUrl}/Share.jpeg`} />
        <meta property="og:image:secure_url" content={`${siteUrl}/Share.jpeg`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
      </head>
      <body className={`${devanagari.className} min-h-full flex flex-col font-sans`}>{children}</body>
    </html>
  );
}
