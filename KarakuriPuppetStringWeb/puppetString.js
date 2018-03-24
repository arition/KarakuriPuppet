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
            this.pointerData[e.pointerId].touching = true
        },
        pointerUp: function (e) {
            if (typeof this.pointerData[e.pointerId] === "undefined") {
                return
            }
            this.pointerData[e.pointerId].touching = false
        },
        pointerMove: function (e) {
            if (typeof this.pointerData[e.pointerId] === "undefined") {
                return
            }
            if (this.pointerData[e.pointerId].touching) {
                const data = {
                    deltaX: e.clientX - this.pointerData[e.pointerId].lastX,
                    deltaY: e.clientY - this.pointerData[e.pointerId].lastY
                }
                this.pointerData[e.pointerId].lastX = e.clientX
                this.pointerData[e.pointerId].lastY = e.clientY
                //console.log(data)
                //console.log(this.pointerData)
                socket.send('1' + JSON.stringify(data))
            }
        },
        leftMouseDown: function () {
            socket.send('2')
        },
        leftMouseUp: function () {
            socket.send('3')
        },
        rightMouseDown: function () {
            socket.send('4')
        },
        rightMouseUp: function () {
            socket.send('5')
        },
    }
})