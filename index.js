require('dotenv').config()
require('./mongo.js')


const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/Note.js')
const User = require('./models/User.js')


const { response, request } = require('express')
const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleErrors.js')
const userExtractor = require('./middleware/userExtractor')

const loginRouter = require('./controllers/login.js')
const usersRouter = require('./controllers/users.js')



app.use(cors())
app.use(express.json())



app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', async (request, response, next) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  
  response.json(notes)
  // Note.find({}).then(notes => {
  //   response.json(notes)
  // }).catch(err => {
  //   next(err)
  // })

})

app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findById(id).then(note => {

    if (note) {
      return response.json(note)
    } else {
      response.status(404).end()
    }

  }).catch(err => {
    next(err)
  })


})


app.put('/api/notes/:id', userExtractor, (request, response, next ) => {
  const { id } = request.response
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, {new: true})
    .then(result => {
      response.json(result)
    }).catch(err => {
      next(err)
    })


})

app.delete('/api/notes/:id', userExtractor, async (request, response, next) => {
  const { id } =  request.params
  try{
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }



    // Note.findByIdAndDelete(id).then( () => {
    //     response.status(204).end()
    //   }).catch(error => next(error))


})


app.post('/api/notes', userExtractor, async (request, response, next) => {
  //const note = request.body
  const  {
    content, 
    important = false
  } = request.body

  const { userId } = request 

  const user = await User.findById(userId)
 

  if (!content) {
    return response.status(400).json({
      error: 'require content field is missing'
    })
  }

// const newNote = new Note ({
//   content: note.content,
//   date: new Date(),
//   important: note.important || false
// })

const newNote = new Note ({
  content,
  date: new Date(),
  important,
  user: user._id
})

//  newNote.save().then(savedNote => {
//    response.json(savedNote)
//  }).catch(err => {
//   next(err)
// })
  try {
    const savedNote = await newNote.save()
     
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.json(savedNote)
  } catch (error) {
    next(error)
  }

  })

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)  

app.use(notFound)



app.use(handleErrors)

const PORT = process.env.PORT || 3001
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }