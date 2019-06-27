const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/tasks')
const router = new express.Router()

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
router.patch('/tasks/:id',async (req,res)=>{
    const allowedupdates = ['description','completed']
    const update = Object.keys(req.body)
    const isvalidupdate = update.every((update)=> allowedupdates.includes(update))
    if(!isvalidupdate){
        return res.status(400).send({error : 'Invalid update'})
    }
    try{
        const task = await Task.findById(req.params.id)
        update.forEach((update)=> task[update] = req.body[update])
        await task.save()
        
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch(e){
        res.status(400).send()
    }

})
router.delete('/tasks/:id',async (req,res)=>{
    try{
        const task = await Task.findByIdAndDelete(req.params.id)
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch(e){
        res.status(500).send()
    }
})

module.exports = router