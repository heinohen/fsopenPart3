



// DO NOT USE
const mongoose = require('mongoose')

// Koodi siis olettaa että sille annetaan parametrinä MongoDB ATlasissa luodulle käyttäjälle määritelty salasana.
// Komentoriviparametriin se pääsee käsiksi seuraavasti:
const password = process.argv[2]
const nameOfDB = "Phonebook"
const url = `mongodb+srv://mongohenkka:${password}@isoklusteri.ms3ihqf.mongodb.net/${nameOfDB}?retryWrites=true&w=majority`


// Yhteyden luonti
mongoose.set('strictQuery', false)
mongoose.connect(url)

// Muistiinpanon skeema ja sitä vastaava model
// Ensin muuttujaan määritellään muistiinpanon skeema joka kertoo Mongooselle miten muistiinpano-oliot tulee tallettaa tietokantaan


// 3.19 muutokset
// validaatio namelle
const phonebookSchema = new mongoose.Schema({
    name : {
        type: String,
        minlenght: 3,
        required: true
    },
    number: String,
})

const Person = mongoose.model('Person', phonebookSchema)


// jos argumenttejä on vain 1 ==> listataan tietokannassa olevat
if (process.argv.length === 3) {
// Oliot haetaan kannasta Person-modelin metodilla 'find', metodin parametrinä on hakuehto
// KOSKA hakuehto on tyhjä olio === {}, saimme kannasta kaikki people-kokoelmaan talletetut oliot
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(p => {
            console.log(p.name, p.number)
        })
        mongoose.connection.close()
    })
} 
// jos argumenttejä on 3 lisätään content: seuraava arg important sitä seuraava
else if (process.argv.length === 5) {
// Modelin määrittelyssä ensimmäisenä parametrinä oleva merkkijono 'Person' määrittelee, että Mongoose tallettaa muistiinpanoa vastaavat oliot kokoelmaan 
// nimeltä people KOSKA
// Mongoosen konventiona on määritellä kokoelmien nimet monikossa (esim people) kun niihin viitataan skeeman määrittelyssä yksikkömuodossa (esim Person)
// Sovellus luo muistiinpanoa vastaavan model:in avulla muistiinpano-olion
// Modelit ovat ns. konstruktorifunktioita, jotka luovat parametrien perusteella JavaScript-olioita. Koska oliot on luotu modelien konstruktorifunktiolla,
// niillä on kaikki modelien ominaisuudet eli joukko metodeja, joiden avulla olioita voidaan mm. tallettaa tietokantaan.
    const person = new Person({
        name: process.argv[3], // komentoriviltä salasanan jälkeen seuraava argumentti
        number: process.argv[4], // ja sitä seuraava...
    })
// Tallettaminen tapahtuu metodilla save. Metodi palauttaa promisen
// jolle voidaan rekisteröidä then metodin avulla tapahtumankäsittelijä
    person.save().then(result => {
        console.log(`added ${result.name} number ${result.number}`)
// kun olio on tallennettu kantaan kutsutaan thenin parametrinä olevaa tapahtumankäsittelijää joka sulkee tietokantayhteyden
// HUOM ilman sulkemista ohjelman suoritus ei pääty!
        mongoose.connection.close()
    })
}
