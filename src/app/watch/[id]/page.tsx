'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import ProgramInfo from '@/components/ProgramInfo';
import ChannelCard from '@/components/ChannelCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WatchPage() {
    const { id } = useParams();
    const { channels, fetchChannels, isLoading } = useStore();

    // Find channel in store
    const channel = channels.find((c) => c.id === id);

    // Fetch if missing (e.g., direct navigation)
    useEffect(() => {
        if (!channel && !isLoading && channels.length === 0) {
            fetchChannels();
        }
    }, [channel, isLoading, channels.length, fetchChannels]);

    // Handle loading/not found
    if (isLoading && !channel) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!channel && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-2xl font-bold">Channel Not Found</h1>
                <p className="text-muted">The requested channel could not be found.</p>
                <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    Back to Guide
                </Link>
            </div>
        );
    }

    if (!channel) return null; // Should not happen given above

    // Filter related channels (same category, excluding current)
    const relatedChannels = channels
        .filter((c) => c.category === channel.category && c.id !== channel.id)
        .slice(0, 4);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Browse
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Player + Info) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player */}
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-8 relative group">
                        <VideoPlayer
                            src={channel.streamUrl}
                            type={channel.streamType}
                            poster={channel.programs[0]?.thumbnail || channel.logo}
                            className="w-full h-full"
                        />

                        {/* Overlay Gradient on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center relative">
                                <Image
                                    src={channel.logo}
                                    alt={channel.name}
                                    width={64}
                                    height={64}
                                    className="object-contain max-w-full max-h-full"
                                    unoptimized
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{channel.name}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white animate-pulse">
                                        LIVE
                                    </span>
                                    <span className="text-muted text-sm">CH {channel.number}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ProgramInfo program={channel.programs[0]} />
                </div>

                {/* Sidebar (Schedule / Related) */}
                <div className="space-y-8">
                    {/* Upcoming Schedule (Mock for now since API doesn't have it easily) */}
                    <div className="bg-secondary rounded-xl p-6 border border-white/5 space-y-4">
                        <h2 className="text-lg font-bold">Upcoming on {channel.name}</h2>
                        <div className="space-y-4">
                            {channel.programs.slice(1, 5).map((program, idx) => (
                                <div key={idx} className="flex gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                                    <div className="w-24 h-16 bg-black/50 rounded overflow-hidden shrink-0 relative">
                                        <Image
                                            src={program.thumbnail}
                                            alt={program.title}
                                            fill
                                            className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                            unoptimized
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm line-clamp-1 group-hover:text-accent transition-colors">{program.title}</p>
                                        <p className="text-xs text-muted">
                                            {new Date(program.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-xs text-muted mt-1">{program.genre[0]}</p>
                                    </div>
                                </div>
                            ))}
                            {channel.programs.length <= 1 && (
                                <p className="text-sm text-muted">No upcoming programs available.</p>
                            )}
                        </div>
                    </div>

                    {/* Related Channels */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold">More {channel.category}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {relatedChannels.map(related => (
                                <ChannelCard key={related.id} channel={related} />
                            ))}
                            {relatedChannels.length === 0 && (
                                <p className="text-sm text-muted">No related channels found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
