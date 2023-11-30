'use strict';

import './popup.css';
import {stoargeUtil} from './util/storage.js'
import {config} from './util/config.js'

const validUrl =  require('valid-url')
const startWorkText = '开始学习'
const stopWorkText = '结束学习'
const baseUrlPattern = config.baseUrlPattern
// https://kc.zhixueyun.com/#/study/subject/detail/52d4b3dd-b6c9-4b33-b86e-1ea132aedfc6

const startWork = (specialTopicIpt, startWorkBtn) => {
  specialTopicIpt.disabled = true
  startWorkBtn.innerHTML = stopWorkText
  startWorkBtn.disabled = false
  stoargeUtil.set({specialTopic: specialTopicIpt.value, btnText: startWorkBtn.innerHTML})
  chrome.runtime.sendMessage({event: 'startWork', specialTopic: specialTopicIpt.value})
}

const stopWork = (specialTopicIpt, startWorkBtn) => {
  specialTopicIpt.disabled = false
  startWorkBtn.innerHTML = startWorkText
  startWorkBtn.disabled = false
  stoargeUtil.set({specialTopic: specialTopicIpt.value, btnText: startWorkBtn.innerHTML})
  chrome.runtime.sendMessage({event: 'stopWork', specialTopic: specialTopicIpt.value})
}

const initStatus = (specialTopicIpt, startWorkBtn, specialTopic, btnText) => {
  btnText = btnText? btnText: startWorkText
  specialTopicIpt.value = specialTopic? specialTopic: ''
  startWorkBtn.innerHTML = btnText
  if (btnText === startWorkText) {
    if (specialTopicIpt.value === '') {
      startWorkBtn.disabled = true
    } else {
      startWorkBtn.disabled = false
    }
    specialTopicIpt.disabled = false
  } else {
    specialTopicIpt.disabled = true
  }
}

const initPopup = async () => {
  const specialTopicIpt = document.getElementById('special_topic_ipt')
  const startWorkBtn = document.getElementById('start_work_btn')
  let specialTopic = await stoargeUtil.get('specialTopic')
  let btnText = await stoargeUtil.get('btnText')
  initStatus(specialTopicIpt, startWorkBtn, specialTopic, btnText)
  specialTopicIpt.addEventListener('input', () => {
    specialTopic = specialTopicIpt.value
    const regExp = new RegExp(`^${baseUrlPattern}/[^]*$`, 'g')
    if (specialTopic && specialTopic !== '' && validUrl.isWebUri(specialTopic) && regExp.test(specialTopic)) {
      startWorkBtn.disabled = false
    } else {
      startWorkBtn.disabled = true
    }
  }) 
  startWorkBtn.addEventListener('click', () => {
    if (startWorkBtn.innerHTML === '开始学习') {
      startWork(specialTopicIpt, startWorkBtn)
    } else {
      stopWork(specialTopicIpt, startWorkBtn)
    }
  }) 
}

(async() => {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  await initPopup()
})()
