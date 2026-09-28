"use client";

import LoginButton from "@/app/login-button";

export default function LoginPage() {
    return (
        <main className="page">
            <div className="card">
                <h1>Welcome to TaskFlow</h1>
                <p className="subtitle">
                    Sign in to access your profile and dashboard.
                </p>

                <LoginButton />
            </div>
        </main>
    );
}