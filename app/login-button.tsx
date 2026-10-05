"use client";

import { createClient } from "@/lib/supabase";

export default function LoginButton({ nextPath = "/" }: { nextPath?: string }) {
    const supabase = createClient();

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            },
        });
    };

    return (
        <button className="google-button" onClick={handleLogin}>
            <span className="google-g" aria-hidden="true">G</span>
            Continue with Google
        </button>
    );
}
