///Users/Aadarsh/mongodb/bin/mongod.exe run this before in separate terminal
const app = require('./app')
const port = process.env.PORT

app.listen(port,()=>{
    console.log('Server is up on port '+port)
})
