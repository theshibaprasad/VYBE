'use client';

import { Channel } from '@/types';
import { Heart, Play, Users } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ChannelCardProps {
    channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
    const { favorites, toggleFavorite } = useStore();
    const isFavorite = favorites.includes(channel.id);
    const currentProgram = channel.programs[0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#1a1f2e] rounded-xl overflow-hidden border border-white/5 hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10"
        >
            {/* Thumbnail Area */}
            <div className="relative aspect-video bg-black/50 overflow-hidden">
                <Image
                    src={currentProgram?.thumbnail || 'https://picsum.photos/320/180'}
                    alt={currentProgram?.title || 'Program Thumbnail'}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                    unoptimized
                />

                {/* Overlays */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {channel.isLive && (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white animate-pulse">
                            LIVE
                        </span>
                    )}
                </div>

                <div className="absolute top-3 right-3">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(channel.id);
                        }}
                        className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors"
                    >
                        <Heart className={cn("w-4 h-4 transition-colors", isFavorite ? "fill-accent text-accent" : "text-white")} />
                    </button>
                </div>

                {/* Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/watch/${channel.id}`} className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg">
                            <Play className="w-4 h-4 fill-current" />
                            <span>Watch Now</span>
                        </div>
                    </Link>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div className="h-full bg-accent w-1/3" /> {/* Mock progress */}
                </div>
            </div>

            {/* Info Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-white/5 p-1 flex items-center justify-center border border-white/10 relative">
                            <Image
                                src={channel.logo}
                                alt={channel.name}
                                width={32}
                                height={32}
                                className="object-contain max-w-full max-h-full"
                                unoptimized
                            />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground leading-tight">{channel.name}</h3>
                            <span className="text-xs text-muted">CH {channel.number}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <p className="text-sm font-medium text-white truncate">{currentProgram?.title || 'Unknown Program'}</p>
                    <p className="text-xs text-muted truncate mt-0.5">
                        {new Date(currentProgram?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(currentProgram?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded border border-white/20 text-[10px]">HD</span>
                        <span className="px-1.5 py-0.5 rounded border border-white/20 text-[10px]">{currentProgram?.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{(channel.currentViewerCount / 1000).toFixed(1)}k</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
