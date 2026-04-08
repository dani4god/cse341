const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const getAllProducts = async (req, res) => {
  try {
    const db = getDb();
    const products = await db.collection('products').find().toArray();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products.', details: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product.', details: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, rating } = req.body;
    if (!name || !description || !price || !stock || !category || !rating) {
      return res.status(400).json({
        error: 'All fields are required: name, description, price, stock, category, rating.'
      });
    }
    const db = getDb();
    const result = await db.collection('products').insertOne({
      name, description, price, stock, category, rating
    });
    res.status(201).json({ message: 'Product created.', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product.', details: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const { name, description, price, stock, category, rating } = req.body;
    if (!name || !description || !price || !stock || !category || !rating) {
      return res.status(400).json({
        error: 'All fields are required: name, description, price, stock, category, rating.'
      });
    }
    const db = getDb();
    const result = await db.collection('products').replaceOne(
      { _id: new ObjectId(id) },
      { name, description, price, stock, category, rating }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json({ message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product.', details: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product.', details: err.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };