const socketio = require("socket.io")
const express = require("express")
const http = require("http")
const path = require("path")
const fs = require("fs").promises

const app = express()
const server = http.createServer(app)
const socket = new socketio.Server(server)

const port = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname + "/public")))

const checkUser = async (database, user) => {
    try {
        const fileContent = await fs.readFile(database, "utf-8");
        const data = JSON.parse(fileContent);

        return data.some((obj) => obj.Username === user)

    } catch (err) {
        return false;
    }
}

const checkPassword = async (username, password) => {
    try {
        const fileContent = await fs.readFile("data/Users.json", "utf-8");
        const data = JSON.parse(fileContent);

        return Boolean(data.find((obj) => obj.Username === username && obj.Password === password))
    } catch (err) {
        return false;
    }
}

const save = async (database, content) => {
    const fileContent = await fs.readFile(database, "utf-8")
    let contentJSON = JSON.parse(fileContent)

    contentJSON.push(content)
    contentJSON = JSON.stringify(contentJSON)

    if (!contentJSON || !contentJSON.length) {
        contentJSON = []
    }

    await fs.writeFile(database, contentJSON, "utf-8", (err) => {
        if (err) throw err
        console.log("> Data saved")
    })
}

app.get("/", (req, res) => res.sendFile(path.join(__dirname + "/pages/options.html")))
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname + "/pages/signup.html")))
app.get("/login", (req, res) => res.sendFile(path.join(__dirname + "/pages/login.html")))
app.get("/home", (req, res) => res.sendFile(path.join(__dirname + "/pages/home.html")))

app.post("/SignUp", async (req, res) => {
    let isUser = await checkUser("data/Users.json", req.body.Username)

    if (!isUser) {
        await save("data/Users.json", req.body)
        return res.redirect("/home")
    } else return res.redirect("/");
})

app.post("/Login", async (req, res) => {
    let isUser = await checkUser("data/Users.json", req.body.Username)

    if (isUser) {
        let isValid = await checkPassword(req.body.Username, req.body.Password)

        if (isValid) res.redirect("/home"); else res.redirect("/");
    } else res.redirect("/")
})

socket.on("connection", (socket) => {
    console.log("> User connected")

    socket.on("chat-msg", (msg) => {
        save("data/Messages.json", msg)
        socket.emit("chat-msg", msg)
    })
})

server.listen(8080, () => {
    console.log(`> http://localhost:${port}`)
}) 