"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type ProfileFormProps = {
  userId: string;
  initialFirstName: string;
  initialLastName: string;
  initialAvatarUrl: string;
};

export default function ProfileForm({
  userId,
  initialFirstName,
  initialLastName,
  initialAvatarUrl,
}: ProfileFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setMessage("Choose an image smaller than 5 MB.");
      return;
    }

    setUploading(true);
    setMessage("");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      setMessage("The image could not be uploaded.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, avatar_url: publicUrl }, { onConflict: "id" });

    if (error) {
      setMessage("The image uploaded, but the profile could not be updated.");
    } else {
      setAvatarUrl(publicUrl);
      setMessage("Profile picture updated.");
    }
    setUploading(false);
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        first_name: firstName.trim().slice(0, 80),
        last_name: lastName.trim().slice(0, 80),
      },
      { onConflict: "id" },
    );
    setMessage(error ? "The profile could not be saved." : "Profile saved.");
    setSaving(false);
  }

  return (
    <div>
      <div className="profile-avatar">
        {avatarUrl ? (
          // Supabase hostnames vary by project, so a normal image preserves existing avatar URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Your profile avatar" />
        ) : (
          <span aria-hidden="true">NY</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="avatar">Profile picture</label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadAvatar(file);
          }}
        />
        <p className="field-hint">JPG, PNG, GIF, or WebP up to 5 MB.</p>
      </div>

      <div className="profile-name-grid">
        <div className="form-group">
          <label htmlFor="first-name">First name</label>
          <input id="first-name" value={firstName} maxLength={80} onChange={(event) => setFirstName(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="last-name">Last name</label>
          <input id="last-name" value={lastName} maxLength={80} onChange={(event) => setLastName(event.target.value)} />
        </div>
      </div>

      <button className="primary-button" type="button" disabled={saving || uploading} onClick={saveProfile}>
        {saving ? "Saving…" : "Save profile"}
      </button>
      {message && <p className="form-message" role="status">{message}</p>}
    </div>
  );
}
