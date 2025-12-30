'use client';

import { Program } from '@/types';
import { Calendar, Clock, Info, Share2 } from 'lucide-react';

interface ProgramInfoProps {
    program: Program;
}

export default function ProgramInfo({ program }: ProgramInfoProps) {
    const startDate = new Date(program.startTime);
    const endDate = new Date(program.endTime);

    return (
        <div className="bg-secondary rounded-xl p-6 border border-white/5 space-y-6">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground">{program.title}</h1>
                    <div className="flex items-center gap-3 text-sm text-muted">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            {program.rating}
                        </span>
                        <span className="flex items-center gap-1">
                            {program.genre.map(g => (
                                <span key={g} className="text-accent">{g}</span>
                            ))}
                        </span>
                        <span>•</span>
                        <span>{program.duration} min</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Share">
                        <Share2 className="w-5 h-5 text-muted" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="More Info">
                        <Info className="w-5 h-5 text-muted" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted">
                    <Clock className="w-4 h-4" />
                    <span>
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                    <Calendar className="w-4 h-4" />
                    <span>{startDate.toLocaleDateString()}</span>
                </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
                {program.description}
            </p>

            {/* Cast / Extra Info could go here */}
            <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Cast</p>
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/5 rounded-full pl-1 pr-3 py-1">
                            <div className="w-6 h-6 rounded-full bg-white/10" />
                            <span className="text-xs">Actor Name</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
