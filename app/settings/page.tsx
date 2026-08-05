"use client";

import { useEffect, useState } from "react";
import { Bell, LayoutDashboard, Save, ShieldCheck } from "lucide-react";
import { APP_MODE } from "@/lib/features";
import { usePlatformIdentity } from "@/lib/platformIdentity";

type Preferences = {
  compactMode: boolean;
  learningReminders: boolean;
  moderationUpdates: boolean;
  defaultFeed: "top" | "trending" | "recent";
};

const defaults: Preferences = {
  compactMode: false,
  learningReminders: true,
  moderationUpdates: true,
  defaultFeed: "trending",
};

export default function SettingsPage() {
  const identity = usePlatformIdentity();
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [saved, setSaved] = useState(false);
  const updateOptions: Array<["learningReminders" | "moderationUpdates", string, string]> = [
    ["learningReminders", "Learning reminders", "Keep your role-based learning path moving."],
  ];
  if (APP_MODE === "platform") {
    updateOptions.push(["moderationUpdates", "Submission decisions", "Show status changes and revision requests."]);
  }

  useEffect(() => {
    const raw = window.localStorage.getItem("ap:preferences");
    if (raw) {
      try { setPreferences({ ...defaults, ...(JSON.parse(raw) as Partial<Preferences>) }); } catch { /* Use defaults. */ }
    }
  }, []);

  const save = () => {
    window.localStorage.setItem("ap:preferences", JSON.stringify(preferences));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <h1 className="text-xl font-bold text-primary-dark">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        {APP_MODE === "static"
          ? "Personalize this device with local preferences."
          : "Personalize this device. Identity policy remains controlled by the platform administrator."}
      </p>

      <section className="mt-5 rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
        <div className="flex items-center gap-2"><LayoutDashboard size={17} className="text-primary" /><h2 className="text-sm font-bold text-primary-dark">Display and discovery</h2></div>
        <label className="mt-4 flex items-center justify-between gap-4 border-t border-silver-mid/50 pt-4">
          <span><span className="block text-xs font-bold text-primary-dark">Compact content cards</span><span className="block text-[11px] text-gray-500">Show more results on larger screens.</span></span>
          <input type="checkbox" checked={preferences.compactMode} onChange={(event) => setPreferences({ ...preferences, compactMode: event.target.checked })} className="h-4 w-4 accent-primary" />
        </label>
        {APP_MODE === "platform" && (
          <label className="mt-4 block text-xs font-bold text-primary-dark">
            Default community feed
            <select value={preferences.defaultFeed} onChange={(event) => setPreferences({ ...preferences, defaultFeed: event.target.value as Preferences["defaultFeed"] })} className="mt-1 w-full rounded-input border border-silver-mid bg-white px-3 py-2.5 text-sm font-normal">
              <option value="trending">Trending</option><option value="top">Top</option><option value="recent">Recent</option>
            </select>
          </label>
        )}
      </section>

      <section className="mt-3 rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
        <div className="flex items-center gap-2"><Bell size={17} className="text-primary" /><h2 className="text-sm font-bold text-primary-dark">Updates</h2></div>
        {updateOptions.map(([key, label, detail]) => (
          <label key={key} className="mt-4 flex items-center justify-between gap-4 border-t border-silver-mid/50 pt-4">
            <span><span className="block text-xs font-bold text-primary-dark">{label}</span><span className="block text-[11px] text-gray-500">{detail}</span></span>
            <input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences({ ...preferences, [key]: event.target.checked })} className="h-4 w-4 accent-primary" />
          </label>
        ))}
      </section>

      {APP_MODE === "platform" && (
        <section className="mt-3 flex items-start gap-3 rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
          <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-success-mid" />
          <div><h2 className="text-sm font-bold text-primary-dark">Identity provider</h2><p className="mt-1 text-xs text-gray-500">{identity ? `${identity.email} through the simulated provider.` : "Not signed in."} The platform auth adapter is ready for Microsoft Entra configuration.</p></div>
        </section>
      )}

      <button type="button" onClick={save} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-inner bg-primary px-4 text-sm font-bold text-white"><Save size={16} /> {saved ? "Saved" : "Save settings"}</button>
    </div>
  );
}
