const mongoose = require('mongoose')
const { server } = require('../index')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { api, getUsers } = require('./helpers')
const { post } = require('../controllers/users')


describe('creating a new user', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('pswd', 10)
        const user = new User({
            username: 'miduroot',
            passwordHash
        })

        await user.save()
    })

    test('works as expected creating  a fresh user', async () => {
        
        const usersAtStart = await getUsers()

        const newUser = {
            username: 'midudev',
            name: 'Miguel',
            password: 'tw1tch'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        
        const usersAtEnd = await getUsers()

        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
        
        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username) 
    })

    test('creation fails with proper statuscode and message if name is already taken', async () => {
        const usersAtStart = await getUsers()
        const newUser = {
            username: 'miduroot',
            name: 'Ivan',
            password: '1234'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        expect(result.body.errors.username.message).toContain('`username` to be unique')

        const usersAtEnd = await getUsers()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)


    })
})

afterAll(() => {
    mongoose.connection.close()
    server.close()
})