require('dotenv').config()

require('./mongo.js')


const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/Note.js')
const { response, request } = require('express')
const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleErrors.js')

app.use(cors())
app.use(express.json())



app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
  
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


app.put('/api/notes/:id', (request, response, next ) => {
  const { id } = request.response
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, {new: true})
    .then(result => {
      response.json(result)
    })


})

app.delete('/api/notes/:id', (request, response, next) => {
  const { id } =  request.params
  
  Note.findByIdAndDelete(id).then( () => {
    response.status(204).end()
  }).catch(error => next(error))
  
  
})


app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note.content) {
    return response.status(400).json({
      error: 'require content field is missing'
    })
  }
  
const newNote = new Note ({
  content: note.content,
  date: new Date(),
  important: note.important || false
})

 newNote.save().then(savedNote => {
   response.json(savedNote)
 })

  })


app.use(notFound)



app.use(handleErrors)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
