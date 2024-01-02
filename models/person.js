const mongoose = require('mongoose')
mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI

console.log('connecting to, ', url)
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB!')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB ', error.message)
    })

    // 3.19 lisätty validointi nimen pituudelle
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: [true, "Name must have at least 3 characters"]
    },
    number: String
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.__v
        delete returnedObject._id
    }
})

module.exports = mongoose.model('Person', personSchema)



