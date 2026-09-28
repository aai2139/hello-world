"use client";

import { createClient } from "@/lib/supabase";

export default function LoginButton() {
    const supabase = createClient();

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <button onClick={handleLogin}>
            Continue with Google
        </button>
    );
}