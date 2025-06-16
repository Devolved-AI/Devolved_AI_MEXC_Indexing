import Footer from "../components/Footer";
import Header from "../components/Header";
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
  url: "https://test-scanner.devolvedai.com/",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}