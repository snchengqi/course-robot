export const waitMoment = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time);
    })
}

export const waitDom = (selector) => {
    return new Promise(resolve => {
        const dom = document.querySelector(selector)
        if (dom) {
            resolve(dom)
            return
        }
        const taskId = setInterval(() => {
            const dom = document.querySelector(selector)
            if (dom) {
                clearInterval(taskId)
                resolve(dom)
            }
        }, 500);
    })
}

export const waitUtil = (condition, func) => {
    return new Promise(resolve => {
        if (condition()) {
            if (func) {
                func()
            }
            resolve()
            return
        }
        const taskId = setInterval(() => {
            // console.log('condition')
            // console.log(condition())
            if (condition()) {
                if (func) {
                    func()
                }
                clearInterval(taskId)
                resolve()
            }
        }, 500);
    })
}

export const doUntil = (condition, func) => {
    return new Promise(resolve => {
        if (condition()) {
            resolve()
            return
        }
        const taskId = setInterval(() => {
            if (condition()) {
                clearInterval(taskId)
                resolve()
            }
            if (func) {
                func()
            }
        }, 500);
    })
}