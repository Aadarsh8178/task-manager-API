const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const Task = require('./tasks')
const jwt = require('jsonwebtoken')
const userschema = mongoose.Schema({
    name :{
        type: String,
        required : true,
        trim: true,

    },
    age:{ 
        type : Number,
        validate(value){
            if(value<0){
                throw new Error('Negative number not allowed') 
            }  
        },
        default : 0  
    },
    email : {
        type : String,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email')
            }
        },
        trim : true,
        required : true,
        lowercase : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minlength : 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('Try something else')
            }
        },
        trim : true
    },
    tokens : [{
        token :{
            type : String,
            required : true
        }
    }],
    avatar :{
        type : Buffer
    }
},{
    timestamps:true
})


userschema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userschema.virtual('tasks',{ 
    ref :'Tasks',
    localField :'_id',
    foreignField :'owner'
})

//Generating tokens
userschema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//Logging in a User
userschema.statics.findbyCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}
//deleting tasks for the user
userschema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner : user._id})
    next()
})
//Hashing the password before saving
userschema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})
const User = mongoose.model('Users',userschema)

module.exports = User