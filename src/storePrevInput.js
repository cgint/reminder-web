import { writable } from 'svelte/store';

function createPrevInputStore() {
    const { subscribe, set } = writable({ 
        info_key_value_prev_input: "",
        gpt_info_prev_input: "",
        gpt_news_analysis_prev_input: "",
        news_links_prev_input: ""
    });

    return {
        subscribe,
        clear: () => {
            set({ 
                info_key_value_prev_input: "",
                gpt_info_prev_input: "",
                gpt_news_analysis_prev_input: "",
                news_links_prev_input: ""
            });
        },
        setInfoKeyValuePrevInput: (value) => {
            set((current) => ({ ...current, info_key_value_prev_input: value }));
        },
        setGptInfoPrevInput: (value) => {
            set((current) => ({ ...current, gpt_info_prev_input: value }));
        },
        setGptNewsAnalysisPrevInput: (value) => {
            set((current) => ({ ...current, gpt_news_analysis_prev_input: value }));
        },
        setNewsLinksPrevInput: (value) => {
            set((current) => ({ ...current, news_links_prev_input: value }));
        }
    };
}

export const prevInput = createPrevInputStore();
