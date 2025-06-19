
import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "@/components/Layout/Sidebar";
import SettingsPage from "@/components/Dashboard/SettingsPage";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export default function SettingsPageRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
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
        <title>Settings - 2PC Investor Dashboard</title>
        <meta name="description" content="Configure your investment management settings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <SettingsPage />
        </main>
      </div>
      <Toaster />
    </>
  );
}
