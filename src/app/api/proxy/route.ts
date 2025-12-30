import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                // Pretend to be a browser to avoid some basic blocks
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': new URL(url).origin, // Pass the stream's own origin as referer
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Upstream error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // simple CORS proxy headers
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=60');

        return new NextResponse(data, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 });
    }
}
