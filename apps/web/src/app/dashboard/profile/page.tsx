"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { User as UserIcon, Shield, Trash2, ImageIcon, GripHorizontal, X } from "lucide-react";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop&q=80", // Hiker
  "https://images.unsplash.com/photo-1526772662000-3f88f107f5d8?w=400&h=400&fit=crop&q=80", // Climber
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=400&fit=crop&q=80", // Surfer
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=400&fit=crop&q=80", // Gear Check
  "https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?w=400&h=400&fit=crop&q=80", // Desert Hiker
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop&q=80", // Winter/Snow
  "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&h=400&fit=crop&q=80", // Camping/Nature
  "https://images.unsplash.com/photo-1534067783741-512d691f612d?w=400&h=400&fit=crop&q=80", // Waterfall/Explorer
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [avatarImageId, setAvatarImageId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<any>({});

  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [showPresets, setShowPresets] = useState(false); // Presets Modal
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickname(user.nickname || "");
      setBio(user.bio || "");
      setAge(user.age?.toString() || "");
      setGender(user.gender || "");
      setPhoneNumber(user.phoneNumber || "");
      setAddress(user.address || "");
      setAvatarImageId(user.avatarImage?.id || null);
      setAvatarUrl(user.avatarImage?.mediumUrl || null);
      setPreferences(user.preferences || {});
    }
  }, [user]);

  async function handleSave() {
    setIsLoading(true);
    try {
      const res = await apiFetch("/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nickname,
          bio,
          avatarImageId,
          age: age ? Number(age) : null,
          gender,
          phoneNumber,
          address,
          preferences,
        }),
      });
      if (res.ok) {
        await refreshUser(); // Update global auth context without reload
        alert("Profile updated successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as data URL for cropping
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setTempImageSrc(reader.result?.toString() || "");
      setShowCropper(true);
    });
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", croppedBlob, "avatar.webp"); // Upload as webp

    try {
      const res = await apiFetch("/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const imageData = data.data?.image || data.image; // Handle both wrapped and unwrapped
        if (imageData) {
          setAvatarImageId(imageData.id);
          setAvatarUrl(imageData.mediumUrl);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarImageId) return;
    setAvatarImageId(null);
    setAvatarUrl(null);
  };

  const handlePresetSelect = async (url: string) => {
    setShowPresets(false);
    setUploading(true);

    try {
      // Fetch the preset image and convert to Blob
      const response = await fetch(url);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "preset-avatar.jpg");

      const res = await apiFetch("/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const imageData = data.data?.image || data.image;
        if (imageData) {
          setAvatarImageId(imageData.id);
          setAvatarUrl(imageData.mediumUrl);
        }
      }
    } catch (error) {
      console.error("Failed to upload preset", error);
    } finally {
      setUploading(false);
    }
  };

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch("/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error || "Failed to change password");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-12 pb-20">
      {/* Cropper Modal */}
      {showCropper && tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCancel={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Presets Modal */}
      {showPresets && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="bg-background animate-in zoom-in-50 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl duration-300">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-bold">Choose an Avatar</h3>
              <button
                onClick={() => setShowPresets(false)}
                className="hover:bg-accent/10 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto p-6 sm:grid-cols-4">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  onClick={() => handlePresetSelect(url)}
                  className="group hover:border-accent focus:border-accent relative aspect-square overflow-hidden rounded-xl border-2 border-transparent transition-all hover:scale-105 focus:outline-none"
                >
                  <img src={url} alt={`Preset ${i}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        {/* Avatar Section */}
        <div className="space-y-4 md:col-span-4">
          <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
            Profile Photo
          </label>

          <div className="group relative h-40 w-40">
            <div
              className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-[40px] border-2 border-dashed border-[var(--border)] bg-[var(--border)]/30 transition-all ${uploading ? "opacity-50" : "group-hover:border-[var(--accent)]/50"} `}
            >
              {avatarUrl ? (
                <>
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={handleRemoveAvatar}
                      className="rounded-full bg-red-500/20 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                      title="Remove Photo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground/40 flex flex-col items-center justify-center">
                  <UserIcon size={48} strokeWidth={1.5} />
                  <span className="mt-2 text-xs font-bold tracking-widest uppercase">
                    {name ? name.substring(0, 2) : "??"}
                  </span>
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg)]/60 backdrop-blur-sm">
                  <Spinner size={32} />
                </div>
              )}
            </div>

            {/* Action Buttons Container */}
            <div className="absolute -right-4 -bottom-4 flex gap-2">
              <button
                onClick={() => setShowPresets(true)}
                className="bg-secondary text-secondary-foreground border-border flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border shadow-xl transition-transform hover:scale-110"
                title="Choose Preset"
              >
                <GripHorizontal size={18} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[var(--accent)]/30 shadow-xl transition-transform hover:scale-110"
                title="Upload Photo"
              >
                <ImageIcon size={18} />
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-start gap-1">
            <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Resizes to 400x400px
            </p>
            {/* Role Display */}
            {user?.roles && (
              <div className="mt-2 flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <div
                    key={role}
                    className="bg-accent/10 border-accent/20 text-accent flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
                  >
                    <Shield size={10} />
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-8 md:col-span-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="h-14 rounded-2xl border-[var(--border)] bg-[var(--card)]/50 text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                Nickname / Display Name
              </label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Johnny"
                className="h-14 rounded-2xl border-[var(--border)] bg-[var(--card)]/50 text-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                Age
              </label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="h-14 rounded-2xl border-[var(--border)] bg-[var(--card)]/50 text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                Gender
              </label>
              <Select
                value={gender}
                onChange={(val) => setGender(val)}
                placeholder="Select Gender"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                  { value: "Prefer not to say", label: "Prefer not to say" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                Phone Number
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-14 rounded-2xl border-[var(--border)] bg-[var(--card)]/50 text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                Address
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, Country"
                className="h-14 rounded-2xl border-[var(--border)] bg-[var(--card)]/50 text-lg font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
              Short Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your adventures..."
              className="min-h-[150px] w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 p-6 leading-relaxed font-medium transition-colors focus:border-[var(--accent)]/50 focus:outline-none"
            />
            <p className="text-muted-foreground text-right text-[10px] font-medium tracking-wider uppercase">
              {bio.length} / 250 characters
            </p>
          </div>

          {/* Notification Preferences */}
          <div className="border-t border-[var(--border)] pt-8">
            <h3 className="mb-6 flex items-center gap-3 text-xl font-bold tracking-tighter uppercase italic">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              Notification Preferences
            </h3>

            <div className="grid gap-4">
              {[
                {
                  key: "email_notifications",
                  label: "Email Alerts",
                  desc: "Get updates about bookings and payments via email.",
                },
                {
                  key: "realtime_notifs",
                  label: "Live Alerts",
                  desc: "Real-time toast notifications while using the platform.",
                },
                {
                  key: "marketing_emails",
                  label: "Marketing",
                  desc: "Occasional updates about new treks and offers.",
                },
              ].map((pref) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)]/30 p-4 transition-all hover:border-[var(--accent)]/30"
                >
                  <div>
                    <p className="text-sm font-bold tracking-tight">{pref.label}</p>
                    <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      {pref.desc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!preferences[pref.key]}
                    onChange={(e) => {
                      setPreferences({ ...preferences, [pref.key]: e.target.checked });
                    }}
                    className="h-5 w-5 cursor-pointer accent-[var(--accent)]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="border-t border-[var(--border)] pt-8">
            <h3 className="mb-6 flex items-center gap-3 text-xl font-bold tracking-tighter uppercase italic">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <Shield size={18} />
              </div>
              Security
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 rounded-2xl border-[var(--border)] bg-[var(--card)]/50"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="h-12 rounded-2xl border-[var(--border)] bg-[var(--card)]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground block text-[10px] font-black tracking-[0.2em] uppercase">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="h-12 rounded-2xl border-[var(--border)] bg-[var(--card)]/50"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="subtle"
                  loading={isLoading}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  className="h-10 text-xs font-bold tracking-wider uppercase"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>

          {/* Account Privacy */}
          <div className="border-t border-[var(--border)] pt-8">
            <h3 className="mb-6 flex items-center gap-3 text-xl font-bold tracking-tighter uppercase italic">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Shield size={18} />
              </div>
              Privacy & Data
            </h3>
            <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-6">
              <p className="text-sm leading-relaxed font-medium">
                Your data is encrypted and used only to facilitate your bookings. You can request a
                data export or account deactivation at any time.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="subtle"
                  className="h-8 border-blue-500/20 bg-blue-500/10 px-4 text-[10px] font-black tracking-widest text-blue-500 uppercase"
                >
                  Download My Data
                </Button>
                <Button
                  variant="ghost"
                  className="h-8 px-4 text-[10px] font-black tracking-widest text-red-400 uppercase hover:text-red-500"
                >
                  Deactivate Account
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-8">
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isLoading}
              className="h-14 rounded-2xl px-12 shadow-[var(--accent)]/20 shadow-2xl"
            >
              Update Preferences & Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


