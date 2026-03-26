const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const getAllContacts = async (req, res) => {
  try {
    const db = getDb();
    const contacts = await db.collection('Contacts').find().toArray();
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve contacts.', details: err.message });
  }
};

const getContactById = async (req, res) => {
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
};

const createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;
    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({
        error: 'All fields are required: firstName, lastName, email, favoriteColor, birthday.'
      });
    }
    const db = getDb();
    const result = await db.collection('Contacts').insertOne({
      firstName, lastName, email, favoriteColor, birthday
    });
    res.status(201).json({ message: 'Contact created.', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contact.', details: err.message });
  }
};

const updateContact = async (req, res) => {
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
};

const deleteContact = async (req, res) => {
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
};

module.exports = { getAllContacts, getContactById, createContact, updateContact, deleteContact };