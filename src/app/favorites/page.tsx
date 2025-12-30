'use client';

import { useStore } from '@/lib/store';
import { mockChannels } from '@/lib/mockData';
import ChannelCard from '@/components/ChannelCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
    const { favorites } = useStore();
    const favoriteChannels = mockChannels.filter(c => favorites.includes(c.id));

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 min-h-[calc(100vh-8rem)]">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <div className="p-3 bg-accent/10 rounded-full">
                    <Heart className="w-6 h-6 text-accent fill-accent" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">My Favorites</h1>
                    <p className="text-muted">Manage your personal channel lineup</p>
                </div>
            </div>

            {favoriteChannels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {favoriteChannels.map((channel) => (
                        <ChannelCard key={channel.id} channel={channel} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-secondary/50 rounded-2xl border border-white/5 border-dashed">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                        <Heart className="w-8 h-8 text-muted" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">No favorites yet</h2>
                        <p className="text-muted max-w-sm mx-auto mt-2">
                            Heart channels while browsing to add them to your personalized list for quick access.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                    >
                        Browse Channels
                    </Link>
                </div>
            )}
        </div>
    );
}
