const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/tasks')
const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router()


const upload = multer({
    limits : {
        fileSize : 1000000
    },
    fileFilter(req,file,cb){

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a jpg,jpeg or a png file'))
        }
        cb(undefined,true)
    }
})

router.post('/tasks',auth,async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(e)
    }
})
//GET tasks?completed=true&limit=1&skip=2&sortBy=createdBy:desc
router.get('/tasks',auth,async (req,res)=>{
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed==='true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'?-1:1
    }
    try{
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e){
        res.status(500).send()
    }
})
router.get('/tasks/:id',auth,async (req,res)=>{
    try{
        const task = await Task.findOne({_id :req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch(e){
        res.status(500).send()
    }
})
router.patch('/tasks/:id',auth,async (req,res)=>{
    const allowedupdates = ['description','completed']
    const update = Object.keys(req.body)
    const isvalidupdate = update.every((update)=> allowedupdates.includes(update))
    if(!isvalidupdate){
        return res.status(400).send({error : 'Invalid update'})
    }
    try{
        const task = await Task.findOne({_id:req.params.id,owner : req.user._id})
        
        if(!task){
            return res.status(404).send()
        }
        update.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch(e){
        res.status(400).send()
    }

})
router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch(e){
        res.status(500).send()
    }
})
router.post('/tasks/:id/picture',auth,upload.single('picture'),async (req,res)=>{

    const task = await Task.findOne({_id:req.params.id,owner : req.user._id})
    if(!task){
        return res.status(404).send()
    }
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    task.picture = buffer
    await task.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error : error.message})
})
router.delete('/tasks/:id/picture',auth,async (req,res)=>{
    const task = await Task.findOne({_id:req.params.id,owner : req.user._id})
    task.picture = undefined
    await task.save()
    res.send()
})
router.get('/tasks/:_id/picture',async (req,res)=>{
    try{
        const task = await Task.findById(req.params._id)
        if(!task||!task.picture){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(task.picture)
    } catch(e){ 
        res.status(404).send()
    }
})

module.exports = router