"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState(""); 
  const [bio, setBio] = useState("");
  const [avatarImageId, setAvatarImageId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [showPresets, setShowPresets] = useState(false); // Presets Modal
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickname(user.nickname || ""); // Sync Nickname
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
        body: JSON.stringify({ name, nickname, bio, avatarImageId }), // Added nickname
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
        setAvatarImageId(data.image.id);
        setAvatarUrl(data.image.mediumUrl);
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
    // Note: We don't delete from DB immediately, just unlink on save. 
    // Or we could unlink immediately if desired. 
    // For now, let's just clear state and let "Update Profile" persist it.
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
            setAvatarImageId(data.image.id);
            setAvatarUrl(data.image.mediumUrl);
        }
    } catch (error) {
        console.error("Failed to upload preset", error);
    } finally {
        setUploading(false);
    }
  };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-50 duration-300">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-bold">Choose an Avatar</h3>
                    <button onClick={() => setShowPresets(false)} className="p-2 hover:bg-accent/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PRESET_AVATARS.map((url, i) => (
                        <button 
                            key={i}
                            onClick={() => handlePresetSelect(url)}
                            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-accent focus:outline-none focus:border-accent transition-all hover:scale-105"
                        >
                            <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Avatar Section */}
        <div className="md:col-span-4 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">
            Profile Photo
          </label>

          <div className="relative group w-40 h-40">
            <div className={`
              w-full h-full rounded-[40px] overflow-hidden bg-[var(--border)]/30 border-2 border-dashed border-[var(--border)] flex items-center justify-center transition-all relative
              ${uploading ? "opacity-50" : "group-hover:border-[var(--accent)]/50"}
            `}>
              {avatarUrl ? (
                <>
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                         <button 
                            onClick={handleRemoveAvatar}
                            className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                            title="Remove Photo"
                         >
                             <Trash2 size={18} />
                         </button>
                    </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                    <UserIcon size={48} strokeWidth={1.5} />
                    <span className="text-xs font-bold mt-2 uppercase tracking-widest">{name ? name.substring(0,2) : "??"}</span>
                </div>
              )}
              
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/60 backdrop-blur-sm z-20">
                  <Spinner size={32} />
                </div>
              )}
            </div>
            
            {/* Action Buttons Container */}
            <div className="absolute -bottom-4 -right-4 flex gap-2">
                <button 
                onClick={() => setShowPresets(true)}
                className="w-10 h-10 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer border border-border"
                title="Choose Preset"
                >
                <GripHorizontal size={18} />
                </button>
                <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-xl shadow-[var(--accent)]/30 hover:scale-110 transition-transform cursor-pointer"
                title="Upload Photo"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
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
          <div className="flex flex-col gap-1 items-start">
             <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Resizes to 400x400px
            </p>
             {/* Role Display */}
             {user?.roles && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {user.roles.map(role => (
                        <div key={role} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                            <Shield size={10} />
                            {role}
                        </div>
                    ))}
                </div>
             )}
          </div>
        </div>

        {/* Info Section */}
        <div className="md:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">
                Full Name
                </label>
                <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="bg-[var(--card)]/50 border-[var(--border)] rounded-2xl h-14 font-bold text-lg"
                />
            </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">
                Nickname / Display Name
                </label>
                <Input 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Johnny"
                className="bg-[var(--card)]/50 border-[var(--border)] rounded-2xl h-14 font-bold text-lg"
                />
            </div>
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
