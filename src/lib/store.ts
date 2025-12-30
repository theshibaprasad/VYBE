import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings, Channel } from '@/types';
import { fetchIptvChannels } from './iptv';

interface AppState {
    favorites: string[]; // Channel IDs
    recentChannels: string[];
    settings: UserSettings;
    isSidebarOpen: boolean;

    // Data State
    channels: Channel[];
    isLoading: boolean;
    error: string | null;

    // Actions
    toggleFavorite: (channelId: string) => void;
    addRecentChannel: (channelId: string) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    fetchChannels: () => Promise<void>;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            favorites: [],
            recentChannels: [],
            settings: {
                volume: 1,
                isMuted: false,
                quality: 'auto',
                dataSaver: false,
            },
            isSidebarOpen: false, // Default closed as requested

            // Data State
            channels: [], // Initial state empty
            isLoading: false,
            error: null,

            toggleFavorite: (channelId) =>
                set((state) => ({
                    favorites: state.favorites.includes(channelId)
                        ? state.favorites.filter((id) => id !== channelId)
                        : [...state.favorites, channelId],
                })),

            addRecentChannel: (channelId) =>
                set((state) => {
                    const newRecent = [channelId, ...state.recentChannels.filter((id) => id !== channelId)].slice(0, 10);
                    return { recentChannels: newRecent };
                }),

            updateSettings: (newSettings) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                })),

            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

            fetchChannels: async () => {
                set({ isLoading: true, error: null });
                try {
                    const channels = await fetchIptvChannels();
                    if (channels.length === 0) {
                        set({ error: 'No channels found', isLoading: false });
                    } else {
                        set({ channels, isLoading: false, error: null });
                    }
                } catch (err) {
                    set({ error: 'Failed to fetch channels', isLoading: false });
                    console.error(err);
                }
            }
        }),
        {
            name: 'live-tv-storage',
            partialize: (state) => ({
                favorites: state.favorites,
                recentChannels: state.recentChannels,
                settings: state.settings
            }), // Don't persist channels (fetch fresh) or UI state
        }
    )
);
