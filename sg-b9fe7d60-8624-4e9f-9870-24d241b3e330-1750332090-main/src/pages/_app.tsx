import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AuthProvider from "@/contexts/AuthContext"; // Changed to default import
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>2PC Investor Data</title>
        <meta name="description" content="Manage your investor data efficiently." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
