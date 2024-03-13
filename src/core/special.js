import {config} from '../util/config.js'
import {waitUtil, doUntil} from '../util/common.js'

const urlSubjectPattren = `^${config.baseUrlPattern}/#/study/subject/detail/[^]*$`
const urlTrainNewPattren = `^${config.baseUrlPattern}/#/train-new/[^]*$`
const urlSubjectRegExp = new RegExp(urlSubjectPattren, 'g')
const urlTrainNewRegExp = new RegExp(urlTrainNewPattren, 'g')
//专题顶层抽象
class Special {

    constructor() {
        this.notifyTaskId = undefined
    }

    async chooseCourseAndStudy() { 
        this.startNotifyTask()
        const courseIds = await this.getCourses()
        const courseId = courseIds.shift()
        const course = document.getElementById(courseId)
        if (course) {
            console.log(course)
            course.click()
            const courseName = this.getCourseName(course)
            window.document.title = `🟦正在学习【${courseName}】`
            setTimeout(() => {
                chrome.runtime.sendMessage({event: 'startStudyCourse'})
            }, 1000);
            return true
        } else {
            if (this.notifyTaskId) {
                clearInterval(this.notifyTaskId)
            }
            alert('✔已学完该专题所有课程，请学习其它专题！')
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

    async getCourses() {
    }
    
    getCourseName(course) {
        
    }
}

class CommonSpecial extends Special {

    constructor() {
        super()
        this.courses = this.findCourseDoms()
    }

    async getCourses() {
        return this.courses
    }
    
    getCourseName(course) {
        return course.getElementsByClassName('name-des')[0].innerText
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

class TrainNewSpecial extends Special {

    constructor() {
        super()
        this.activityIndex = 0
        this.activityCount = this.findActivityDoms().length
    }

    async getCourses() {
        if (this.courses && this.courses.length > 0) {
            return this.courses
        }
        while (this.activityIndex < this.activityCount) {
            const activityDom = this.findActivityDoms()[this.activityIndex]
            const triggerDom = activityDom.lastElementChild.firstElementChild.lastElementChild
            if (triggerDom.getAttribute('title') === '展开') {
                triggerDom.click()
                const condition = () => this.findActivityDoms()[this.activityIndex].lastElementChild.firstElementChild.lastElementChild !== '展开'
                await waitUtil(condition)
            }
            await doUntil(() => {
                const noMore = this.findActivityDoms()[this.activityIndex].getElementsByClassName('no-more')
                return noMore && noMore.length > 0
            }, () => {
                let loadMoreDoms = this.findActivityDoms()[this.activityIndex].getElementsByClassName('btn load-more pointer')
                if (loadMoreDoms && loadMoreDoms.length > 0) {
                    loadMoreDoms[0].click()
                }
            })
            const courseItemDoms = Array.from(this.findActivityDoms()[this.activityIndex].getElementsByClassName('train-citem'))
            const courses = courseItemDoms.filter(item => {
                const status = item.firstElementChild.lastElementChild.innerText
                return status === '未完成'
            }).map(item => item.firstElementChild.children[1].firstElementChild)
            .map(item => item.id)
            this.activityIndex++
            if (courses && courses.length > 0) {
                this.courses = courses
                return this.courses
            }
        }
        return []
    }

    getCourseName(course) {
        return course.getElementsByClassName('title-name')[0].innerText
    }

    findActivityDoms() {
        return Array.from(document.getElementsByClassName('section'))
    }
}

class FirstParticularSpecial extends Special {

    constructor() {
        super()
        this.courses = Array.from(document.querySelectorAll('.catalog-state-info .btn.small'))
                        .map(item => item.parentElement)
                        .map(item => item.id)
    }

    async getCourses() {
        return this.courses
    }

    getCourseName(course) {
        return course.parentElement.parentElement.getElementsByClassName('text-overflow title')[0].lastElementChild.innerText
    }
}

class IllegalSpecial extends Special {

    async chooseCourseAndStudy() {
        alert('⚠该链接不是一个有效的专题，请结束并学习其它专题！')
        chrome.runtime.sendMessage({event: 'stopWork'})
        return false
    }  
}

const isNotSpecial = () => {
    const tipDom = document.querySelector('#content > div:nth-child(1) > div.content.drizzle-content > div > div.content-empty > p')
    return tipDom && tipDom.innerHTML === '您暂无该资源学习权限，去看看其它资源吧'
}

const isCommonSpecial = () => {
    const currentUrl = window.location.href
    const items = document.getElementsByClassName('item current-hover')
    // return currentUrl.indexOf(urlPrefixSubject) === 0 && items && items.length > 0
    return urlSubjectRegExp.test(currentUrl) && items && items.length > 0
}

const isTrainNewSpecial = () => {
    const currentUrl = window.location.href
    const items = document.getElementsByClassName('section')
    // return currentUrl.indexOf(urlPrefixTrainNew) === 0 && items && items.length > 0
    return urlTrainNewRegExp.test(currentUrl) && items && items.length > 0
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
        if (!currentUrl || (!urlSubjectRegExp.test(currentUrl) && !urlTrainNewRegExp.test(currentUrl))) {
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
            if (isTrainNewSpecial()) {
                complateInShcedule(resolve, new TrainNewSpecial(), taskId) 
                return
            }
            if (isFirstParticularSpecial()) {
                complateInShcedule(resolve, new FirstParticularSpecial(), taskId) 
                return
            }
        }, 1000);
    })
}