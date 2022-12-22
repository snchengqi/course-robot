export const stoargeUtil = {
    get: key => {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.get([key], result => {
                    try {
                        resolve(result[key])
                    } catch (error) {
                        reject(error)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    set: obj => {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.set(obj, () => {
                    try {
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}