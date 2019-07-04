const mongoose = require('mongoose')
const validator = require('validator')
const taskSchema = mongoose.Schema({
    description :{
        type : String,
        trim : true,
        required : true,

    },
    completed : {
        type : Boolean,
        default : false
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    picture :{
        type : Buffer
    }
},{
    timestamps:true
})

const Tasks = mongoose.model('Tasks',taskSchema)

module.exports = Tasks