'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Settings, ShieldCheck, Wifi } from 'lucide-react';

export default function SettingsPage() {
    const { settings, updateSettings } = useStore();

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="p-3 bg-accent/20 rounded-xl">
                    <Settings className="w-8 h-8 text-accent" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your playback and app preferences</p>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">

                {/* Playback Section */}
                <section className="bg-[#161b26] rounded-2xl p-6 border border-white/5 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-accent" />
                        Playback & Data
                    </h2>

                    <div className="space-y-4">
                        {/* Data Saver Toggle */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-white">Data Saver Mode</h3>
                                <p className="text-sm text-muted-foreground">
                                    Automatically play channels at lower quality (480p/360p) to save bandwidth.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.dataSaver ?? false}
                                    onChange={(e) => updateSettings({ dataSaver: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>
                    </div>
                </section>



                {/* About Section */}
                <section className="bg-[#161b26] rounded-2xl p-6 border border-white/5 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent" />
                        About
                    </h2>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                        <p className="text-sm text-muted-foreground">Version 1.2.0 (Stable)</p>
                        <p className="text-xs text-muted-foreground/50">
                            Developed by <a href="https://www.linkedin.com/in/theshibaprasad/" target="_blank" className="hover:text-accent hover:underline">Shiba Prasad Swain</a>
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
}
