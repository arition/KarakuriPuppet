var socket = null

Vue.component('app-keyboard', {
    data: function () {
        return {
            keyboardInput: '',
            volumeIcon: 'volume_off'
        }
    },
    methods: {
        sendInput: function () {
            const data = {
                content: this.keyboardInput
            }
            socket.send('0' + JSON.stringify(data))
            this.keyboardInput = ''
        },
        togglePlay: function () {
            const audio = document.querySelector("#app #audioSource")
            if (this.volumeIcon == 'volume_off') {
                this.volumeIcon = 'volume_up'
                audio.play()
                setTimeout(function () {
                    audio.currentTime = audio.buffered.end(0)
                }, 100)
            } else {
                this.volumeIcon = 'volume_off'
                audio.pause()
            }
        }
    },
    template: document.querySelector("#app-keyboard").innerHTML
})

Vue.component('app-touchpad', {
    data: function () {
        return {
            pointerData: {}
        }
    },
    methods: {
        pointerDown: function (e) {
            if (typeof this.pointerData[e.pointerId] === "undefined") {
                this.pointerData[e.pointerId] = {}
            }
            this.pointerData[e.pointerId].lastX = e.clientX
            this.pointerData[e.pointerId].lastY = e.clientY
            this.pointerData[e.pointerId].deltaX = 0
            this.pointerData[e.pointerId].deltaY = 0
            this.pointerData[e.pointerId].processed = false
            this.pointerData[e.pointerId].lastTime = performance.now()
            this.pointerData[e.pointerId].moved = false
        },
        pointerUp: function (e) {
            if (typeof this.pointerData[e.pointerId] === "undefined") {
                return
            }
            if (!this.pointerData[e.pointerId].moved && (performance.now() - this.pointerData[e.pointerId].lastTime < 200)) {
                socket.send('2')
            }
            delete this.pointerData[e.pointerId]
        },
        pointerMove: function (e) {
            if (typeof this.pointerData[e.pointerId] === "undefined") {
                return
            }
            switch (Object.keys(this.pointerData).length) {
                case 1:
                    const data = {
                        deltaX: e.clientX - this.pointerData[e.pointerId].lastX,
                        deltaY: e.clientY - this.pointerData[e.pointerId].lastY
                    }
                    if (data.deltaX == 0 && data.deltaY == 0) {
                        return
                    }
                    this.pointerData[e.pointerId].moved = true
                    this.pointerData[e.pointerId].lastX = e.clientX
                    this.pointerData[e.pointerId].lastY = e.clientY
                    socket.send('1' + JSON.stringify(data))
                    break
                case 2:
                    this.pointerData[e.pointerId].moved = true
                    this.pointerData[e.pointerId].deltaX = e.clientX - this.pointerData[e.pointerId].lastX
                    this.pointerData[e.pointerId].deltaY = e.clientY - this.pointerData[e.pointerId].lastY
                    this.pointerData[e.pointerId].lastX = e.clientX
                    this.pointerData[e.pointerId].lastY = e.clientY
                    this.pointerData[e.pointerId].processed = true
                    const pointer0Id = Object.keys(this.pointerData)[0]
                    const pointer1Id = Object.keys(this.pointerData)[1]
                    if (this.pointerData[pointer0Id].processed && this.pointerData[pointer1Id].processed) {
                        if ((Math.abs(this.pointerData[pointer0Id].deltaX) > Math.abs(this.pointerData[pointer0Id].deltaY)) &&
                            (Math.abs(this.pointerData[pointer1Id].deltaX) > Math.abs(this.pointerData[pointer1Id].deltaY))) {
                            const data = {
                                delta: (this.pointerData[pointer0Id].deltaX + this.pointerData[pointer1Id].deltaX) / 2.0
                            }
                            socket.send('9' + JSON.stringify(data))
                        } else if ((Math.abs(this.pointerData[pointer0Id].deltaX) < Math.abs(this.pointerData[pointer0Id].deltaY)) &&
                            (Math.abs(this.pointerData[pointer1Id].deltaX) < Math.abs(this.pointerData[pointer1Id].deltaY))) {
                            const data = {
                                delta: (this.pointerData[pointer0Id].deltaY + this.pointerData[pointer1Id].deltaY) / 2.0
                            }
                            socket.send('8' + JSON.stringify(data))
                        }
                        this.pointerData[pointer0Id].processed = false
                        this.pointerData[pointer1Id].processed = false
                    }
                    break

            }
        },
        leftMouseDown: function () {
            socket.send('3')
        },
        leftMouseUp: function () {
            socket.send('4')
        },
        rightMouseDown: function () {
            socket.send('6')
        },
        rightMouseUp: function () {
            socket.send('7')
        }
    },
    template: document.querySelector("#app-touchpad").innerHTML
})

Vue.component('app-serverList', {
    data: function () {
        return {
            serverList: JSON.parse(localStorage.getItem(serverList))
        }
    },
    methods: {

    }
})

const appMain = Vue.component('app-main', {
    props: ['host', 'token'],
    mounted: function () {
        this.$nextTick(function () {
            this.initWebSocket()
        })
    },
    /*watch: {
        '$route': 'initWebSocket'
    },*/
    methods: {
        initWebSocket: function () {
            socket = new WebSocket('ws://' + this.host + '/string?token=' + this.token)
            socket.binaryType = "arraybuffer"
            const audio = document.querySelector("#app #audioSource")
            const mediaSource = new MediaSource()

            audio.src = URL.createObjectURL(mediaSource)
            audio.pause()

            mediaSource.addEventListener('sourceopen', function () {
                const queue = []
                const buffer = mediaSource.addSourceBuffer('audio/mpeg')

                buffer.addEventListener('update', function () { // Note: Have tried 'updateend'
                    if (queue.length > 0 && !buffer.updating) {
                        buffer.appendBuffer(queue.shift())
                    }
                })

                socket.addEventListener('message', function (e) {
                    if (audio.paused) {
                        buffer.abort()
                        queue.length = 0
                    } else {
                        if (buffer.updating || queue.length > 0) {
                            queue.push(e.data)
                        } else {
                            buffer.appendBuffer(e.data)
                        }
                        if (audio.buffered.length != 0) {
                            if ((audio.buffered.end(0) - audio.currentTime) > 0.4) {
                                audio.currentTime = audio.buffered.end(0)
                            }
                        }
                    }
                })
            })
        }
    },
    template: document.querySelector("#app-main").innerHTML
})

document.querySelector('#templates').innerHTML = ''
const router = new VueRouter({
    routes: [{
        path: '/',
        component: appMain,
        props: {
            host: '127.0.0.1:8888',
            token: '1212'
        }
    }]
})

new Vue({
    router
}).$mount('#app')