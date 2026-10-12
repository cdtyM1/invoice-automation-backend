import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        items: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true,
        payments: true,
        reminders: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
router.post('/', async (req, res) => {
  try {
    const { customerId, invoiceNumber, dueDate, notes, items } = req.body;

    if (!customerId || !invoiceNumber || !dueDate || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0);

    const invoice = await prisma.invoice.create({
      data: {
        customerId,
        invoiceNumber,
        dueDate: new Date(dueDate),
        totalAmount,
        notes,
        items: {
          create: items.map((item) => ({
            description: item.description,
            qty: Number(item.qty),
            price: Number(item.price)
          }))
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update invoice status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['paid', 'unpaid', 'overdue'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get invoice by number
router.get('/number/:invoiceNumber', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: req.params.invoiceNumber },
      include: {
        customer: true,
        items: true,
        payments: true,
        reminders: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
