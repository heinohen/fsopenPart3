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
    // 3.20* 
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: function(v) {
                return /\d{2,3}-\d{7,}/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.__v
        delete returnedObject._id
    }
})

module.exports = mongoose.model('Person', personSchema)



