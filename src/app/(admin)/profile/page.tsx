"use client";

import { Camera, KeyRound, UserRound } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { changeMyPassword } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/http";
import { useAuthStore } from "@/lib/store/auth-store";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    refreshMe().catch(() => {
      /* keep cached user if refresh fails briefly */
    });
  }, [refreshMe]);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.name, user?.phone]);

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onAvatarChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      await updateProfile(form);
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await changeMyPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Update your photo, contact details, and password."
      />

      <Card className="p-5">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.name || "Profile"}
                className="h-24 w-24 rounded-2xl object-cover ring-1 ring-line"
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl text-2xl font-extrabold text-white"
                style={{ background: "linear-gradient(135deg, #4F46E5, #0EA5E9)" }}
              >
                {user?.avatar_initial ?? "?"}
              </div>
            )}
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-line bg-white text-primary-700 shadow-sm transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Upload photo"
              title="Upload photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onAvatarChange(e.target.files?.[0])}
            />
          </div>
          <div>
            <p className="text-lg font-extrabold text-ink">{user?.name || "Staff"}</p>
            <p className="text-sm text-muted">{user?.email}</p>
            <p className="mt-2 text-xs font-medium text-slate-400">
              {uploading ? "Uploading photo…" : "JPG or PNG · click the camera icon to change"}
            </p>
          </div>
        </div>
      </Card>

      <Card flush>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary-600" />
              Profile details
            </span>
          }
          description="Name and phone are visible to your team in the admin panel."
        />
        <form onSubmit={onSaveProfile} className="space-y-4 p-5">
          <label className="block">
            <span className="ui-label">Email</span>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              placeholder="you@bresomilan.com"
              className="ui-input cursor-not-allowed bg-slate-50 text-muted"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="ui-label">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="ui-input"
              />
            </label>
            <label className="block">
              <span className="ui-label">Phone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 017XXXXXXXX"
                className="ui-input"
              />
            </label>
          </div>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save details"}
          </Button>
        </form>
      </Card>

      <Card flush>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary-600" />
              Change password
            </span>
          }
          description="Use a strong password you do not reuse elsewhere."
        />
        <form onSubmit={onChangePassword} className="space-y-4 p-5">
          <label className="block">
            <span className="ui-label">Current password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="ui-input"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="ui-label">New password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="ui-input"
              />
            </label>
            <label className="block">
              <span className="ui-label">Confirm new password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="ui-input"
              />
            </label>
          </div>
          <Button type="submit" variant="secondary" disabled={savingPassword}>
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
