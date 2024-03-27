import { writable } from 'svelte/store';

function createProcessingStore() {
    const { subscribe, update } = writable({ processingCount: 0, processingValue: '' });

    return {
        subscribe,
        startProcessing: () => {
            update((state) => ({ processingCount: state.processingCount + 1, processingValue: 'loading ...' }));
        },
        stopProcessing: () => {
            update((state) => ({ processingCount: state.processingCount - 1, processingValue: state.processingCount > 1 ? state.processingValue : '' }));
        }
    };
}

export const processing = createProcessingStore();
