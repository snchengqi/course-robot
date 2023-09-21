'use strict';
import {tabUtil} from './util/tab.js'
import {stoargeUtil} from './util/storage.js'

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const findCourseTab = async (specialTabId) => {
  const allTabs = await tabUtil.queryTab({})
  const [tab] = allTabs.filter(item => item.openerTabId && item.openerTabId === specialTabId)
  return tab
}

const notifyNextCourse = () => {
  return new Promise((resolve) => {
    stoargeUtil.get('specialTabId').then(specialTabId => {
      chrome.tabs.sendMessage(specialTabId, {event: 'nextCourse'}, function(response) {
        resolve(response.farewell)
      })
    })
  })
}

const stopWork = async () => {
  const specialTabId = await stoargeUtil.get('specialTabId')
  const courseTabId = await stoargeUtil.get('courseTabId')
  if (courseTabId) {
    try {
      await tabUtil.removeTab(courseTabId)
    } catch (error) {
      console.warn(error)
    }
  }
  if (specialTabId) {
    try {
      await tabUtil.removeTab(specialTabId)
    } catch (error) {
      console.warn(error)
    }
  }
  stoargeUtil.set({btnText: '开始学习'})
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  const event = request.event
  if (event === 'startWork') {
    const tab = await tabUtil.createNewTab(true, request.specialTopic)
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['contentScriptSpecial.js']
    })
    await stoargeUtil.set({specialTabId: tab.id})
  } else if (event === 'stopWork') {
    await stopWork()
  } else if (event === 'startStudyCourse') {
    const specialTabId = await stoargeUtil.get('specialTabId')
    const courseTab = await findCourseTab(specialTabId)
    if (!courseTab) {
      //结束工作
      await stopWork()
      return
    }
    chrome.scripting.executeScript({
      target: {tabId: courseTab.id},
      files: ['contentScriptCourse.js']
    })
    await stoargeUtil.set({courseTabId: courseTab.id, courseTabUrl: courseTab.url})
  } else if (event === 'finishStudyCourse') {
    await tabUtil.removeTab(sender.tab.id)
    const notifyResult = await notifyNextCourse()
    if (!notifyResult) {
      await stopWork()
      //结束工作
    }
  } else if (event === 'checkCourse') {
    try {
      const courseTabId = await stoargeUtil.get('courseTabId')
      const courseTabUrl = await stoargeUtil.get('courseTabUrl')
      if (courseTabId && courseTabUrl) {
        const newCourseTab = await tabUtil.getTab(courseTabId)
        if (newCourseTab) {
          const newCourseTabUrl = newCourseTab.url
          if (courseTabUrl !== newCourseTabUrl) {
            console.warn(`the url of tab:${courseTabId} has changed, before:${courseTabUrl}, after:${newCourseTabUrl}`)
            await tabUtil.removeTab(courseTabId)
            const notifyResult = await notifyNextCourse()
            if (!notifyResult) {
              await stopWork()
              //结束工作
            }
          }
        }
      }
    } catch (error) {
      console.warn(error)
    }
  }
})
