const request = require('supertest');
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Test',
            email: 'test@example.com',
            password: 'testpass'
        })
        .expect(201)

    //assert that user was saved to database
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //assert about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Test',
            email: 'test@example.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('testpass')
})

test('should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    //assert that token in response matches the second token
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login nonexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'email@example.com',
            password: 'password'
        })
        .expect(400)
})

test('should get profile for user', async () => {
    await request(app)
        .get('/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/profile')
        .send()
        .expect(401)
})

test('should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //assert than null response is returned
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delete account for user', async () => {
    await request(app)
        .delete('/users/profile')
        .send()
        .expect(401)
})

test('should upload avatar image', async () => {
    await request(app)
        .post('/users/' + userOneId + '/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', './tests/fixtures/kriska.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Update Name'
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe(response.body.name)
})

test('should not update for unauthenticated user', async () => {
    const response = await request(app)
        .patch('/users/profile')
        .send({
            name: 'Update Name'
        })
        .expect(401)
})

test('should not update with invalid information', async () => {
    const response = await request(app)
        .patch('/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'dkfjasdljfdf'
        })
        .expect(400)
})

//TODO
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated
