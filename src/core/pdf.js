import {waitUtil} from '../util/common.js'

if (location.hash.match('#/study/course/detail')) {
    waitUtil(() => typeof PDFJS !== 'undefined', () => {
        console.log('PDFJS loaded')
        // 保存原始的 PDFViewer 构造函数
        let OriginalPDFViewer = PDFJS.PDFViewer
     
        // 替换 PDFViewer 构造函数以进行拦截
        PDFJS.PDFViewer = function(options) {
            console.log('PDFViewer instance created')
     
            // 创建 PDFViewer 实例
            let instance = new OriginalPDFViewer(options)
            window.pdfViewer = instance
     
            // 返回修改后的 PDFViewer 实例
            return instance
        };
    })
    
    setInterval(() => {
        
        const fullScreenDiv = document.querySelector('.title-screen')
        let downloadDiv = document.querySelector('#download')
        // console.log('pdfViewer')
        // console.log(window.pdfViewer)
        // console.log('fullScreenDiv')
        // console.log(fullScreenDiv)
        if (window.pdfViewer && fullScreenDiv && !downloadDiv) {
            downloadDiv = document.createElement('div')
            downloadDiv.id = 'download'
            downloadDiv.className = 'iconfont icon-xiazai2 m-left'
            downloadDiv.title = '下载'
            downloadDiv.addEventListener('click', downloadPdf)
    
            fullScreenDiv.parentNode.insertBefore(downloadDiv, fullScreenDiv)
        }
    }, 1000)
}

const downloadPdf = () => {
    const pdfViewer = window.pdfViewer
    pdfViewer.pdfDocument.getData().then((data) => {
        const blob = new Blob([data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)

        // 创建一个下载链接
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = document.querySelector('.other-toolbar .other-title').innerText || 'document.pdf' // 设置文件名
        document.body.appendChild(a)

        // 触发点击事件以下载文件
        a.click()

        // 清理URL对象以释放内存
        window.URL.revokeObjectURL(url)
    })
}