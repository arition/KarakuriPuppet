let socket = null

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
            const audio = document.querySelector('#app #audioSource')
            if (this.volumeIcon === 'volume_off') {
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
    template: document.querySelector('#app-keyboard').innerHTML
})

Vue.component('app-touchpad', {
    data: function () {
        return {
            pointerData: {}
        }
    },
    methods: {
        pointerDown: function (e) {
            if (typeof this.pointerData[e.pointerId] === 'undefined') {
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
            if (typeof this.pointerData[e.pointerId] === 'undefined') {
                return
            }
            if (!this.pointerData[e.pointerId].moved && (performance.now() - this.pointerData[e.pointerId].lastTime < 200)) {
                socket.send('2')
            }
            delete this.pointerData[e.pointerId]
        },
        pointerMove: function (e) {
            if (typeof this.pointerData[e.pointerId] === 'undefined') {
                return
            }
            switch (Object.keys(this.pointerData).length) {
                case 1:
                    const data = {
                        deltaX: e.clientX - this.pointerData[e.pointerId].lastX,
                        deltaY: e.clientY - this.pointerData[e.pointerId].lastY
                    }
                    if (data.deltaX === 0 && data.deltaY === 0) {
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
    template: document.querySelector('#app-touchpad').innerHTML
})

const appServerList = Vue.component('app-serverList', {
    data: function () {
        return {
            serverList: JSON.parse(localStorage.getItem('serverList'))
        }
    },
    methods: {
        listClick: function (host, token) {
            localStorage.setItem('host', host)
            localStorage.setItem('token', token)
            this.$router.push('/main')
        },
        addClick: function () {
            this.$router.push('/login')
        }
    },
    template: document.querySelector('#app-serverList').innerHTML
})

const appLogin = Vue.component('app-login', {
    data: function () {
        return {
            host: '',
            token: '',
            hostInvalid: false,
            tokenInvalid: false,
            loginFailed: false,
            loginFailedMessage: 'Cannot connect to this server'
        }
    },
    methods: {
        login: function () {
            this.loginFailed = false
            this.hostInvalid = false
            this.tokenInvalid = false
            if (this.host === '' || this.host === null) {
                this.hostInvalid = true
            }
            if (this.token === '' || this.token === null) {
                this.tokenInvalid = true
            }
            if (this.hostInvalid || this.tokenInvalid) return
            socket = new WebSocket('ws://' + this.host + '/echo?token=' + this.token)
            socket.addEventListener('error', () => {
                this.loginFailed = true
                this.loginFailedMessage = 'Cannot connect to this server'
                socket.close()
            })
            socket.addEventListener('message', e => {
                if (e.data === '-') {
                    let serverList
                    try {
                        serverList = JSON.parse(localStorage.getItem('serverList'))
                    } catch (ex) {
                        serverList = []
                    }
                    if (!Array.isArray(serverList)) {
                        serverList = []
                    }
                    serverList.push({
                        host: this.host,
                        token: this.token
                    })
                    localStorage.setItem('serverList', JSON.stringify(serverList))
                    localStorage.setItem('host', this.host)
                    localStorage.setItem('token', this.token)
                    socket.close()
                    this.$router.push('/main')
                } else {
                    this.loginFailed = true
                    this.loginFailedMessage = 'Cannot connect to this server'
                    socket.close()
                }
            })
            socket.addEventListener('close', e => {
                if (e.code === 4000) {
                    this.loginFailed = true
                    this.loginFailedMessage = 'Token error'
                }
            })
            socket.addEventListener('open', function (e) {
                socket.send('-')
            })
        }
    },
    template: document.querySelector('#app-login').innerHTML
})

const appMain = Vue.component('app-main', {
    data: function () {
        return {
            host: localStorage.getItem('host'),
            token: localStorage.getItem('token')
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.initWebSocket()
        })
    },
    methods: {
        initWebSocket: function () {
            socket = new WebSocket('ws://' + this.host + '/string?token=' + this.token)
            socket.binaryType = 'arraybuffer'
            const audio = document.querySelector('#app #audioSource')
            const mediaSource = new MediaSource()

            // reset src to avoid chrome stop playing 
            audio.addEventListener('error', () => {
                audio.src = URL.createObjectURL(mediaSource)
                audio.play()
            })

            audio.src = URL.createObjectURL(mediaSource)
            audio.pause()

            mediaSource.addEventListener('sourceopen', function () {
                const queue = []

                const audioSocket = new WebSocket('ws://' + this.host + '/audio?token=' + this.token)
                audioSocket.send('0')

                const audioStreamSocket = new WebSocket('ws://' + this.host + '/audio/stream?token=' + this.token)
                audioStreamSocket.binaryType = 'arraybuffer'

                audioSocket.addEventListener('message', function (e) {
                    let buffer = null
                    if (e.data === 'MP3') {
                        buffer = mediaSource.addSourceBuffer('audio/mpeg')
                    } else if (e.data === 'AAC') {
                        buffer = mediaSource.addSourceBuffer('audio/aac')
                    }

                    buffer.addEventListener('update', function () { // Note: Have tried 'updateend'
                        if (queue.length > 0 && !buffer.updating) {
                            buffer.appendBuffer(queue.shift())
                        }

                        audioSocket.addEventListener('message', function (e) {
                            if (audio.paused) {
                                buffer.abort()
                                queue.length = 0
                            } else {
                                if (buffer.updating || queue.length > 0) {
                                    queue.push(e.data)
                                } else {
                                    buffer.appendBuffer(e.data)
                                }
                                if (audio.buffered.length !== 0) {
                                    if ((audio.buffered.end(0) - audio.currentTime) > 0.4) {
                                        audio.currentTime = audio.buffered.end(0)
                                    }
                                }
                            }
                        })
                    })
                })
            })
        },
        home: function () {
            this.$router.push('/')
        }
    },
    template: document.querySelector('#app-main').innerHTML
})

document.querySelector('#templates').innerHTML = ''
const router = new VueRouter({
    routes: [
        {
            path: '/main',
            component: appMain
        },
        {
            path: '/login',
            component: appLogin
        },
        {
            path: '/',
            component: appServerList
        }
    ]
})

new Vue({
    router
}).$mount('#app')