const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/users/:userId/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        'userId': req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send()
    }
})
 
//GET /tasks?completed=
//GET /tasks?limit= &skip=
//GET /tasks?sortBy=createdAt:desc
router.get('/users/:userId/tasks', auth, async (req, res) => {
    try {
        const match = {}
        const sort = {}

        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        })
        
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:userId/tasks/:taskId', auth, async (req, res) => {
    const _id = req.params.taskId

    try {
        const task = await Task.findOne({_id, userId: req.user._id})
        
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/:userId/tasks/:taskId', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send('Invalid update information')
    }
    
    try {
        const task = await Task.findOne({ _id: req.params.taskId, userId: req.user._id})
        console.log(req.params.taskId)
        console.log(req.user._id)
        if (!task) {
            return res.status(404).send()
        }
        
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/:userId/tasks/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.taskId, userId: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
