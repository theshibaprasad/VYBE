'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Heart, Home, Compass, type LucideIcon, Settings, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Sidebar() {
    const { isSidebarOpen, channels, fetchChannels } = useStore();
    const pathname = usePathname();

    useEffect(() => {
        if (channels.length === 0) {
            fetchChannels();
        }
    }, [channels.length, fetchChannels]);

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => useStore.getState().toggleSidebar()}
                />
            )}

            <aside
                className={cn(
                    'bg-[#0f1419] border-r border-white/10 transition-all duration-300 z-40 overflow-hidden flex flex-col shadow-2xl',
                    // Mobile: Fixed overlay
                    'fixed top-16 left-0 bottom-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:shrink-0',
                    // Width logic
                    !isSidebarOpen && '-translate-x-full md:translate-x-0 w-64', // Mobile hide (collapsed)
                    isSidebarOpen ? 'translate-x-0 w-64' : '', // Mobile show (expanded)
                    // Desktop width overrides
                    isSidebarOpen ? 'md:w-64' : 'md:w-20' // Standard 5rem (80px) for robust centering
                )}
            >
                {/* Content inner wrapper */}
                {/* Content inner wrapper - Fixed width to prevent reflow */}
                <div className="flex flex-col h-full w-64 min-w-[16rem]">

                    <div className="flex-1 overflow-y-auto scrollbar-none">
                        <div className="py-6 px-3 space-y-6">
                            {/* Main Navigation */}
                            <div className="space-y-2">
                                {/* Menu Label - Fades out when collapsed */}
                                <h3 className={cn(
                                    "text-xs font-bold text-muted/50 uppercase tracking-wider mb-2 px-4 transition-all duration-300 h-4 whitespace-nowrap overflow-hidden",
                                    !isSidebarOpen ? "md:opacity-0 md:h-0 mb-0" : "opacity-100"
                                )}>
                                    Menu
                                </h3>

                                <NavItem icon={Home} label="Home" href="/" active={pathname === '/'} collapsed={!isSidebarOpen} />
                                <NavItem icon={Tv} label="Live TV" href="/watch/ch-1" active={pathname.startsWith('/watch')} collapsed={!isSidebarOpen} />
                                <NavItem icon={Compass} label="Guide" href="/guide" active={pathname === '/guide'} collapsed={!isSidebarOpen} />
                                <NavItem icon={Heart} label="Favorites" href="/favorites" active={pathname === '/favorites'} collapsed={!isSidebarOpen} />
                            </div>

                            {/* Suggestions - Grouped by Category */}
                            {isSidebarOpen && Object.entries(
                                channels.reduce((acc, channel) => {
                                    // Skip 'All' category for grouping, it's too generic
                                    if (channel.category === 'All') return acc;

                                    const cat = channel.category;
                                    if (!acc[cat]) acc[cat] = [];
                                    if (acc[cat].length < 4) acc[cat].push(channel); // Limit to 4 per category
                                    return acc;
                                }, {} as Record<string, typeof channels>)
                            ).map(([category, categoryChannels]) => (
                                <div key={category} className="animate-in fade-in slide-in-from-left-4 duration-500">
                                    <h3 className="text-[10px] font-bold text-muted/40 uppercase tracking-wider mb-2 px-4">
                                        {category}
                                    </h3>
                                    <div className="space-y-1">
                                        {categoryChannels.map((channel) => (
                                            <NavItem
                                                key={channel.id}
                                                icon={Tv}
                                                label={channel.name}
                                                href={`/watch/${channel.id}`}
                                                active={pathname === `/watch/${channel.id}`}
                                                collapsed={false}
                                                isChannel={true}
                                                logo={channel.logo}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Settings */}
                    <div className="p-3 border-t border-white/5 bg-white/5 space-y-3">
                        <NavItem icon={Settings} label="Settings" href="/settings" collapsed={!isSidebarOpen} />

                        {/* Developer Credit */}
                        <div className={cn(
                            "px-2 transition-all duration-300 overflow-hidden",
                            !isSidebarOpen ? "h-0 opacity-0" : "h-auto opacity-100"
                        )}>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Developed by</p>
                            <a
                                href="https://www.linkedin.com/in/theshibaprasad/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-white/80 hover:text-accent transition-colors block"
                            >
                                Shiba Prasad Swain
                            </a>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

function NavItem({
    icon: Icon,
    label,
    href,
    active,
    collapsed,
    isChannel,
    logo
}: {
    icon: LucideIcon,
    label: string,
    href: string,
    active?: boolean,
    collapsed?: boolean,
    isChannel?: boolean,
    logo?: string
}) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden',
                // Height
                isChannel ? 'h-10' : 'h-12',
                // Background Colors
                active
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-muted-foreground hover:bg-white/10 hover:text-white',
            )}
            title={collapsed ? label : undefined}
        >
            {/* Icon/Logo Wrapper - FIXED WIDTH (w-14 = 56px) + px-3 (12px) = Center at 40px (Sidebar 80px center) */}
            <div className={cn(
                "w-14 h-full flex items-center justify-center shrink-0 transition-transform",
                active && !collapsed && "scale-105"
            )}>
                {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={logo}
                        alt={label}
                        className={cn("object-contain rounded-sm", isChannel ? "w-6 h-6" : "w-6 h-6")}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <Icon className={cn("w-6 h-6", active && "text-white")} strokeWidth={active ? 2.5 : 2} />
                )}
            </div>

            {/* Label - Simple fade/slide */}
            <span className={cn(
                "font-medium whitespace-nowrap overflow-hidden transition-all duration-300 pr-4",
                collapsed ? "w-0 opacity-0 -translate-x-4" : "w-auto opacity-100 translate-x-0",
                isChannel ? "text-xs" : "text-sm"
            )}>
                {label}
            </span>

            {/* Tooltip for collapsed state */}
            {collapsed && (
                <div className="hidden md:block absolute left-20 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#191f27] border border-white/10 rounded-md text-sm font-medium text-white shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#191f27]" />
                </div>
            )}
        </Link>
    );
}
