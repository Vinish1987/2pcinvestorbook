import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "@/components/Layout/Sidebar";
import DashboardPage from "@/components/Dashboard/DashboardPage";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !router.asPath.includes("#login")) {
      // Intentionally no redirect here, LoginForm is shown below
    } else if (!loading && user && router.asPath.includes("#login")) {
      router.push("/"); 
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <>
      <Head>
        <title>2PC Investor Dashboard</title>
        <meta name="description" content="Manage your investments with 2PC Investor Data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <DashboardPage />
        </main>
      </div>
      <Toaster />
    </>
  );
}
