import { writable } from 'svelte/store';

function createBearerStore() {
    const { subscribe, set } = writable({ bearer: '' });

    return {
        subscribe,
        setBearer: (bearer: string) => {
            set({ bearer });
        }
    };
}

export const bearer = createBearerStore();
