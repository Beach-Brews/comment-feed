export const context = {
    subredditName: 'UAT4CommentList',
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
    window.location.reload();
};

export const exitExpandedMode = () => {
    window.location.hash = 'inline';
    window.location.reload();
};

export const addWebViewModeListener = () => {
};

export const removeWebViewModeListener = () => {
};
