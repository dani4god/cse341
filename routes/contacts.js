const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

// GET /contacts — return all contacts
// #swagger.tags = ['Contacts']
router.get('/', async (req, res) => {
  /*
    #swagger.summary = 'Get all contacts'
    #swagger.description = 'Returns a list of all contacts in the database.'
    #swagger.responses[200] = {
      description: 'Successfully retrieved all contacts.',
      schema: { $ref: '#/definitions/ContactsList' }
    }
  */
  try {
    const db = getDb();
    const contacts = await db.collection('Contacts').find().toArray();
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve Contacts.', details: err.message });
  }
});

// GET /contacts/:id — return a single contact by ID
router.get('/:id', async (req, res) => {
  /*
    #swagger.summary = 'Get a contact by ID'
    #swagger.description = 'Returns a single contact matching the given MongoDB ObjectId.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB ObjectId of the contact',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Successfully retrieved the contact.',
      schema: { $ref: '#/definitions/Contact' }
    }
    #swagger.responses[400] = { description: 'Invalid ID format.' }
    #swagger.responses[404] = { description: 'Contact not found.' }
  */
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }

    const db = getDb();
    const contact = await db.collection('Contacts').findOne({ _id: new ObjectId(id) });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve contact.', details: err.message });
  }
});

// POST /contacts — create a new contact
router.post('/', async (req, res) => {
  /*
    #swagger.summary = 'Create a new contact'
    #swagger.description = 'Adds a new contact to the database.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Contact data to create.',
      required: true,
      schema: { $ref: '#/definitions/NewContact' }
    }
    #swagger.responses[201] = { description: 'Contact created successfully.' }
    #swagger.responses[400] = { description: 'Missing required fields.' }
  */
  try {
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({
        error: 'All fields are required: firstName, lastName, email, favoriteColor, birthday.'
      });
    }

    const db = getDb();
    const result = await db.collection('Contacts').insertOne({
      firstName,
      lastName,
      email,
      favoriteColor,
      birthday
    });

    res.status(201).json({ message: 'Contact created.', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contact.', details: err.message });
  }
});

// PUT /contacts/:id — update a contact by ID
router.put('/:id', async (req, res) => {
  /*
    #swagger.summary = 'Update a contact by ID'
    #swagger.description = 'Updates an existing contact\'s information.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB ObjectId of the contact to update',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Updated contact data.',
      required: true,
      schema: { $ref: '#/definitions/NewContact' }
    }
    #swagger.responses[200] = { description: 'Contact updated successfully.' }
    #swagger.responses[400] = { description: 'Invalid ID format or missing fields.' }
    #swagger.responses[404] = { description: 'Contact not found.' }
  */
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }

    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({
        error: 'All fields are required: firstName, lastName, email, favoriteColor, birthday.'
      });
    }

    const db = getDb();
    const result = await db.collection('Contacts').replaceOne(
      { _id: new ObjectId(id) },
      { firstName, lastName, email, favoriteColor, birthday }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.status(200).json({ message: 'Contact updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact.', details: err.message });
  }
});

// DELETE /contacts/:id — delete a contact by ID
router.delete('/:id', async (req, res) => {
  /*
    #swagger.summary = 'Delete a contact by ID'
    #swagger.description = 'Permanently removes a contact from the database.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB ObjectId of the contact to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: 'Contact deleted successfully.' }
    #swagger.responses[400] = { description: 'Invalid ID format.' }
    #swagger.responses[404] = { description: 'Contact not found.' }
  */
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }

    const db = getDb();
    const result = await db.collection('Contacts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.status(200).json({ message: 'Contact deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact.', details: err.message });
  }
});

module.exports = router;
