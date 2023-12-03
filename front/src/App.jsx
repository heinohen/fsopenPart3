import { useEffect, useState } from 'react'
import PersonList from './components/PersonList'
import Search from './components/Search'
import PersonForm from './components/PersonForm'
import personService from './services/persons'
import './index.css'
import Notification from './components/Notification'


const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [showFiltered, setFiltered] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [errorOrSuccess, setErrorOrSuccess] = useState('')


  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
      setPersons(initialPersons)
    })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()

// Tällä hetkellä luetteloon lisättäviä uusia numeroita ei synkronoida palvelimelle.
//  Korjaa tilanne.
// &&
// Muuta toiminnallisuutta siten, että jos jo olemassa olevalle henkilölle lisätään numero, korvaa lisätty numero aiemman numeron.
// Korvaaminen kannattaa tehdä HTTP PUT ‑pyynnöllä.
// Jos henkilön tiedot löytyvät jo luettelosta, voi ohjelma kysyä käyttäjältä varmistuksen:

// Filteröidään olemassa olevaa nimilistaa jos löytyy matchi (lowercase to lowercase)
    let matchedName = persons.filter(person => person.name.toLowerCase() === newName.toLowerCase());

    if (matchedName.length !== 0) {
// lista ei ole tyhjä joten samalla nimellä (ehkä eri kirjoitusasulla) löytyy
      
      console.log("found match: " + '\n', matchedName[0], '\n', "asking to replace...")
// kysytään korvataanko numero
      if (window.confirm(`Found number with name: ${matchedName[0].name}, replace the name with a new one ? `)) {
        console.log('----> yes')
// luodaan uusi olio spreadilla (nimi ja id tulee sieltä) ja asetetaan samalla numeroksi newNumber
        const toBeAdded = {
          ...matchedName[0],
          number: newNumber }

          console.log('replacing <----')
// kutsutaan axionin updatea
        personService
          .update(toBeAdded.id, toBeAdded)
// palautuksen tultua ilmoitetaan siitä
          .then(returnedPerson => {
            console.log(`success <---- ${returnedPerson.name} updated number from ${matchedName[0].number} to ${returnedPerson.number}`)
// asetetaan nimilistaan map komennolla joko alkuperäinen person tai sitten kun kohdataan id match päivitetään tiedot
            setPersons(persons.map(person => person.id !== toBeAdded.id ? person : returnedPerson))
            setNewName('')
            setNewNumber('')
            setNotificationMessage(
              `Person '${returnedPerson.name}' was successfully updated on server`
              )
              setErrorOrSuccess(false)
              setTimeout(() => {
                setNotificationMessage(null)
                setErrorOrSuccess(null)
            }, 5000)
          })
      }

      else {console.log('----> no')}

    }
// jos ei matchia löytynyt ja listan pituus on siis 0, lisätään uusi henkilö listaan normaalisti
// luodaan uusi olio ja kutsutaan axionin createa personServicen kautta
    else {
          const personObject = {
            name: newName,
            number: newNumber
          }
            personService
              .create(personObject)
              .then(returnedPerson => {
                setPersons(persons.concat(returnedPerson))
                setNewName('')
                setNewNumber('')
// Toteuta osan 2 esimerkin parempi virheilmoitus tyyliin ruudulla muutaman sekunnin näkyvä ilmoitus,
// joka kertoo onnistuneista operaatioista (henkilön lisäys ja poisto sekä numeron muutos)
                setNotificationMessage(
                  `Person '${returnedPerson.name}' was successfully added to server`
                  )
                  setErrorOrSuccess(false)
                  setTimeout(() => {
                    setNotificationMessage(null)
                    setErrorOrSuccess(null)
                }, 5000)
            })
      }
  }

  const handleSearch = (event) => {
    setFiltered(event.target.value)
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }
  
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleDeletePerson = (id) => {
    const pers = persons.filter(person => person.id === id)
    console.log(`lets delete ${pers[0].name} with id ${pers[0].id}`)
// Tee ohjelmaan mahdollisuus yhteystietojen poistamiseen.
// Poistaminen voi tapahtua esim. nimen yhteyteen liitetyllä napilla.
// Poiston suorittaminen voidaan varmistaa käyttäjältä window.confirm-metodilla:
    if (window.confirm(`delete ${pers[0].name}? <-----`)) {
      console.log('----> yes')
      personService
        .eliminate(pers[0].id)
        .then(() => {
          setNotificationMessage(`Successfully deleted ${pers[0].name} from server!`)
          setErrorOrSuccess(false)
          setPersons(persons.filter(person => person.id !== pers[0].id))
          console.log('success <------ ')
          setTimeout(() => {
            setNotificationMessage(null)
            setErrorOrSuccess(null)
          }, 5000)
        })
// Avaa sovelluksesi kahteen selaimeen. Jos poistat jonkun henkilön selaimella 1
// hieman ennen kuin yrität muuttaa henkilön numeroa selaimella 2, tapahtuu virhetilanne
// Korjaa ongelma osan 2 esimerkin promise ja virheet hengessä ja siten,
// että käyttäjälle ilmoitetaan operaation epäonnistumisesta.
// Onnistuneen ja epäonnistuneen operaation ilmoitusten tulee erota toisistaan: 
        .catch(error => {
          setNotificationMessage(`Could not delete ${pers[0].name} from server!  \n 'Maybe it was already deleted ?`)
          setErrorOrSuccess(true)
// Olemattoman henkilön poistaminen tapahtuu siis metodilla filter,
// joka muodostaa uuden taulukon, jonka sisällöksi tulee alkuperäisen taulukon sisällöstä ne alkiot,
// joille parametrina oleva funktio palauttaa arvon true:
          setPersons(persons.filter(person => person.id !== pers[0].id))
          console.log(`failure <----- ${error.message}`)
          setTimeout(() => {
            setNotificationMessage(null)
            setErrorOrSuccess(null)
          }, 5000)
        })
    }
  }


// Lisätty notification container, jottei sivu hypi ylös-alas kun notification tulee ruudulle
  return (
    <div>
      <h2>Phonebook</h2>
      <div className='notification-container'>
      <Notification message={notificationMessage} error={errorOrSuccess}/>
      </div>
      <Search value = {showFiltered} handleChange={handleSearch} />
      <h2>add a new</h2>
      <PersonForm submit = {addPerson} name = {newName} number = {newNumber} handleName = {handleNameChange} handleNumber = {handleNumberChange} />
      <h2>Numbers</h2>
      <div>
      <PersonList persons = {persons} showFiltered = {showFiltered} deleteThisPerson={handleDeletePerson} />
      </div>
    </div>
  )
}
export default App
