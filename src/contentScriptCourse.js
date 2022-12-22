import {createCourse} from './core/course.js'

(async () => {
    const course  = await createCourse()
    course.start()
})()