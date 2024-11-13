import "../globals.css";

export const metadata = {
  title: "ARGOCHAIN SCANNER",
  description: "Argochain Scanner allows you to explore and search the argochain for transactions, addresses, tokens, prices and other activities taking place on Argochain",
  image: "https://storage-devolvedai.s3.amazonaws.com/web-app/thumbnail/thumbnail_banner.jpeg",
  url: "https://indexing.devolvedai.com/",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}