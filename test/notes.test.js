const mongoose = require('mongoose')

const { server } = require('../index')

const Note = require('../models/Note')

const { api, initialNotes, getAllContentFromNotes } = require('./helpers')





beforeEach(async () => {
    await Note.deleteMany({})

    //paralel
    // const notesObjects = initialNotes.map(note => new Note(note))
    // const promises = notesObjects.map(note => note.save())
    // await Promise.all(promises)

    //sequential

    for(const note of initialNotes) {
        const notesObject = new Note(note)
        await notesObject.save()
    }

    // const note1 = new Note(initialNotes[0])
    // await note1.save()

    // const note2 = new Note(initialNotes[1])
    // await note2.save()

})

describe('GET all notes', () => {
    test('notes are returned as json', async () => {
        await api
             .get('/api/notes')
             .expect(200)
             .expect('Content-type', /application\/json/)
     }) 
     
     test('there are two notes', async () => {
         const response = await api.get('/api/notes')
         expect(response.body).toHaveLength(initialNotes.length)
     })
     
     test('the first note is about midudev', async () => {
         const response = await api.get('/api/notes')
         expect(response.body[0].content).toBe('Aprendiendo Fullstach JS con midudev')
     })
     
     test('There is a note about midudev', async () => {
         const {contents} = await getAllContentFromNotes()
         expect(contents).toContain('Aprendiendo Fullstach JS con midudev')
     })

})

describe('Post api/notes', () => {
    test('a valis note can be added', async() => {
        const newNote = {
            content: 'proximamente async/await',
            important: true
        }
    
        await api
            .post('/api/notes')
            .send(newNote)
            .expect(200)
            .expect('Content-type', /application\/json/)
            
        const  {contents, response } = await getAllContentFromNotes()
        expect(response.body).toHaveLength(initialNotes.length +1)
    
        expect(contents).toContain(newNote.content)
    
    })

    test('a note without content is not added', async() => {
        const newNote = {
           
            important: true
        }
    
        await api
            .post('/api/notes')
            .send(newNote)
            .expect(400)
            
        const response = await api.get('/api/notes') 
    
        expect(response.body).toHaveLength(initialNotes.length)
        
    })

})





test('A note can be delete', async () => {
    const { response: firstResponse } = await getAllContentFromNotes()
    const { body: notes } = firstResponse
    const noteToDelete = notes[0]

    await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)
    
    const { contents, response: secondResponse } = await getAllContentFromNotes()
    expect(secondResponse.body).toHaveLength(initialNotes.length-1) 
    expect(contents).not.toContain(noteToDelete.content)


})

test('A note can not be delete', async () => {
   

    await api
        .delete(`/api/notes/1234`)
        .expect(400)
    
    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length) 
    


})

v