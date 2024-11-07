import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const inter = Inter({ subsets: ["latin"] });

interface Metadata {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export const metadata: Metadata = {
  title: "ARGOCHAIN SCANNER",
  description: "Argochain Scanner allows you to explore and search the argochain for transactions, addresses, tokens, prices and other activities taking place on Argochain",
  image: "https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg",
  url: "https://indexing.devolvedai.com/",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Primary Meta Tags */}
        <meta name="title" content="ARGOCHAIN SCANNER" />
        <meta name="description" content="Argochain Scanner allows you to explore and search the argochain for transactions, addresses, tokens, prices and other activities taking place on Argochain" />
        <meta name="image" content="https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://indexing.devolvedai.com/" />
        <meta property="og:site_name" content="ARGOCHAIN SCANNER" />
        <meta property="og:title" content="ARGOCHAIN SCANNER" />
        <meta property="og:description" content="Argochain Scanner allows you to explore and search the argochain for transactions, addresses, tokens, prices and other activities taking place on Argochain" />
        <meta property="og:image" content="https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://indexing.devolvedai.com/" />
        <meta name="twitter:creator" content="Devolved AI" />
        <meta property="twitter:title" content="ARGOCHAIN SCANNER" />
        <meta property="twitter:description" content="Argochain Scanner allows you to explore and search the argochain for transactions, addresses, tokens, prices and other activities taking place on Argochain" />
        <meta property="twitter:image" content="https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg" />
      </head>
      <body className={inter.className}>
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
