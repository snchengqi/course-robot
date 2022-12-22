export const tabUtil = {
    createNewTab: async (active = true, url) => {
         const newTab = await chrome.tabs.create({
           active,
           url,
         });
         return newTab;
    },
    getActiveTab: async () => {
         // 匹配条件是 currentWindow 当前窗口的 active 激活的标签页
         // 由于该方法返回的是一个数组，但是激活的标签页只有一个，因此可以使用解构获取该数组唯一的一个元素
         const [tab] = await chrome.tabs.query({
           active: true,
           currentWindow: true,
         });
         return tab;
    },
    update: async (id, url) => {
        await chrome.tabs.update(id, {url})
    },
    activeTab: async (id) => {
      await chrome.tabs.update(id, {selected: true})
    },
    queryTab: async (queryObj) => {
        return await chrome.tabs.query(queryObj)
    },
    removeTab: async (id) => {
        return await chrome.tabs.remove(id)
    },
    getTab: async (id) => {
        return await chrome.tabs.get(id)
    }
}