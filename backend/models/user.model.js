const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    createdOn: {
        type: Date, 
        default: new Date().getTime() 
    }
})


userSchema.pre('save', async function(){
    const user = this;
    if(!user.isModified('password')){
        next()
    }

    try{
        const saltRound = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(this.password, saltRound)
        this.password = hashPassword
    }
    catch(error){
        next(error)
    }
})

userSchema.methods.generateToken = async function(){
    try{
        return 
    }
    catch(error){

    }
}

module.exports = mongoose.model("User", userSchema)