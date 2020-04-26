import React, { useState, useEffect } from 'react'
import personsService from './services/persons.js'

const Filter = (props) => {
  return(
    <div>
      filter shown with <input value={props.value} onChange={props.onChange} />
    </div>
  )
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  const notificationStyle = {
    color: 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

const Error = ({ message }) => {
  if (message === null) {
    return null
  }

  const notificationStyle = {
    color: 'red',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

const App = () => {
  const [ persons, setPersons ] = useState([]) 
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ newFilter, setNewFilter ] = useState('')
  const [ notificationMessage, setNotificationMessage ] = useState(null)
  const [ errorMessage, setErrorMessage ] = useState(null)

  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleAdd = (event) => {
    event.preventDefault()

    const foundPerson = persons.find(person => person.name === newName)

    if (foundPerson !== undefined) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        personsService
          .update(foundPerson.id, {...foundPerson, number: newNumber })
          .then((newPerson) => {
            setPersons(persons.map(person => person.id !== foundPerson.id ? person : newPerson))
            setNotificationMessage(`${newName} number changed!`)
            setTimeout(() => setNotificationMessage(null), 3000)
          })
          .catch((newPerson) => {
            setErrorMessage(`Couldn't change ${newName}'s number`)
            setTimeout(() => setErrorMessage(null), 3000)
          })
      }
    } else {
      personsService
        .create({ name: newName, number: newNumber })
        .then((newPerson) => {
          console.log('saved persons')
          setPersons(persons.concat(newPerson))
          setNotificationMessage(`${newName} added!`)
          setTimeout(() => setNotificationMessage(null), 3000)
        })
        .catch(error => {
          setErrorMessage(error.response.data.error)
          setTimeout(() => setErrorMessage(null), 3000)
        })
    }

    setNewName('')
    setNewNumber('')
  }

  const handeName = (event) => {
    setNewName(event.target.value)
  }

  const handleNumber = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilter = (event) => {
    setNewFilter(event.target.value)
  }

  const handleDelete = (name, id) => {
    if(window.confirm(`delete ${name}?`)) {
      personsService
        .deleteItem(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id))
          setNotificationMessage(`${name} deleted!`)
          setTimeout(() => setNotificationMessage(null), 3000)
        })
        .catch(() => window.alert(`couldn't delete ${name}`))
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
        <Notification message={notificationMessage} />
        <Error message={errorMessage} />
        <Filter value={newFilter} onChange={handleFilter} />
      <h2>add a new</h2>
      <form onSubmit={handleAdd}>
        <div>
          name: <input value={newName} onChange={handeName} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumber} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      {
        persons.filter(person => person.name.toLowerCase().includes(newFilter))
          .map(person =>
            <div key={person.name}>
              {person.name} {person.number}
              <button onClick={() => handleDelete(person.name, person.id)}>delete</button>
            </div>
          )
      }
    </div>
  )
}

export default App
