"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/app/logout-button";
import { createClient } from "@/lib/supabase";

export default function ProfilePage() {
    const supabase = createClient();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("first_name, last_name, avatar_url")
                .eq("id", user.id)
                .single();

            if (data) {
                setFirstName(data.first_name || "");
                setLastName(data.last_name || "");
                setAvatarUrl(data.avatar_url || "");
            }

            setLoading(false);
        }

        loadProfile();
    }, []);

    async function uploadAvatar(file: File) {
        setUploading(true);
        setMessage("");

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setMessage("You must be logged in.");
            setUploading(false);
            return;
        }

        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, {
                upsert: false,
            });

        if (uploadError) {
            setMessage("Error uploading image.");
            setUploading(false);
            return;
        }

        const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        const { error: updateError } = await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", user.id);

        if (updateError) {
            setMessage("Image uploaded, but profile could not be updated.");
        } else {
            setAvatarUrl(publicUrl);
            setMessage("Profile picture updated.");
        }

        setUploading(false);
    }

    async function saveProfile() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: firstName,
                last_name: lastName,
            })
            .eq("id", user.id);

        if (error) {
            setMessage("Error saving profile.");
        } else {
            setMessage("Profile saved successfully.");
        }
    }

    if (loading) {
        return <main className="page">Loading...</main>;
    }

    return (
        <>
            <nav className="navbar">
                <div className="logo">TaskFlow</div>

                <div className="nav-links">
                    <a href="/" className="nav-link">
                        Tasks
                    </a>
                    <a href="/profile" className="nav-link">
                        Profile
                    </a>
                    <a href="/dashboard" className="nav-link">
                        Dashboard
                    </a>
                    <LogoutButton />
                </div>

            </nav>

            <main className="page">
                <div className="card">
                    <h1>My Profile</h1>
                    <p className="subtitle">
                        Update your personal information.
                    </p>


                    {avatarUrl && (
                        <div className="avatar-preview">
                            <img src={avatarUrl} alt="Profile" />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Profile Picture</label>

                        <input
                            type="file"
                            accept="image/*"
                            disabled={uploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadAvatar(file);
                            }}
                        />

                        {uploading && <p className="message">Uploading...</p>}
                    </div>

                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                        />
                    </div>

                    <button className="primary-button" onClick={saveProfile}>
                        Save Profile
                    </button>

                    {message && <p className="message">{message}</p>}
                </div>
            </main>
        </>
    );
}

