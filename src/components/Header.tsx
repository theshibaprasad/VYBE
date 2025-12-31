'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export default function Header() {
    const { toggleSidebar } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsMobileSearchOpen(false);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-gradient-to-b from-[#0f1419] to-[#0f1419]/95 backdrop-blur-md border-b border-white/10">
            <div className="h-16 px-4 md:px-6 flex items-center justify-between">
                {/* Left: Logo & Toggle */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block"
                    >
                        <Menu className="w-5 h-5 text-foreground" />
                    </button>
                    {/* Mobile Hamburger */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden"
                    >
                        <Menu className="w-5 h-5 text-foreground" />
                    </button>

                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                            <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            VYBE
                        </span>
                    </Link>
                </div>

                {/* Center: Search (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-xl mx-8">
                    <form onSubmit={handleSearch} className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Search channels, movies, sports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-secondary/50 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all placeholder:text-muted/50"
                        />
                    </form>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors relative group md:hidden"
                    >
                        <Search className="w-5 h-5 text-foreground" />
                        <span className="sr-only">Search</span>
                    </button>

                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                        <Bell className="w-5 h-5 text-foreground" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-[#0f1419]" />
                    </button>

                    <button className="flex items-center gap-2 pl-2 md:pl-4 md:border-l border-white/10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-purple-500 overflow-hidden ring-2 ring-white/10 relative">
                            <Image
                                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                alt="User"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {isMobileSearchOpen && (
                <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full bg-secondary/50 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 placeholder:text-muted/50"
                        />
                    </form>
                </div>
            )}
        </header>
    );
}
