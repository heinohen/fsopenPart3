import axios from 'axios'

// Siirrä palvelimen kanssa kommunikoinnista vastaava toiminnallisuus omaan moduuliin
// tämän osan materiaalissa olevan esimerkin tapaan.

const baseUrl = 'api/persons'

const getAll = () => {
    const request =  axios.get(baseUrl)
    return request.then(response => response.data)
}

const create = newObject => {
    const request = axios.post(baseUrl, newObject)
    return request.then(response => response.data)
}

// Muuta toiminnallisuutta siten, että jos jo olemassa olevalle henkilölle lisätään numero,
// korvaa lisätty numero aiemman numeron. Korvaaminen kannattaa tehdä HTTP PUT ‑pyynnöllä.

const update = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then(response => response.data)
}


// Tiettyä henkilöä vastaava resurssi tuhotaan palvelimelta tekemällä HTTP DELETE ‑pyyntö
// resurssia vastaavaan URL:iin. Eli jos poistaisimme esim. käyttäjän,
// jonka id on 2, tulisi tapauksessamme tehdä HTTP DELETE osoitteeseen localhost:3001/persons/2.
// Pyynnön mukana ei lähetetä mitään dataa.
// Axios-kirjaston avulla HTTP DELETE ‑pyyntö tehdään samaan tapaan kuin muutkin pyynnöt.

const eliminate = (id) => {
    const request = axios.delete(`${baseUrl}/${id}`)
    return request.then(response => response.data)
}

export default {
    getAll,
    create,
    update,
    eliminate
}
