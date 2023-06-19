const socket = io()

class Message {
    constructor() {
        this.Message = document.createElement("li")
        this.Message.className = "main-message"
        this.Message.textContent = " "

        document.getElementById("Messages").appendChild(this.Message)
    }

    _writeMessage(content, current) {
        if (current < (content.length + 1)) {
            const myPromise = new Promise((res) => {
                setTimeout(() => {
                    res()
                    this.Message.textContent = content.substr(0, current)
                }, 10)
            })

            myPromise.then(() => {
                this._writeMessage(content, (current + 1))
            })
        }
    }
}

setTimeout(() => {
    document.addEventListener("keydown", (ev) => {
        if (ev.key.toLocaleLowerCase() == "enter") {
            const input = document.getElementById("MessageInput")
            let content = input.value.toString()
    
            if (content.length > 0) socket.emit("chat-msg", content)
            input.value = ""
        }
    })
    
    document.querySelector("#SendButton").addEventListener("click", (ev) => {
        const input = document.getElementById("MessageInput")
        let content = input.value.toString()
    
        if (content.length > 0) socket.emit("chat-msg", content)
        input.value = ""
    })
}, 50)

socket.on("chat-msg", (msg) => {
    const currentMessage = new Message()
    currentMessage._writeMessage(msg, 0)

    const messages = document.getElementById("Messages")

    messages.scrollTop = messages.scrollHeight
})