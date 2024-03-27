import { writable } from 'svelte/store';

// register on tickerSetDate if you want to listen to every 'set'-event even if the ticker-symbol did not change
function createTickerStore() {
    const { subscribe, set } = writable({ ticker: '', tickerSetDate: 0 });

    return {
        subscribe,
        setTicker: (ticker) => {
            set({ ticker, tickerSetDate: Date.now() });
        }
    };
}

export const tickerInput = createTickerStore();
