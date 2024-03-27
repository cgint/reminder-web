import { writable } from 'svelte/store';

function createBearerStore() {
    const { subscribe, set } = writable({ bearer: '' });

    return {
        subscribe,
        setBearer: (bearer) => {
            set({ bearer });
        }
    };
}

export const bearer = createBearerStore();
