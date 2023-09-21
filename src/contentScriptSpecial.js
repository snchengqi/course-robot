'use strict';
import {createSpecial} from './core/special.js'

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

let special

const startListenMessage = () => {
    chrome.runtime.onMessage.addListener(async ({event}, sender, sendResponse) => {
        if (event === 'nextCourse') {
            const result = await special.chooseCourseAndStudy()
            sendResponse({farewell: result})
        }
    })
}

//initialization function
(async () => {
    special = await createSpecial()
    startListenMessage()
    await special.chooseCourseAndStudy()
})()

