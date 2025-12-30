'use client';

import ChannelCard from '@/components/ChannelCard';
import { Category } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

const CATEGORIES: Category[] = ['Trending', 'All', 'News', 'Sports', 'Entertainment', 'Movies', 'Kids', 'Music', 'Documentary'];
const LANGUAGES = ['All', 'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Odia', 'Punjabi', 'Marathi', 'Gujarati', 'Urdu'];

// Curated list of usually reliable/stable channels
const TRENDING_KEYWORDS = [
  'NASA', 'Red Bull', 'Al Jazeera', 'DW', 'NHK', 'ABC News', 'Bloomberg',
  'France 24', 'CNA', 'Sky News', 'NDTV', 'India Today', 'Republic',
  'Fashion TV', 'TRT World', 'Eurosport', 'DD News', 'DD Sports'
];

export default function Home() {
  const { channels, fetchChannels, isLoading, error } = useStore();
  const [activeCategory, setActiveCategory] = useState<Category>('Trending');
  const [activeLanguage, setActiveLanguage] = useState<string>('All');
  const router = useRouter();

  useEffect(() => {
    if (channels.length === 0 && !isLoading) {
      fetchChannels();
    }
  }, [fetchChannels, channels.length, isLoading]);

  // Hero Carousel Logic
  // Hero Carousel Logic
  const heroChannels = useMemo(() => {
    if (channels.length === 0) return [];

    // 1. High Priority (Trending Keywords)
    const priorityMatches = channels.filter(c =>
      TRENDING_KEYWORDS.some(k => c.name.toLowerCase().includes(k.toLowerCase()))
    );

    // 2. Secondary (Trending Category)
    const trendingMatches = channels.filter(c => c.category === 'Trending' && !priorityMatches.includes(c));

    // 3. Fallback (Sports/News)
    const otherMatches = channels.filter(c =>
      (c.category === 'News' || c.category === 'Sports') &&
      !priorityMatches.includes(c) && !trendingMatches.includes(c)
    );

    // Combine and Shuffle
    const pool = [...priorityMatches, ...trendingMatches, ...otherMatches];
    const shuffled = pool.sort(() => 0.5 - Math.random());

    // Return top 5 unique
    return shuffled.slice(0, 5);
  }, [channels]);

  const [heroIndex, setHeroIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    if (heroChannels.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroChannels.length);
    }, 8000); // 8 seconds per slide
    return () => clearInterval(interval);
  }, [heroChannels.length]);

  const handleWatchFeatured = (channelId: string) => {
    router.push(`/watch/${channelId}`);
  };







  const filteredChannels = channels.filter(channel => {
    // 1. Language Filter
    if (activeLanguage !== 'All' && channel.language !== activeLanguage) {
      return false;
    }

    // 2. Category Filter
    if (activeCategory === 'Trending') {
      return TRENDING_KEYWORDS.some(keyword =>
        channel.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    return activeCategory === 'All' || channel.category === activeCategory;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Hero Section / Featured Carousel */}
      <section className="relative h-[400px] rounded-2xl overflow-hidden hidden md:block group">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-transparent z-10" />

        {heroChannels.length > 0 && (() => {
          const featuredChannel = heroChannels[heroIndex];
          return (
            <div className="relative h-full w-full transition-all duration-500 ease-in-out">
              {/* Background Image */}
              <Image
                key={featuredChannel.id} // Key change triggers animation
                src={featuredChannel.programs?.[0]?.thumbnail || featuredChannel.logo || "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop"}
                alt={`Featured: ${featuredChannel.name}`}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-60 animate-in fade-in zoom-in-105 duration-1000"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop";
                }}
              />

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 p-8 z-20 space-y-4 max-w-2xl animate-in slide-in-from-bottom-5 fade-in duration-700">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg shadow-accent/20">
                    {featuredChannel.category}
                  </span>
                  <span className="px-2 py-0.5 border border-white/30 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                    LIVE
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
                  {featuredChannel.name.replace(/\s*\(.*?\)\s*/g, '').trim()}
                </h1>

                <p className="text-lg text-gray-200 line-clamp-2 drop-shadow-md max-w-xl">
                  {featuredChannel.programs?.[0]?.description || (() => {
                    const motivators = [
                      "Watch live coverage from around the globe.",
                      "Stay updated with breaking news and events.",
                      "Catch the latest trending entertainment.",
                      "Experience premium content, streaming live.",
                      "Your window to the world's best television."
                    ];
                    return motivators[featuredChannel.id.length % motivators.length];
                  })()}
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => handleWatchFeatured(featuredChannel.id)}
                    className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    Watch Now
                  </button>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-8 right-8 z-30 flex gap-2">
                {heroChannels.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300 shadow-sm",
                      idx === heroIndex
                        ? "bg-white w-6"
                        : "bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Filters (Sticky) */}
      <div className="sticky top-[64px] z-30 bg-[#0f1419]/95 backdrop-blur py-4 -mx-4 md:-mx-8 px-4 md:px-8 border-b border-white/5 space-y-4">

        {/* Language Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-bold text-muted uppercase tracking-wider mr-2">Audio:</span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                activeLanguage === lang
                  ? "bg-accent/20 text-accent border-accent/50"
                  : "bg-[#1a1f2e] text-muted border-white/5 hover:border-white/20 hover:text-foreground"
              )}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                activeCategory === category
                  ? "bg-white text-black border-white"
                  : "bg-[#1a1f2e] text-muted border-white/5 hover:border-white/20 hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Channel Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {activeCategory === 'All' ? 'All Channels' : `${activeCategory} Channels`}
            {activeLanguage !== 'All' && <span className="text-muted-foreground ml-2 text-lg font-normal">({activeLanguage})</span>}
          </h2>
          <span className="text-sm text-muted">
            {filteredChannels.length} Channels Live
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-error">
            <p>Error loading channels: {error}</p>
            <button onClick={() => fetchChannels()} className="mt-4 text-accent hover:underline">Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        )}

        {!isLoading && !error && filteredChannels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <p className="text-lg">No channels found in this category.</p>
            <button onClick={() => setActiveCategory('All')} className="mt-4 text-accent hover:underline">
              View All Channels
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
