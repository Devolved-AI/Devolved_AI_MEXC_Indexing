import "../globals.css";

interface Metadata {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export const metadata: Metadata = {
  title: "ARGOCHAIN TEST SCANNER",
  description: "Argochain TEST Scanner allows you to explore and search the argochain TESTNET for transactions, addresses, tokens, prices and other activities taking place on Argochain TESTNET",
  image: "https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg",
  url: "https://scanner.argoscan.net/",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Primary Meta Tags */}
        <meta name="title" content="ARGOCHAIN TEST SCANNER" />
        <meta name="description" content="Argochain TEST Scanner allows you to explore and search the argochain TESTNET for transactions, addresses, tokens, prices and other activities taking place on Argochain TESTNET" />
        <meta name="image" content="https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://test-scanner.devolvedai.com" />
        <meta property="og:site_name" content="ARGOCHAIN TEST SCANNER" />
        <meta property="og:title" content="ARGOCHAIN TEST SCANNER" />
        <meta property="og:description" content="Argochain TEST Scanner allows you to explore and search the argochain TESTNET for transactions, addresses, tokens, prices and other activities taking place on Argochain TESTNET" />
        <meta property="og:image" content="https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://test-scanner.devolvedai.com" />
        <meta name="twitter:creator" content="Devolved AI" />
        <meta property="twitter:title" content="ARGOCHAIN TEST SCANNER" />
        <meta property="twitter:description" content="Argochain TEST Scanner allows you to explore and search the argochain TESTNET for transactions, addresses, tokens, prices and other activities taking place on Argochain TESTNET" />
        <meta property="twitter:image" content="https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg" />
      </head>
      <body>{children}</body>
    </html>
  )
}