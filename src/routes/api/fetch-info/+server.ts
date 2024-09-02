import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
const password = import.meta.env.VITE_PASSWORD;

export const GET: RequestHandler = async ({ url, request }) => {
    try {
        const params = new URLSearchParams(url.search);
        const urlToFetch = params.get('url');

        if (!urlToFetch) {
            return json({ error: 'URL is required' }, { status: 400 });
        }

        const token = request.headers.get('password');
        if (!token) {
            return json({ error: 'Password is required' }, { status: 401 });
        } else if (token !== password) {
            return json({ error: 'Invalid password' }, { status: 401 });
        }

        // TODO: Implement token validation

        const response = await fetch(urlToFetch);
        const htmlContent = await response.text();

        return json({ content: htmlContent });
    } catch (error) {
        console.error('Error fetching HTML content:', error);
        return json({ error: 'Failed to fetch HTML content' }, { status: 500 });
    }
};
