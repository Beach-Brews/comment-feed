type ViewModelListener = (newMode: 'expanded' | 'inline') => void;
let listeners: ViewModelListener[] = [];

export const context = {
    subredditName: 'UAT4CommentFeed',
    appVersion: 'LocalVite'
};

export const navigateTo = (url: string) => {
    console.log('Open new tab to:', url);
};

export const getWebViewMode = () => {
    return window.location.hash.substring(1);
};

export const requestExpandedMode = () => {
    window.location.hash = 'expanded';
    listeners.forEach(l => l('expanded'));
};

export const exitExpandedMode = () => {
    window.location.hash = 'inline';
    listeners.forEach((l) => l('inline'));
};

export const addWebViewModeListener = (listener: ViewModelListener) => {
    listeners.push(listener);
};

export const removeWebViewModeListener = (_listener: ViewModelListener) => {
    listeners = [];
};
