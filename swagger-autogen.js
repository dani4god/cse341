const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Contacts API',
    description: 'A RESTful API for storing and retrieving contact information including friends and work colleagues.',
    version: '1.0.0',
    contact: {
      name: 'API Support'
    }
  },
  host: 'cse341-ie1j.onrender.com',
  schemes: ['http', 'https'],
  tags: [
    {
      name: 'Contacts',
      description: 'Endpoints for managing contacts'
    }
  ],
  definitions: {
    Contact: {
      _id: '60d5ec49f1b2c8b1f8e4e1a1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      favoriteColor: 'Blue',
      birthday: '1990-06-15'
    },
    NewContact: {
      $firstName: 'Jane',
      $lastName: 'Doe',
      $email: 'jane.doe@example.com',
      $favoriteColor: 'Blue',
      $birthday: '1990-06-15'
    },
    ContactsList: [
      {
        _id: '60d5ec49f1b2c8b1f8e4e1a1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        favoriteColor: 'Blue',
        birthday: '1990-06-15'
      }
    ]
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);

