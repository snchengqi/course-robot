import {config} from '../util/config.js'

class Course {

    start() {}
}

class CommonCourse extends Course {

    start() {
        if (!hasCourseNeedCountinue()) {
            notifyFinish()
            return
        }
        startCourse()
        checkSituation()
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

const currentFinish = () => {
    const itemDom = currentNode().lastElementChild.lastElementChild
    const type = itemDom.firstElementChild.innerHTML
    const status = itemDom.lastElementChild.lastElementChild.innerHTML
    return (status === '重新学习') || (type === '考试' && status !== '参与考试')
}

const changeVideoIfNecessary = () => {
    if (currentFinish()) {
        const nextCourse = Array.from(document.getElementsByClassName('chapter-list-box')).filter(item => {
            const innerDom = item.lastElementChild.lastElementChild
            const type = innerDom.firstElementChild.innerHTML
            const status = innerDom.lastElementChild.lastElementChild.innerHTML
            return (type === '视频' || type === '文档') && status !== '重新学习'
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

const checkSituation = () => {
    const taskId = setInterval(() => {
        const needCoutinue = hasCourseNeedCountinue()
        if (!needCoutinue) {
            clearInterval(taskId)
            notifyFinish()
        } else {
            changeVideoIfNecessary()
        }
        const node = currentNode()
        const courseName = node.getElementsByClassName('text-overflow')[0].innerText
        window.document.title = `🔵正在播放【${courseName}】`
    }, 1000)
}

const hasCourseNeedCountinue = () => {
    const lists = Array.from(document.getElementsByClassName('chapter-list-box'))
    const needCoutinue = lists.some(item => {
        const innerDom = item.lastElementChild.lastElementChild
        const type = innerDom.firstElementChild.innerHTML
        const status = innerDom.lastElementChild.lastElementChild.innerHTML
        return (type === '视频' || type === '文档') && status !== '重新学习'
    })
    return needCoutinue
}

const notifyFinish = () => {
    chrome.runtime.sendMessage({event: 'finishStudyCourse'})
}

export const createCourse = () => {
    return new Promise((resolve) => {
        const currentUrl = window.location.href
        const urlPrefix = `${config.baseUrl}/#/study/course/detail`
        if (!currentUrl || currentUrl.indexOf(urlPrefix) !== 0) {
            resolve(new OtherCourse())
            return
        }
        const taskId = setInterval(() => {
            const domCollection = document.getElementsByClassName('chapter-list-box')
            if (domCollection && domCollection.length > 0) {
                clearInterval(taskId)
                const lists = Array.from(domCollection)
                const hasCourse = lists.some(item => {
                    const innerDom = item.lastElementChild.lastElementChild
                    const type = innerDom.firstElementChild.innerHTML
                    return type === '视频'|| type === '文档'
                })
                const course = hasCourse? new CommonCourse(): new OtherCourse()
                resolve(course)
            }
        }, 1000);
    })
}