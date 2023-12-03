const Search = ( { value, handleChange }) => {
    return (
        <input
        value = {value}
        onChange={handleChange}
        />
    )
}

export default Search