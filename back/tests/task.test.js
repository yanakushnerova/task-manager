const request = require('supertest');
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, userTwo, taskOne, taskTwo, taskThree, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('should create task for user', async () => {
    const response = await request(app)
        .post('/users/' + userOneId + '/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'example task'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('should return tasks for all users', async () => {
    const response = await request(app)
        .get('/users/' + userOne._id + '/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)
})

test('should not delete task of another user', async () => {
    const response = await request(app)
        .delete('/users/' + userTwo._id + '/tasks/' + taskTwo._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
})

//TODO
// Mock emails
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks
