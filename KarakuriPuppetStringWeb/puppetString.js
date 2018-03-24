const socket = new WebSocket('ws://127.0.0.1:8888/string?token=1212')

const appKeyboard = new Vue({
    el: '#app-keyboard',
    data: {
        keyboardInput: ''
    },
    methods: {
        sendInput: function () {
            const data = {
                content: this.keyboardInput
            }
            socket.send('0' + JSON.stringify(data))
        }
    }
})

const appTouchpad = new Vue({
    el: '#app-touchpad',
    data: {
        pointerData: {}
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
        },
        pointerUp: function (e) {
            if (typeof this.pointerData[e.pointerId] === "undefined") {
                return
            }
            if (performance.now() - this.pointerData[e.pointerId].lastTime < 300) {
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
                    this.pointerData[e.pointerId].lastX = e.clientX
                    this.pointerData[e.pointerId].lastY = e.clientY
                    socket.send('1' + JSON.stringify(data))
                    break
                case 2:
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
                                delta: (this.pointerData[pointer0Id].deltaX + this.pointerData[pointer1Id].deltaX) / 4.0
                            }
                            socket.send('9' + JSON.stringify(data))
                        } else if ((Math.abs(this.pointerData[pointer0Id].deltaX) < Math.abs(this.pointerData[pointer0Id].deltaY)) &&
                            (Math.abs(this.pointerData[pointer1Id].deltaX) < Math.abs(this.pointerData[pointer1Id].deltaY))) {
                            const data = {
                                delta: (this.pointerData[pointer0Id].deltaY + this.pointerData[pointer1Id].deltaY) / 4.0
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
        },
    }
})