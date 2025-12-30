'use client';

import { Channel } from '@/types';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface EPGTimelineProps {
    channels: Channel[];
}

export default function EPGTimeline({ channels }: EPGTimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time indicator every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const [sidebarOffset, setSidebarOffset] = useState(0);

    useEffect(() => {
        const handleResize = () => setSidebarOffset(window.innerWidth < 768 ? 80 : 192);
        // Initial check in a timeout to avoid synchronous setState warning (or just accept one re-render)
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const HOUR_WIDTH = 250; // Pixels per hour
    const startHour = new Date();
    startHour.setMinutes(0, 0, 0);
    startHour.setHours(startHour.getHours() - 1); // Start 1 hour ago

    // Generate 24 hours of timeline headers
    const timeSlots = Array.from({ length: 24 }).map((_, i) => {
        const time = new Date(startHour);
        time.setHours(time.getHours() + i);
        return time;
    });

    const getPosition = (dateStr: string) => {
        const date = new Date(dateStr);
        const diff = (date.getTime() - startHour.getTime()) / (1000 * 60 * 60); // Difference in hours
        return diff * HOUR_WIDTH;
    };

    const getWidth = (durationMinutes: number) => {
        return (durationMinutes / 60) * HOUR_WIDTH;
    };

    return (
        <div className="flex flex-col h-full bg-[#0f1419] text-white">
            {/* Timeline Header */}
            <div className="flex sticky top-0 z-20 bg-[#0f1419] border-b border-white/10 ml-20 md:ml-48 overflow-hidden pointer-events-none"> {/* Synced scroll handled by layout or manual sync */}
                <div className="flex" style={{ transform: 'translateX(0px)' }}> {/* Placeholder for scroll sync logic if needed, simplify for now */}
                    {timeSlots.map((time, i) => (
                        <div key={i} className="flex-shrink-0 border-r border-white/5 px-2 py-3 text-xs md:text-sm font-medium text-muted" style={{ width: HOUR_WIDTH }}>
                            {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Time Indicator logic would go here */}

            {/* Main Grid */}
            <div className="flex-1 overflow-auto cursor-grab active:cursor-grabbing" ref={containerRef}>
                <div className="relative min-w-max">
                    {/* Current Time Line */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
                        style={{ left: getPosition(currentTime.toISOString()) + sidebarOffset }} // Adjust for sidebar offset
                    />

                    {channels.map((channel) => (
                        <div key={channel.id} className="flex border-b border-white/5 hover:bg-white/5 transition-colors">
                            {/* Channel Sidebar (Sticky) */}
                            <div className="sticky left-0 w-20 md:w-48 bg-[#0f1419] z-10 flex items-center gap-3 p-3 border-r border-white/10 shrink-0">
                                <Image
                                    src={channel.logo}
                                    alt={channel.name}
                                    width={40}
                                    height={40}
                                    className="w-8 h-8 md:w-10 md:h-10 object-contain bg-white/5 rounded p-1"
                                />
                                <div className="hidden md:block overflow-hidden">
                                    <p className="font-bold truncate">{channel.name}</p>
                                    <p className="text-xs text-muted">CH {channel.number}</p>
                                </div>
                            </div>

                            {/* Programs Row */}
                            <div className="flex relative h-20 items-center">
                                {channel.programs.map((program) => {
                                    const left = getPosition(program.startTime);
                                    const width = getWidth(program.duration);

                                    // Only render if visible within our range (simple optimization)
                                    if (left + width < 0) return null;

                                    return (
                                        <Link
                                            key={program.id}
                                            href={`/watch/${channel.id}`} // Clicking program goes to channel
                                            className="absolute top-1 bottom-1 rounded-md border border-white/10 bg-secondary hover:bg-accent/20 hover:border-accent/50 transition-all p-2 overflow-hidden block group"
                                            style={{ left: `${left}px`, width: `${width - 4}px` }}
                                        >
                                            <p className="font-medium text-sm truncate group-hover:text-accent">{program.title}</p>
                                            <p className="text-xs text-muted truncate">{program.genre[0]}</p>
                                            <div className="hidden group-hover:block absolute top-2 right-2">
                                                <div className="bg-accent rounded-full p-1 w-2 h-2" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
