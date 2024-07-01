import {config} from '../util/config.js'

class Course {

    start() {}
}

class CommonCourse extends Course {

    start() {
        if (!this.hasCourseNeedCountinue()) {
            notifyFinish()
            return
        }
        startCourse()
        this.checkSituation()
    }

    parseInnerDom(item) {
        // return item.lastElementChild.lastElementChild
        return item.lastElementChild.children[1]
    }

    parseType(innerDom) {
        return innerDom.firstElementChild.innerHTML
    }

    parseStatus(innerDom) {
        return innerDom.lastElementChild.lastElementChild.innerHTML
    }

    isCompleted(status) {
        return status === '重新学习' || status === '已完成'
    }

    hasCourseNeedCountinue() {
        const lists = Array.from(document.getElementsByClassName('chapter-list-box'))
        const needCoutinue = lists.some(item => {
            const innerDom = this.parseInnerDom(item)
            const type = this.parseType(innerDom)
            const status = this.parseStatus(innerDom)
            return (type === '视频' || type === '文档') && !this.isCompleted(status)
        })
        return needCoutinue
    }

    checkSituation() {
        const taskId = setInterval(() => {
            const needCoutinue = this.hasCourseNeedCountinue()
            if (!needCoutinue) {
                clearInterval(taskId)
                notifyFinish()
            } else {
                this.changeVideoIfNecessary()
            }
            const node = currentNode()
            const courseName = node.getElementsByClassName('text-overflow')[0].innerText
            window.document.title = `🔵正在播放【${courseName}】`
        }, 1000)
    }

    changeVideoIfNecessary() {
        if (this.currentFinish()) {
            const nextCourse = Array.from(document.getElementsByClassName('chapter-list-box')).filter(item => {
                const innerDom = this.parseInnerDom(item)
                const type = this.parseType(innerDom)
                const status = this.parseStatus(innerDom)
                return (type === '视频' || type === '文档') && !this.isCompleted(status)
            }).shift()
            if (nextCourse) {
                nextCourse.click()
                setTimeout(() => {
                    startCourse()
                }, 1000);
            } 
        } else {
            //有些电脑太卡，初始化时播放不了，用于兜底
            startCourse()
        }
    }

    currentFinish() {
        const innerDom = this.parseInnerDom(currentNode())
        const type = this.parseType(innerDom)
        const status = this.parseStatus(innerDom)
        return (this.isCompleted(status)) || (type === '考试' && status !== '参与考试')
    }
}

class NewVersionCourse extends CommonCourse {

    parseType(innerDom) {
        return innerDom.firstElementChild.children[1].innerHTML
    }

    parseStatus(innerDom) {
        if (innerDom.firstElementChild.children[3]) {
            return '未完成'
        } 
        return '已完成'
    }
}

class OtherCourse extends Course {

    start() {
        console.log('This is not a common course')
        setTimeout(() => {
            notifyFinish()
        }, 1000);
    }
}

const findVideo = () => {
    return Array.from(document.getElementsByTagName('video'))[0]
}

const startCourse = () => {
    const video = findVideo()
    if (video) {
        video.muted = true
        video.play()
    }
}

const currentNode = () => {
    return document.getElementsByClassName('chapter-list-box focus')[0]
}

const notifyFinish = () => {
    chrome.runtime.sendMessage({event: 'finishStudyCourse'})
}

export const createCourse = () => {
    return new Promise((resolve) => {
        const currentUrl = window.location.href
        const urlRegExp = new RegExp(`^${config.baseUrlPattern}/#/study/course/detail/[^]*$`, 'g')
        if (!currentUrl || !urlRegExp.test(currentUrl)) {
            resolve(new OtherCourse())
            return
        }
        const taskId = setInterval(() => {
            const domCollection = document.getElementsByClassName('chapter-list-box')
            if (domCollection && domCollection.length > 0) {
                clearInterval(taskId)
                const lists = Array.from(domCollection)
                let hasCourse = lists.some(item => {
                    // const innerDom = item.lastElementChild.lastElementChild
                    const innerDom = item.lastElementChild.children[1]
                    const type = innerDom.firstElementChild.innerHTML
                    return type === '视频'|| type === '文档'
                })
                if (hasCourse) {
                    resolve(new CommonCourse())
                    return
                }
                hasCourse = lists.some(item => {
                    const innerDom = item.lastElementChild.children[1]
                    const type = innerDom.firstElementChild.children[1].innerHTML
                    return type === '视频'|| type === '文档'
                })
                if (hasCourse) {
                    resolve(new NewVersionCourse())
                    return
                }
                resolve(new OtherCourse())
            }
        }, 1000);
    })
}