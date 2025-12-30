import { Channel, Category, Program } from '@/types';

const CHANNELS_DATA = [
    { name: 'CNN', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/66/CNN_International_logo.svg' },
    { name: 'Fox News', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Fox_News_Channel_logo.svg' },
    { name: 'BBC News', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/62/BBC_News_2019.svg' },
    { name: 'ESPN', category: 'Sports', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/ESPN_logo.svg' },
    { name: 'Fox Sports', category: 'Sports', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Fox_Sports_logo_2017.svg' },
    { name: 'HBO', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg' },
    { name: 'Netflix Channel', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { name: 'AMC', category: 'Movies', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/AMC_Network_logo.svg' },
    { name: 'TCM', category: 'Movies', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Turner_Classic_Movies_logo.svg' },
    { name: 'Cartoon Network', category: 'Kids', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Cartoon_Network_2010_logo.svg' },
    { name: 'Disney Channel', category: 'Kids', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Disney_Channel_logo_2014.svg' },
    { name: 'NBC', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/NBC_logo_2022.svg' },
    { name: 'CBS', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/CBS_logo_2020.svg' },
    { name: 'ABC', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/ABC_logo_2021.svg' },
    { name: 'TNT', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/21/TNT_logo_2016.svg' },
    { name: 'TBS', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/TBS_logo_2016.svg' },
    { name: 'USA Network', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/USA_Network_logo_2016.svg' },
    { name: 'FX', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/FX_Network_logo_2013.svg' },
    { name: 'Discovery', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Discovery_Channel_2019_logo.svg' },
    { name: 'Nat Geo', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/65/National_Geographic_logo.svg' },
    { name: 'History', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/History_Channel_logo_2015.svg' },
    { name: 'Food Network', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Food_Network_logo_2013.svg' },
    { name: 'HGTV', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/HGTV_2015_logo.svg' },
    { name: 'TLC', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/TLC_2008_logo.svg' },
];

function generatePrograms(categoryId: string): Program[] {
    const programs: Program[] = [];
    const now = new Date();
    now.setMinutes(0, 0, 0); // Start at nearest hour
    // Generate for last 2 hours and next 10 hours
    const startHour = -2;
    const endHour = 10;

    for (let i = startHour; i < endHour; i++) {
        const startTime = new Date(now);
        startTime.setHours(startTime.getHours() + i);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        programs.push({
            id: `prog-${Math.random().toString(36).substr(2, 9)}`,
            title: `${categoryId} Program ${i + 3}`,
            description: `This is a description for ${categoryId} Program ${i + 3}. It is very interesting and you should watch it.`,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: 60,
            genre: [categoryId],
            rating: 'TV-PG',
            thumbnail: `https://picsum.photos/seed/${Math.random()}/320/180`,
        });
    }
    return programs;
}

export const mockChannels: Channel[] = CHANNELS_DATA.map((data, index) => ({
    id: `ch-${index + 1}`,
    name: data.name,
    number: (index + 101).toString(),
    logo: data.logo,
    category: data.category as Category,
    programs: generatePrograms(data.category),
    isLive: true,
    currentViewerCount: Math.floor(Math.random() * 50000) + 1000,
    // Using a test HLS stream that is reliable
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
}));
