
export const GET = async () => {
    return new Response('PONG', {
        headers: { 'Content-Type': 'text/plain' }
    });
};
