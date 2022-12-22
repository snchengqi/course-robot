import {config} from '../util/config.js'

//专题顶层抽象
class Special {

    constructor() {
        this.notifyTaskId = undefined
    }

    chooseCourseAndStudy() { 
        this.startNotifyTask()
        const courseId = this.getCourses().shift()
        const course = document.getElementById(courseId)
        if (course) {
            course.click()
            setTimeout(() => {
                chrome.runtime.sendMessage({event: 'startStudyCourse'})
            }, 1000);
            return true
        } else {
            if (this.notifyTaskId) {
                clearInterval(this.notifyTaskId)
            }
            alert('已学完该专题所有课程，请学习其它专题！')
            chrome.runtime.sendMessage({event: 'stopWork'})
            return false
        }   
    }

    startNotifyTask() {
        if (!this.notifyTaskId) {
            this.notifyTaskId = setInterval(() => {
                chrome.runtime.sendMessage({event: 'checkCourse'})
            }, 1000);
        }
    }

    getCourses() {
    }
}

class CommonSpecial extends Special {

    constructor() {
        super()
        this.courses = this.findCourseDoms()
    }

    getCourses() {
        return this.courses
    }

    findCourseDoms() {
        const allCourses =  Array.from(document.getElementsByClassName('item current-hover'))
        const courses = allCourses.filter(item => {
            const status = item.lastElementChild.lastElementChild.firstElementChild.innerHTML
            return status === '继续学习' || status === '开始学习' || status === '学习中'
        }).map(item => item.id)
        return courses
    }
}

class FirstParticularSpecial extends Special {

    constructor() {
        super()
        this.courses = Array.from(document.querySelectorAll('.catalog-state-info .btn.small'))
                        .map(item => item.parentElement)
                        .map(item => item.id)
    }

    getCourses() {
        return this.courses
    }
}

class IllegalSpecial extends Special {

    chooseCourseAndStudy() {
        alert('该链接不是一个有效的专题，请结束并学习其它专题！')
        chrome.runtime.sendMessage({event: 'stopWork'})
        return false
    }  
}

const isNotSpecial = () => {
    const tipDom = document.querySelector('#content > div:nth-child(1) > div.content.drizzle-content > div > div.content-empty > p')
    return tipDom && tipDom.innerHTML === '您暂无该资源学习权限，去看看其它资源吧'
}

const isCommonSpecial = () => {
    const items = document.getElementsByClassName('item current-hover')
    return items && items.length > 0
}

const isFirstParticularSpecial = () => {
    const items = document.querySelectorAll('.catalog-state-info .btn.small')
    return items && items.length > 0
}

const complateInShcedule = (resolve, specail, taskId) => {
    resolve(specail)
    clearInterval(taskId)
}

//专题工厂方法
export const createSpecial = () => {
    return new Promise((resolve) => {
        const currentUrl = window.location.href
        const urlPrefix = `${config.baseUrl}/#/study/subject/detail`
        if (!currentUrl || currentUrl.indexOf(urlPrefix) !== 0) {
            resolve(new IllegalSpecial())
            return
        }
        const taskId = setInterval(() => {
            if (isNotSpecial()) {
                complateInShcedule(resolve, new IllegalSpecial(), taskId)
                return
            }
            if (isCommonSpecial()) {
                complateInShcedule(resolve, new CommonSpecial(), taskId) 
                return
            }
            if (isFirstParticularSpecial()) {
                complateInShcedule(resolve, new FirstParticularSpecial(), taskId) 
                return
            }
        }, 1000);
    })
}