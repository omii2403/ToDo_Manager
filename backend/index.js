require('dotenv').config();

// const config = require('./config.json')
const mongoose = require('mongoose')

mongoose.connect(process.env.CONNECTION_STRING)
console.log("Connected")
const User = require("./models/user.model")
const Note = require("./models/note.model")

const express = require('express') 
const cors = require('cors')
const app = express()

const jwt = require('jsonwebtoken')
const { authenticateToken } = require('./utilities')
const bcrypt = require("bcryptjs")
app.use(express.json())


app.use(
    cors(
        {
            origin:"*",
        }
    )
)

// test
app.get("/", (req, res) => {
    res.json({data: "Hello"});
})

// account create
app.post('/create-account', async(req, res) => {
    // res.send("Hello")
    const {name, email, password} = req.body
    
    const isUser = await User.findOne( { email: email });

    if(isUser){
        return res.json({
            user: isUser,
            error: true,
            message: "User already exists"
        })
    }


    const user = new User({name, email, password})
    await user.save()

    const accessToken = jwt.sign( {user}, `${process.env.ACCESS_TOKEN_SECRET}`, {
        expiresIn: "1hr",
    })

    return res.json({
        error: false, 
        user, 
        accessToken,
        message: "Registration Successful"
    })

})

// login
app.post('/login', async(req, res) => {
    const {email, password} = req.body;
    
    const userInfo = await User.findOne({email: email})

    if(!userInfo){
        return res.status(400).json( {message: "User not found"} )
    }

    const isValid = await bcrypt.compare(password, userInfo.password)
    if(isValid){
        const user = { user: userInfo }
        const accessToken = jwt.sign(user, `${process.env.ACCESS_TOKEN_SECRET}`, {
            expiresIn: "1hr",
        })

        return res.json({
            error: false,
            message: "Successfully Logged In!",
            email,
            accessToken
        })
    }
    else{
        return res.status(400).json({
            error: true,
            message: "Invalid Credentials!"
        })
    }
})

app.post('/logout', async(req, res) => {
    try{

    }
    catch(err){
        return res.status(500).json({
            error: true,
            message: "Someting went wrong!"
        })
    }
})

// get user
app.post('/get-user', authenticateToken, async(req, res) => {
    const { user } = req.user

    const isUser = await User.findOne({_id: user._id})

    if(!isUser){
        return res.sendStatus(401)
    }

    return res.json({
        error: false,
        user: {
            name: isUser.name,
            email: isUser.email
        }
    })
})

// Add Note
app.post('/add-note', authenticateToken, async(req, res) => {
    const { title, content } = req.body
    const { user } = req.user
    const isPinned = false;

    try{
        const note = new Note({
            title, 
            content,
            isPinned,
            userId: user._id
        })
        await note.save()
        return res.json({
            erorr: false,
            message: "Note added successfully!"
        })
    }
    catch(error){
        return res.status(500).json({
            error: true, 
            message: "Error adding the note. Please try Again!"
        })
    }
})

// Edit Note
app.put('/edit-note/:noteId', authenticateToken, async(req, res) => {
    const noteId = req.params.noteId
    const {title, content, isPinned} = req.body
    const {user} = req.user

    try{
        const note = await Note.findOne({_id: noteId, userId: user._id})

        if(!note){
            return res.status(404).json(
                {
                    erorr: true,
                    message: "Note not found"
                }
            )
        }

        if(title)   note.title = title
        if(content)   note.content = content
        if(isPinned)   note.isPinned = isPinned

        await note.save()

        return res.json({
            error: false, 
            note,
            message: "Changes Saved Successfully!"
        })
    }
    catch(error){
        res.status(500).json({
            error: true, 
            message: "Error saving the changes. Please try again!"
        })
    }
})

// Get all notes
app.post('/all-notes', authenticateToken, async(req, res) => {
    const { user } = req.user

    try{
        const notes = await Note.find( { userId: user._id}).sort({isPinned:1})
        

        return res.json({
            error: false,
            notes,
            message: "Notes fetched successfully!"
        })
    }
    catch(error){
        return res.status(500).json({
            error: true,
            message: "Error fetching the notes. Please try again!"
        })
    }
})

// Delete note
app.post('/delete-note/:noteId', authenticateToken, async(req, res) => {
    const noteId = req.params.noteId
    const { user } = req.user

    try{
        const note = await Note.findOne( {_id: noteId, userId: user._id})
        await Note.deleteOne( {_id: noteId, userId: user._id}).then(
            () => {
                return res.json({
                    error: true, 
                    message: "Note deleted successfully!"
                })
            }
        )
    }
    catch(error){
        return res.status(500).json({
            error: true,
            message: "Errordeleting the note!"
        })
    }
})

// pin notes
app.post('/update-pinned-note/:noteId', authenticateToken, async(req, res) => {
    const noteId = req.params.noteId
    const {isPinned} = req.body
    const {user} = req.user

    try{
        const note = await Note.findOne({_id: noteId, userId: user._id})
        
        if(!note){
            return res.status(404).json(
                {
                    erorr: true,
                    message: "Note not found"
                }
            )
        }

        note.isPinned = !isPinned

        await note.save()

        return res.json({
            error: false, 
            note,
            message: "Pinned Successfully!"
        })

        
    }
    catch(error){
        res.status(500).json({
            error: true, 
            message: "Error. Please try again!"
        })
    }
})


const PORT = 8000
app.listen(PORT)

module.exports = app;