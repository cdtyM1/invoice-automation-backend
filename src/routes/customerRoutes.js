import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        invoices: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        invoices: true
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        address
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.patch('/:id', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address })
      }
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
