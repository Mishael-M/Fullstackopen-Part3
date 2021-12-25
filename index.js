require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
var morgan = require('morgan');
const Person = require('./models/person');

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

morgan.token('data', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
);

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response) => {
  Person.find({ _id: request.params.id }).then((person) => {
    response.json(person);
  });
});

app.get('/info', (request, response) => {
  Person.estimatedDocumentCount().then((persons) => {
    let numPeople = `<p>Phonebook has info for ${persons} people.</p>`;
    let date = `<p>${new Date()}</p>`;
    let info = numPeople + date;
    response.send(info);
  });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: 'name missing' });
  }
  if (!body.number) {
    return response.status(400).json({ error: 'number missing' });
  }

  // Add unique phonebook entries at a later date
  // let nonuniqueName = persons.find((person) => person.name === body.name);

  // if (nonuniqueName) {
  //   return response.status(400).json({ error: 'name must be unique' });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.delete('/api/persons/:id', (request, response) => {
  Person.deleteOne({ _id: request.params.id }).then(response.status(204).end());
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
