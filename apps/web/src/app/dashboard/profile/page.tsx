"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarImageId, setAvatarImageId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatarImageId(user.avatarImage?.id || null);
      setAvatarUrl(user.avatarImage?.mediumUrl || null);
    }
  }, [user]);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await apiFetch("/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatarImageId }),
      });
      if (res.ok) {
        alert("Profile updated successfully!");
        // Note: In a real app we'd refresh the auth context user
        window.location.reload(); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarImageId(data.image.id);
        setAvatarUrl(data.image.mediumUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Avatar Section */}
        <div className="md:col-span-4 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">
            Profile Photo
          </label>
          <div className="relative group w-40 h-40">
            <div className={`
              w-full h-full rounded-[40px] overflow-hidden bg-[var(--border)]/30 border-2 border-dashed border-[var(--border)] flex items-center justify-center transition-all
              ${uploading ? "opacity-50" : "group-hover:border-[var(--accent)]/50"}
            `}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
              
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/60 backdrop-blur-sm">
                  <Spinner size={32} />
                </div>
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-xl shadow-[var(--accent)]/30 hover:scale-110 transition-transform cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*" 
            onChange={handleAvatarUpload} 
          />
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            JPG or PNG. Max 2MB.
          </p>
        </div>

        {/* Info Section */}
        <div className="md:col-span-8 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">
              Full Name
            </label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-[var(--card)]/50 border-[var(--border)] rounded-2xl h-14 font-bold text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">
              Short Bio
            </label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your adventures..."
              className="w-full min-h-[150px] p-6 rounded-3xl bg-[var(--card)]/50 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors font-medium leading-relaxed resize-none"
            />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-right">
              {bio.length} / 250 characters
            </p>
          </div>

          <div className="pt-4">
            <Button 
              variant="primary" 
              onClick={handleSave} 
              loading={loading}
              className="px-12 h-14 rounded-2xl shadow-2xl shadow-[var(--accent)]/20"
            >
              Update Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
