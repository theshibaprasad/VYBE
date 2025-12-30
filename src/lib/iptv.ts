import { Channel, Category, Program } from '@/types';



async function parseM3U(url: string, startingId: number, language: string = 'English'): Promise<Channel[]> {
    try {
        const response = await fetch(url);
        const text = await response.text();

        const channels: Channel[] = [];
        const lines = text.split('\n');

        // We need to store metadata from #EXTINF line to use in the next URL line
        let currentMetadata: { name: string; logo: string; category: Category } | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('#EXTINF:')) {
                // Parse metadata
                // Example: #EXTINF:-1 tvg-id="Channel.us" tvg-logo="..." group-title="News",Channel Name
                const info = line.substring(8);
                const lastCommaIndex = info.lastIndexOf(',');
                const metaPart = info.substring(0, lastCommaIndex);
                const namePart = info.substring(lastCommaIndex + 1);

                // Extract Logo
                const logoMatch = metaPart.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';

                // Extract Group (Category)
                const groupMatch = metaPart.match(/group-title="([^"]*)"/);
                const group = groupMatch ? groupMatch[1] : '';

                // Map Category
                let category: Category = 'All'; // Default
                const lowerGroup = group.toLowerCase();

                if (lowerGroup.includes('news')) category = 'News';
                else if (lowerGroup.includes('sport') || lowerGroup.includes('soccer') || lowerGroup.includes('cricket')) category = 'Sports';
                else if (lowerGroup.includes('movie') || lowerGroup.includes('cinema') || lowerGroup.includes('film')) category = 'Movies';
                else if (lowerGroup.includes('kids') || lowerGroup.includes('cartoon') || lowerGroup.includes('animation')) category = 'Kids';
                else if (lowerGroup.includes('music') || lowerGroup.includes('mtv') || lowerGroup.includes('songs')) category = 'Music';
                else if (lowerGroup.includes('documentary') || lowerGroup.includes('nature') || lowerGroup.includes('science') || lowerGroup.includes('history')) category = 'Documentary';
                else if (lowerGroup.includes('entertainment') || lowerGroup.includes('lifestyle')) category = 'Entertainment';

                currentMetadata = {
                    name: namePart.trim() || 'Unknown Channel',
                    logo: logo || '',
                    category
                };
            } else if (line.startsWith('http') && currentMetadata) {
                // Stream URL line - create channel
                // Basic filtering for likely valid HLS/video streams
                // We'll allow others but prioritize m3u8 in logic if we were sorting.
                // For now, accept it, but maybe we can flag it?
                // Actually, let's just accept it. The player works best with m3u8.

                const channelId = `iptv-${startingId + channels.length}`;

                // PERMISSIVE: Accept ALL http links as valid streams.
                if (!line.startsWith('http')) {
                    currentMetadata = null;
                    continue;
                }

                // Intentionally skipping extension checks to maximize compatibility.
                // Whether it's .m3u8, .mp4, .mkv, or no extension at all, we pass it to the player.


                const mockProgram: Program = {
                    id: `prog-${channelId}`,
                    title: `${currentMetadata.name} Live`,
                    description: `Live streaming of ${currentMetadata.name}`,
                    startTime: new Date().toISOString(),
                    endTime: new Date(Date.now() + 3600000 * 24).toISOString(), // 24 hours
                    duration: 60,
                    genre: [currentMetadata.category],
                    rating: 'TV-G',
                    thumbnail: currentMetadata.logo || ''
                };

                // Since we filter for m3u8, type is always HLS
                const streamType = 'application/x-mpegURL';

                const channel: Channel = {
                    id: channelId,
                    name: currentMetadata.name,
                    number: (startingId + channels.length).toString(),
                    logo: currentMetadata.logo || '',
                    category: currentMetadata.category,
                    isLive: true,
                    currentViewerCount: Math.floor(Math.random() * 5000) + 100,
                    streamUrl: line,
                    streamType,
                    programs: [mockProgram],
                    language // Add language property
                };

                // Filter out channels without logos or specific bad categories if needed
                if (channel.logo) {
                    channels.push(channel);
                }

                currentMetadata = null; // Reset
            }
        }
        return channels;
    } catch (error) {
        console.error(`Failed to fetch/parse M3U from ${url}:`, error);
        return [];
    }
}

// Language-specific playlists
const ENG_M3U_URL = 'https://iptv-org.github.io/iptv/languages/eng.m3u';
const HIN_M3U_URL = 'https://iptv-org.github.io/iptv/languages/hin.m3u';
const TAM_M3U_URL = 'https://iptv-org.github.io/iptv/languages/tam.m3u';
const TEL_M3U_URL = 'https://iptv-org.github.io/iptv/languages/tel.m3u';
const MAL_M3U_URL = 'https://iptv-org.github.io/iptv/languages/mal.m3u';
const KAN_M3U_URL = 'https://iptv-org.github.io/iptv/languages/kan.m3u';
const BEN_M3U_URL = 'https://iptv-org.github.io/iptv/languages/ben.m3u';
const PAN_M3U_URL = 'https://iptv-org.github.io/iptv/languages/pan.m3u';
const MAR_M3U_URL = 'https://iptv-org.github.io/iptv/languages/mar.m3u';
const GUJ_M3U_URL = 'https://iptv-org.github.io/iptv/languages/guj.m3u';
const URD_M3U_URL = 'https://iptv-org.github.io/iptv/languages/urd.m3u';
const ORI_M3U_URL = 'https://iptv-org.github.io/iptv/languages/ori.m3u';

export async function fetchIptvChannels(): Promise<Channel[]> {
    try {
        // Fetch playlists in parallel
        // Note: We use offset IDs to minimize ID collisions between lists
        const [
            eng, hin, tam, tel, mal, kan, ben, ori, pan, mar, guj, urd
        ] = await Promise.all([
            parseM3U(ENG_M3U_URL, 1, 'English'),
            parseM3U(HIN_M3U_URL, 3000, 'Hindi'),
            parseM3U(TAM_M3U_URL, 4000, 'Tamil'),
            parseM3U(TEL_M3U_URL, 4500, 'Telugu'),
            parseM3U(MAL_M3U_URL, 5000, 'Malayalam'),
            parseM3U(KAN_M3U_URL, 5500, 'Kannada'),
            parseM3U(BEN_M3U_URL, 6000, 'Bengali'),
            parseM3U(ORI_M3U_URL, 6200, 'Odia'),
            parseM3U(PAN_M3U_URL, 6500, 'Punjabi'),
            parseM3U(MAR_M3U_URL, 7000, 'Marathi'),
            parseM3U(GUJ_M3U_URL, 7500, 'Gujarati'),
            parseM3U(URD_M3U_URL, 8000, 'Urdu'),
        ]);

        // Prioritize: Hindi & Regional -> English
        const allChannels = [
            ...hin, ...tam, ...tel, ...mal, ...kan, ...ben, ...ori, ...pan, ...mar, ...guj, ...urd,
            ...eng
        ];

        // Unique by stream URL
        const uniqueChannels: Channel[] = [];
        const seenUrls = new Set<string>();

        for (const channel of allChannels) {
            if (!seenUrls.has(channel.streamUrl)) {
                seenUrls.add(channel.streamUrl);
                uniqueChannels.push(channel);
            }
        }

        return uniqueChannels.slice(0, 1200); // Increased limit due to more sources

    } catch (error) {
        console.error("Failed to fetch IPTV data:", error);
        return [];
    }
}
