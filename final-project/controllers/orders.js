const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const getAllOrders = async (req, res) => {
  try {
    const db = getDb();
    const orders = await db.collection('orders').find().toArray();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders.', details: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve order.', details: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { userId, products, totalAmount, status, paymentMethod, createdAt, orderAddress } = req.body;
    if (!userId || !products || !totalAmount || !status || !paymentMethod || !createdAt || !orderAddress) {
      return res.status(400).json({
        error: 'All fields are required: userId, products, totalAmount, status, paymentMethod, createdAt, orderAddress.'
      });
    }
    const db = getDb();
    const result = await db.collection('orders').insertOne({
      userId, products, totalAmount, status, paymentMethod, createdAt, orderAddress
    });
    res.status(201).json({ message: 'Order created.', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order.', details: err.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const { userId, products, totalAmount, status, paymentMethod, createdAt, orderAddress } = req.body;
    if (!userId || !products || !totalAmount || !status || !paymentMethod || !createdAt || !orderAddress) {
      return res.status(400).json({
        error: 'All fields are required: userId, products, totalAmount, status, paymentMethod, createdAt, orderAddress.'
      });
    }
    const db = getDb();
    const result = await db.collection('orders').replaceOne(
      { _id: new ObjectId(id) },
      { userId, products, totalAmount, status, paymentMethod, createdAt, orderAddress }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order.', details: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const result = await db.collection('orders').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order.', details: err.message });
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder };