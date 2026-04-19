import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoArrowBack, IoColorPaletteOutline, IoShieldCheckmarkOutline,
  IoNotificationsOutline, IoPersonOutline, IoLockClosedOutline,
  IoHelpCircleOutline, IoChevronForward, IoSunny, IoMoon,
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '../config/constants';

// ── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
      checked ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500' : 'bg-gray-200 dark:bg-white/10'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 700, damping: 40 }}
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
      style={{ x: checked ? 20 : 0 }}
    />
  </button>
);

// ── Section ───────────────────────────────────────────────────────────────────
const Section = ({
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-white/5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600/15 to-fuchsia-500/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
      </div>
      <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {title}
      </h2>
    </div>
    <div className="divide-y divide-gray-100 dark:divide-white/5">{children}</div>
  </motion.section>
);

// ── Row variants ──────────────────────────────────────────────────────────────
const ToggleRow = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between px-5 py-4 gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
      {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const LinkRow = ({
  label,
  description,
  onClick,
  danger = false,
}: {
  label: string;
  description?: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-4 gap-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${
      danger ? 'hover:bg-red-50 dark:hover:bg-red-500/5' : ''
    }`}
  >
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
        {label}
      </p>
      {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
    </div>
    <IoChevronForward
      className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
        danger ? 'text-red-400' : 'text-gray-400'
      }`}
    />
  </button>
);

// ── Settings Page ─────────────────────────────────────────────────────────────
export const Settings = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  // Notification preferences (local state demo)
  const [notifPrefs, setNotifPrefs] = useState({
    likes: true,
    comments: true,
    follows: true,
    sessions: true,
    mentions: false,
    emailDigest: false,
  });

  // Privacy preferences
  const [privacyPrefs, setPrivacyPrefs] = useState({
    publicProfile: true,
    showActivity: true,
    allowMessages: true,
  });

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate(ROUTES.LOGIN);
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is currently disabled. Contact support.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-28 md:pb-12"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <IoArrowBack className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage your account and preferences
            </p>
          </div>
        </motion.div>

        {/* ── Appearance ── */}
        <Section title="Appearance" icon={IoColorPaletteOutline} delay={0.05}>
          <div className="flex items-center justify-between px-5 py-4 gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                key={isDark ? 'moon' : 'sun'}
                initial={{ rotate: -20, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? (
                  <IoMoon className="w-5 h-5 text-violet-500" />
                ) : (
                  <IoSunny className="w-5 h-5 text-amber-500" />
                )}
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isDark ? 'Easier on the eyes at night' : 'Bright and vivid interface'}
                </p>
              </div>
            </div>
            <Toggle checked={isDark} onChange={toggleTheme} />
          </div>
        </Section>

        {/* ── Account ── */}
        <Section title="Account" icon={IoPersonOutline} delay={0.1}>
          <LinkRow
            label="Edit Profile"
            description="Update your name, bio, and interests"
            onClick={() => navigate(ROUTES.PROFILE_EDIT)}
          />
          <LinkRow
            label="Change Password"
            description="Update your password for security"
            onClick={() => navigate(ROUTES.PROFILE_EDIT)}
          />
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications" icon={IoNotificationsOutline} delay={0.15}>
          <ToggleRow
            label="Likes"
            description="When someone likes your post"
            checked={notifPrefs.likes}
            onChange={(v) => setNotifPrefs((p) => ({ ...p, likes: v }))}
          />
          <ToggleRow
            label="Comments"
            description="When someone comments on your post"
            checked={notifPrefs.comments}
            onChange={(v) => setNotifPrefs((p) => ({ ...p, comments: v }))}
          />
          <ToggleRow
            label="New Followers"
            description="When someone starts following you"
            checked={notifPrefs.follows}
            onChange={(v) => setNotifPrefs((p) => ({ ...p, follows: v }))}
          />
          <ToggleRow
            label="Live Sessions"
            description="When a jam session goes live in your groups"
            checked={notifPrefs.sessions}
            onChange={(v) => setNotifPrefs((p) => ({ ...p, sessions: v }))}
          />
          <ToggleRow
            label="Mentions"
            description="When someone mentions you in a comment"
            checked={notifPrefs.mentions}
            onChange={(v) => setNotifPrefs((p) => ({ ...p, mentions: v }))}
          />
          <ToggleRow
            label="Email Digest"
            description="Weekly summary of your activity"
            checked={notifPrefs.emailDigest}
            onChange={(v) => setNotifPrefs((p) => ({ ...p, emailDigest: v }))}
          />
        </Section>

        {/* ── Privacy ── */}
        <Section title="Privacy" icon={IoShieldCheckmarkOutline} delay={0.2}>
          <ToggleRow
            label="Public Profile"
            description="Allow anyone to view your profile"
            checked={privacyPrefs.publicProfile}
            onChange={(v) => setPrivacyPrefs((p) => ({ ...p, publicProfile: v }))}
          />
          <ToggleRow
            label="Show Activity"
            description="Let others see when you're active"
            checked={privacyPrefs.showActivity}
            onChange={(v) => setPrivacyPrefs((p) => ({ ...p, showActivity: v }))}
          />
          <ToggleRow
            label="Allow Messages"
            description="Let others send you direct messages"
            checked={privacyPrefs.allowMessages}
            onChange={(v) => setPrivacyPrefs((p) => ({ ...p, allowMessages: v }))}
          />
        </Section>

        {/* ── About ── */}
        <Section title="About" icon={IoHelpCircleOutline} delay={0.25}>
          <LinkRow
            label="Terms of Service"
            onClick={() => toast.info('Terms of Service coming soon')}
          />
          <LinkRow
            label="Privacy Policy"
            onClick={() => toast.info('Privacy Policy coming soon')}
          />
          <div className="px-5 py-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">App Version</p>
            <span className="text-sm text-gray-400 font-mono">v1.0.0</span>
          </div>
        </Section>

        {/* ── Danger Zone ── */}
        <Section title="Account Actions" icon={IoLockClosedOutline} delay={0.3}>
          <LinkRow
            label="Sign Out"
            description="Sign out from all devices"
            onClick={handleLogout}
          />
          <LinkRow
            label="Delete Account"
            description="Permanently delete your account and all data"
            onClick={handleDeleteAccount}
            danger
          />
        </Section>

        {/* Save preferences button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toast.success('Settings saved!')}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-base shadow-lg shadow-violet-500/20 transition-all"
        >
          Save Preferences
        </motion.button>

      </div>
    </motion.div>
  );
};
