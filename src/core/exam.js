import {waitUtil} from '../util/common.js'

let interval = null

// #/exam/exam/answer-paper
if (location.hash.match('#/exam/exam/answer-paper')) {
  const allowDom = document.createElement('div')
  allowDom.id = 'allowSwitchAndCopy'
  allowDom.className = 'hand-save-btn themeColor-border-color themeColor-color'
  allowDom.innerText = '允许复制/切屏'
  allowDom.addEventListener('click', allowSwitchAndCopy)
  waitUtil(() => document.querySelector('.hand-save-btn'), () => {
      const submitDom = document.querySelector('.hand-save-btn')
      submitDom.parentNode.insertBefore(allowDom, submitDom)
  })
}
/**
 * 允许切屏和复制
 */
function allowSwitchAndCopy() {
  // 允许切屏
  allowSwitch()
  if (interval) {
    clearInterval(interval)
  }
  // 每 500 毫秒监控一次
  interval = setInterval(function () {
    // 允许复制
    allowCopy()
  }, 500)
  alert('✔已允许复制和切屏！')
}
 
 /**
       * 允许切屏
       */
 function allowSwitch() {
    window.onblur = null
    Object.defineProperty(window, 'onblur', {
      set: function (xx) {
        /* 忽略 */
      }
    })
  }

  /**
   * 允许复制
   */
  function allowCopy() {
    let previewContent = document.querySelector('.preview-content')
    previewContent.oncontextmenu = null
    previewContent.oncopy = null
    previewContent.oncut = null
    previewContent.onpaste = null
  }

  