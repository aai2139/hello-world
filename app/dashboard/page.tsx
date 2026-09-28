import { redirect } from "next/navigation";
import LogoutButton from "@/app/logout-button";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    return (
        <>
            <nav className="navbar">
                <div className="logo">TaskFlow</div>

                <div className="nav-links">
                    <a href="/">Tasks</a>
                    <a href="/profile">Profile</a>
                    <a href="/dashboard">Dashboard</a>
                    <LogoutButton />
                </div>


            </nav>


            <main className="page">
                <div className="card">
                    <h1>Private Dashboard</h1>
                    <p className="subtitle">
                        You can see this page because you are logged in.
                    </p>

                    <p>
                        Signed in as <strong>{user.email}</strong>
                    </p>
                </div>
            </main>
        </>
    );
}
