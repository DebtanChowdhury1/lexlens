'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Check, Save, User, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const AVATARS = [
  {
    id: 'violet-scale',
    label: 'Justice',
    bg: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <rect x="11.2" y="4" width="1.6" height="14" rx="0.8" fill="white" opacity="0.95" />
        <rect x="7" y="18" width="10" height="1.8" rx="0.9" fill="white" opacity="0.95" />
        <rect x="3" y="6.5" width="18" height="1.4" rx="0.7" fill="white" opacity="0.9" />
        <ellipse cx="5.8" cy="12" rx="2.8" ry="1.1" fill="white" opacity="0.9" />
        <ellipse cx="18.2" cy="12" rx="2.8" ry="1.1" fill="white" opacity="0.9" />
        <circle cx="12" cy="5" r="1.2" fill="white" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'blue-shield',
    label: 'Shield',
    bg: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7L12 3z" fill="white" opacity="0.9" />
        <path d="M9 12l2 2 4-4" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'emerald-star',
    label: 'Star',
    bg: 'linear-gradient(135deg, #065F46, #10B981)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'orange-bolt',
    label: 'Bolt',
    bg: 'linear-gradient(135deg, #92400E, #F59E0B)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H13L13 2z" fill="white" opacity="0.95" />
      </svg>
    ),
  },
  {
    id: 'rose-crown',
    label: 'Crown',
    bg: 'linear-gradient(135deg, #9F1239, #F43F5E)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M3 17h18v2H3v-2z" fill="white" opacity="0.7" />
        <path d="M3 17L5 9l4.5 4L12 5l2.5 8L19 9l2 8H3z" fill="white" opacity="0.95" />
        <circle cx="5" cy="9" r="1.2" fill="white" />
        <circle cx="12" cy="5" r="1.2" fill="white" />
        <circle cx="19" cy="9" r="1.2" fill="white" />
      </svg>
    ),
  },
  {
    id: 'cyan-atom',
    label: 'Atom',
    bg: 'linear-gradient(135deg, #164E63, #06B6D4)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="12" r="2" fill="white" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="white" strokeWidth="1.5" opacity="0.8" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="white" strokeWidth="1.5" opacity="0.8" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="white" strokeWidth="1.5" opacity="0.8" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
];

const AVATAR_KEY = 'lexlens_avatar';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('violet-scale');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [totalContracts, setTotalContracts] = useState(0);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setUsername(user.username ?? '');
    }
    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) setSelectedAvatar(saved);
    fetch('/api/contracts?page=1')
      .then((r) => r.json())
      .then((d) => setTotalContracts(d.pagination?.total ?? 0))
      .catch(() => {});
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    const trimmedUsername = username.trim();
    if (trimmedUsername && (trimmedUsername.length < 3 || trimmedUsername.length > 30)) {
      toast.error('Username must be between 3 and 30 characters.');
      return;
    }

    setSaving(true);
    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        username: trimmedUsername || undefined,
      });
      localStorage.setItem(AVATAR_KEY, selectedAvatar);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllData = async () => {
    setDeletingData(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      toast.success(`Deleted ${data.deletedCount} contract${data.deletedCount !== 1 ? 's' : ''} from your account.`);
      setShowDeleteConfirm(false);
    } catch {
      toast.error('Failed to delete data. Please try again.');
    } finally {
      setDeletingData(false);
    }
  };

  const currentAvatar = AVATARS.find((a) => a.id === selectedAvatar) ?? AVATARS[0];

  if (!isLoaded) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>
          Settings
        </h1>
        <p className="text-[#94A3B8] mt-1">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6">

        {/* Profile Preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-[#12121A] p-6 flex items-center gap-5"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: currentAvatar.bg }}
          >
            {currentAvatar.svg}
          </div>
          <div>
            <p className="font-semibold text-[#F8FAFC] text-lg">
              {firstName || user?.firstName || 'Your Name'}
              {lastName ? ` ${lastName}` : ''}
            </p>
            <p className="text-sm text-[#94A3B8]">@{username || user?.username || 'username'}</p>
            <p className="text-xs text-[#475569] mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </motion.div>

        {/* Avatar Picker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-white/10 bg-[#12121A] p-6"
        >
          <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
            <User size={14} /> Profile Avatar
          </p>
          <div className="flex gap-4 flex-wrap">
            {AVATARS.map((avatar) => (
              <div key={avatar.id} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setSelectedAvatar(avatar.id)}
                  aria-label={`Select ${avatar.label} avatar`}
                  aria-pressed={selectedAvatar === avatar.id}
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    selectedAvatar === avatar.id
                      ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-[#12121A] scale-110'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{ background: avatar.bg }}
                >
                  {avatar.svg}
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
                <span className="text-xs text-[#475569]">{avatar.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Name Fields */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-[#12121A] p-6 space-y-4"
        >
          <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Profile Info</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full rounded-xl border border-white/10 bg-[#0D0D15] text-[#F8FAFC] placeholder-[#475569] px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full rounded-xl border border-white/10 bg-[#0D0D15] text-[#F8FAFC] placeholder-[#475569] px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="username"
                className="w-full rounded-xl border border-white/10 bg-[#0D0D15] text-[#F8FAFC] placeholder-[#475569] pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
              />
            </div>
            <p className="text-xs text-[#475569] mt-1">Only letters, numbers, and underscores</p>
          </div>
        </motion.div>

        {/* Email (read-only) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-white/10 bg-[#12121A] p-6"
        >
          <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Email</p>
          <div className="rounded-xl border border-white/5 bg-[#0D0D15] px-4 py-2.5 text-sm text-[#475569]">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
          <p className="text-xs text-[#475569] mt-1.5">Email cannot be changed here. Managed via Clerk.</p>
        </motion.div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full gap-2"
          style={{ boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}
        >
          <Save size={16} />
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </Button>

        {/* GDPR — data deletion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-red-600/20 bg-red-950/10 p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-sm font-semibold text-red-400 uppercase tracking-wider">Danger Zone</p>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">
            Delete all your contract analysis data from LexLens. This permanently removes all reports, clauses, and risk analyses. Your account itself remains active.
          </p>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="ghost"
              size="sm"
              className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-600/20"
            >
              <Trash2 size={14} />
              Delete All My Data
            </Button>
          ) : (
            <div className="rounded-lg border border-red-600/30 bg-red-950/20 p-4 space-y-3">
              <p className="text-sm font-semibold text-red-300">Are you sure?</p>
              <p className="text-xs text-[#94A3B8]">
                This will permanently delete all {totalContracts > 0 ? `your ${totalContracts} contract analyses` : 'your contract analyses'} and cannot be undone. Your Clerk account will not be deleted.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteAllData}
                  disabled={deletingData}
                  size="sm"
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 size={14} />
                  {deletingData ? 'Deleting…' : 'Yes, delete all data'}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="ghost"
                  size="sm"
                  className="text-[#94A3B8]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-[#475569] mt-3">
            See our <a href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</a> for details on data retention and your rights under GDPR/CCPA.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
