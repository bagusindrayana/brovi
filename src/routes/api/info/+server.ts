import type { RequestHandler } from './$types';
import ytstream from 'yt-stream';

export const GET: RequestHandler = async ({ url }) => {
    let youtubeUrl = url.searchParams.get('url');

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
        youtubeUrl = youtubeUrl.replaceAll("music.","");
        const info = await ytstream.getInfo(youtubeUrl);
        return new Response(JSON.stringify({
            streamurl:"/api/stream?url="+youtubeUrl,
            title:info.title,
            author:info.author
        }),{
            status:200,
            headers: { 'Content-Type': 'application/json' }
        })
       
    } catch (error) {
        console.error('Error streaming audio:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to get music info. Please check the URL and try again.' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
