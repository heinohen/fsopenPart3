
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
var morgan = require('morgan')
const express = require('express')
const app = express()
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

// Otetaan json-parseri käyttöön
app.use(express.json())

// Kovakoodatut henkilöt
let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },     
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-50-42"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "040-5555446"
    },
    {
        id: 4,
        name: "Arton Äiti",
        number: "123321"
    }
]

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
app.get('/info', (request, response) => {
    const date = Date()
    response.send(
        `<div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date}
        </div>`
    )
})



// Kaikki resurssit listattuna
app.get('/api/persons', (request, response) => {
    response.json(persons)
})
// Yksittäisen resurssin haku:
// tehdään route,
// muistiinpanon identifioi URL, joka on muotoa /api/persons/10 lopussa oleva luku vastaa resurssin
// muistiinpanon id:tä

// voimme määritellä Expressin routejen poluille parametreja käyttämällä kaksoispistesyntaksia:
// Nyt app.get('/api/persons/:id',...) käsittelee kaikki HTTP GET -pyynnöt jotka ovat muotoa
// api/persons/JOTAIN, jossa JOTAIN on mielivaltainen merkkijono
app.get('/api/persons/:id', (request,response) => {
// Polun parametrin id arvoon päästään käsiksi pyynnön tiedot kertovan olion request kautta
    
    // Täytyy olla Number(...), muuten ei voi verrata id:tä
    const id = Number(request.params.id)
    console.log(id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

// Resurssin poisto:
// Poisto tapahtuu tekemällä HTTP DELETE pyyntö resurssin urliin
// 3.4 Toteuta toiminnallisuus, jonka avulla puhelinnumerotieto on mahdollista poistaa
// numerotiedon yksilöivään URL:iin tehtävällä HTTP DELETE pyynnöllä
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const pers = persons.filter(p => p.id === id)
// jos löydetään id niin tämä ei ole tyhjä
    if (pers.length > 0) {
        console.log(pers)
        console.log(id, 'found')
        persons = persons.filter(person => person.id !== id)
        console.log(`entry found... deleting id ${id}`)
        response.status(204).end()
    } else {
        console.log('not found, response 404')
        response.status(404).end()
    }
    // jos poisto onnistuu vastataan statuskoodilla 204 "no content"
})

// Datan vastaanottaminen:
// Vastaanotto (serverin pääty)
// Generoidaan jokaiselle henkilölle oma id
const generateId = () => {return Math.floor(Math.random() * (9999999 - 1) + 1)}

app.post('/api/persons', (request, response) => {

// Jos vastaanotetulta datalta puuttuu sisältö kentästä
// content, vastataan statuskoodilla 400 bad request
    
// 3.6 Tee uuuden numeron lisäykseen virheiden käsittely.
// Pyyntö ei saa onnistua, jos
// * nimi tai numero puuttuu
// * lisättävä on jo luettelossa
    const body = request.body
// tsekataan onko nimi jo
    const nameScan = persons.filter(p => p.name.toLocaleLowerCase() === body.name.toLowerCase())
// tsekataan puuttuuko nimi tai onko nimi tyhjä
    if (!body.name || body.name.length === 0) {
        return response.status(400).json({
            error: 'name missing'
        })
    } else if (nameScan.length > 0) {
        return response.status(400).json({
            error: 'duplicate name'
        })
// tsekataan puuttuuko numero tai onko numero tyhjä
    } else if (!body.number || body.number.length === 0 ) {
        return response.status(400).json({
            error: 'number missing'
        })
    }
// luodaan person objekti
    const person = {
// 3.5 generoi uuden puhelintiedon tunniste Math.randomilla
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    // console.log(note)
    // console.log(request.headers)
    response.json(person)
})

// Palvelimen kuunneltava portti
const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server is runnin' on port ${PORT}`)
})