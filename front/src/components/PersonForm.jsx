
/**
 * @argument submit what to do when form is submitted
 * @argument name string in name field of form
 * @argument number string in the number field of form
 * @argument handleName function to add name to phonebook
 * @argument handleNumber function to add number to phonebook
 * @param {*} param0 
 * @returns 
 */
const PersonForm = ( {submit, name, number, handleName, handleNumber }) => {
    return (
        <div>
        <form onSubmit={submit}>
        <div>
        name: 
        <input 
            value = {name}
            onChange={handleName}
        />
        </div>
        <div>
        number:
        <input
            value = {number}
            onChange={handleNumber}
        />
        </div>
            <div>
            <button type = "submit">add</button>
            </div>
        </form>
        </div>
    )
}

export default PersonForm
/*
<PersonForm submit =
{addPerson} name = {newName}
number = {newNumber}
handleName = {handleNameChange}
handleNumber = {handleNumberChange} />
*/