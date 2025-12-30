'use client';

import { useSearchParams } from 'next/navigation';
import ChannelCard from '@/components/ChannelCard';
import { Search, Film } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useStore } from '@/lib/store';

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const { channels, fetchChannels, isLoading } = useStore();

    // Update local state if URL changes
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    // Ensure channels are loaded
    useEffect(() => {
        if (channels.length === 0 && !isLoading) {
            fetchChannels();
        }
    }, [channels.length, isLoading, fetchChannels]);

    const results = useMemo(() => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return channels.filter(channel =>
            channel.name.toLowerCase().includes(lowerQuery) ||
            channel.programs.some(p => p.title.toLowerCase().includes(lowerQuery))
        );
    }, [query, channels]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
                <h1 className="text-3xl font-bold">Search</h1>
                <div className="relative max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Find channels, swimming, news..."
                        className="w-full bg-secondary border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-muted/50"
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-muted">
                    {query ? `Found ${results.length} results for "${query}"` : 'Start typing to search'}
                </p>

                {results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {results.map(channel => (
                            <ChannelCard key={channel.id} channel={channel} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <Film className="w-16 h-16 text-white/10" />
                        <p className="text-xl font-medium text-muted">No results found</p>
                        <p className="text-sm text-muted/50">Try searching for a channel name or program title.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
