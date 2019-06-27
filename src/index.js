///Users/Aadarsh/mongodb/bin/mongod.exe run this before in separate terminal
const express = require('express')
require('./db/mongoose.js');
const User = require('./models/users')
const Task = require('./models/tasks')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const port = process.env.PORT

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Server is up on port '+port)
})
