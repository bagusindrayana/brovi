import type { RequestHandler } from './$types';
import ytstream from 'yt-stream';

export const GET: RequestHandler = async ({ url }) => {
    const youtubeUrl = url.searchParams.get('url');

    if (!youtubeUrl) {
        return new Response(
            JSON.stringify({ error: 'You must provide a YouTube URL as a query parameter.' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    try {
        // Fetch the audio stream
        const stream = await ytstream.stream(youtubeUrl, {
            quality: 'high',
            type: 'audio',
            highWaterMark: 1048576 * 32,
            download: true
        });

        // Stream audio back to the client
        return new Response(stream.stream, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Transfer-Encoding': 'chunked'
            }
        });
    } catch (error) {
        console.error('Error streaming audio:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to stream audio. Please check the URL and try again.' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
