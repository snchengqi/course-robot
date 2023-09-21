export const injectScript = (fileName) => {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(fileName);
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}