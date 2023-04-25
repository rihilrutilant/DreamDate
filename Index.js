const connectToMongo = require("./db")
const express = require('express')
var cors = require('cors')
const app = express()
const port = 5000

connectToMongo();
app.use(cors())
app.use(express.json());

app.use("/api/user", require("./User/Routes/Userauth"))
app.use("/api/like_profile", require("./Selected_profile/Routes/selected_profile"))
app.use("/api/Connections", require("./Connection_history/Routes/Connection_history"))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

