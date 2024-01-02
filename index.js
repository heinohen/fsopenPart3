
// 3.1 Tee Node-sovellus joka tarjoaa osoitteessa
// http://localhost:3001/api/persons
// kovakoodatun taulukon puhelinnumerotietoja

// Sovellus pitää pystyä käynnistämään 'npm start'
// Käynnistettäessä 'npm run dev' sovelluksen tulee käynnistyä uudelleen, kun koodiin tehdään muutoksia
// "scripts": {
//     "start": "node index.js",
//     "dev": "nodemon index.js",

// otetaan käyttöön express, joka on tällä kertaa funktio,
// jota kutsumalla luodaan muuttujaan app sijoitettava Express-sovellusta vastaava olio
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')

require('dotenv').config()

const Person = require('./models/person')


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

// Otetaan käyttöön error handleri
const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    
    if (error.name === 'CastError') {
        return response.status(404).send( { error: 'malformatted id' } )
    } else if (error.name === 'ValidationError') {
        return response.status(400).json( { error: error.message })
    }
}

// Otetaan käyttöön unknown endpoist
const unknownEndpoint = (request, response) => {
    response.status(404).send( { error: 'unknown endpoint '})
}

app.use(cors())
// Otetaan json-parseri käyttöön
app.use(express.json())
app.use(requestLogger)
app.use(express.static('dist'))

// Otetaan middleware käyttöön toistaiseksi sellaisella konfiguraatiolla,
// joka sallii kaikista origineista tulevat pyynnöt kaikkiin backendin Express routeihin:
// 3.7
// Lisää sovellukseesi loggausta tekevä middleware morgan.
// Konfiguroi se logaamaan konsoliin tiny-konfiguraation mukaisesti.
// ---> app.use(morgan('tiny'))
// 3.8*: puhelinluettelon backend step8
// Konfiguroi morgania siten, että se näyttää myös HTTP POST ‑pyyntöjen
// mukana tulevan datan
// POST /api/persons 200 61 - 4.896 ms {"name":"Liisa Marttinen","number":"040-243563"}

// **To define a token, simply invoke morgan.token()
// ** with the name and a callback function. This callback function is expected to
// ** return a string value.
// ** The value returned is then available as ":type" in this case:
// ** example morgan.token('type', function (req, res) { return req.headers['content-type'] })
// ** express 
// 3. 	req.body 
// It contains key-value pairs of data submitted in the request body.
// By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser.
morgan.token('body', (req, res) => 
    req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] :response-time ms - :body'))

// Määritellään sovellukselle kaksi routea:

// 1) Määrittelee tapahtumankäsittelijän, 
// joka hoitaa sovelluksen juureen eli polkuun '/' tulevia HTTP GET pyyntöjä
/**
 * @param request sisältää kaikki HTTP-pyynnön tiedot
 * @param response määrittelee miten pyyntöön vastataan
 */
// Käytetään response-olion metodia send, jonka kutsumisen seurauksena palvelin vastaa HTTP-pyyntöön
// lähettämällä selaimelle vastaukseksi send:in parametriä olevan merkkijonon.
// KOSKA parametri on merkkijono, asettaa Express vastauksessa Content-Type-headerin arvoksi text/html.
// Statuskoodiksi tulee oletusarvoisesti 200.
app.get('/', (request,response) => {
    response.send('<h1>Phonebook main</h1>')
})

// 3.2
// Tee sovellukseen osoitteseen http://localhost:3001/info suunnilleen
// sivu jonka tulee kertoa pyynnön tekohetki, sekä se kuinka monta puhelinluettelotietoa sovelluksen muistissa olevassa taulukossa on
// saadaa palautettua persons.lenghtillä paljonko siellä on
// Date() antaa js:ssä tämän ajan
app.get('/info', (request, response, next) => {
    Person.find({}).then(persons => {
    
        const date = Date()
        response.send(
            `<div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${date}
            </div>
            `
        )
    })
    .catch((error) => next(error))
})



// Kaikki resurssit listattuna
// TIETOKANTAVERSIO
app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        console.log(persons.length)
        response.json(persons)
    })

})

// Muutetaan nyt kaikki operaatiot tietokantaa käyttävään versioon
// UUSI NUMERO
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})



// Yksittäisen resurssin haku:
// TIETOKANTAVERSIO
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
// Siirretään virheiden käsittely next:ille (expressin virheidenkäsittelijä)
        .catch((error) => next(error))
})

// Resurssin poisto:
// Poisto tapahtuu tekemällä HTTP DELETE pyyntö resurssin urliin
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch((error) => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id,
        { name, number},
        {new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch((error) => next(error))
}) 

app.use(unknownEndpoint)
app.use(errorHandler)


// Palvelimen kuunneltava portti
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is runnin' on port ${PORT}`)
})