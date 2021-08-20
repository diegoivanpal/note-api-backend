const supertest = require('supertest')
const { app } = require('../index')
const  User = require('../models/User')

const api = supertest(app)


const initialNotes = [
    {
        content: 'Aprendiendo Fullstach JS con midudev',
        important: true,
        date: new Date()

    },
    {
        content: 'Sigueme en htttp://midu.dev',
        important: true,
        date: new Date()        
    }
]

const getAllContentFromNotes = async () => {
    const response = await api.get('/api/notes') 

    return {
        contents: response.body.map(note => note.content),
        response
    } 
}

const getUsers = async () => {
    const userDB = await User.find({})
    return usersAtStart = userDB.map(user => user.toJSON())

}

module.exports = {
    api,
    initialNotes,
    getAllContentFromNotes,
    getUsers
}