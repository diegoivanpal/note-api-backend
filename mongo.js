const mongoose = require('mongoose')

const conectionString = process.env.MONGO_DB_URI


mongoose.connect(conectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
.then(() => {
    console.log('Database connected')
}).catch(err => {
    console.error(err)
})

