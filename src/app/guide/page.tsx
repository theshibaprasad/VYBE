'use client';

import EPGTimeline from '@/components/EPGTimeline';
import { mockChannels } from '@/lib/mockData';


export default function GuidePage() {
    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            <div className="flex items-center justify-between px-4 md:px-8">
                <h1 className="text-2xl font-bold">TV Guide</h1>
                <div className="flex items-center gap-4">
                    {/* Date Picker / Time Jump could go here */}
                    <span className="text-muted text-sm">{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex-1 border-t border-white/10 overflow-hidden bg-[#0f1419]">
                <EPGTimeline channels={mockChannels} />
            </div>
        </div>
    );
}
