import prisma from '../prisma.js';
import { sendInvoiceEmail } from './emailService.js';
import { sendWhatsApp } from './whatsappService.js';

export async function checkReminderSchedule() {
  const now = new Date();

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          not: 'paid'
        }
      },
      include: {
        customer: true,
        reminders: true
      }
    });

    console.log(`Checking ${invoices.length} invoices for reminders...`);

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.dueDate);
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      // Check if reminder already sent for this day
      const reminderSent = invoice.reminders.some(
        (r) =>
          r.templateName === `H${diffDays > 0 ? '-' : '+'}{Math.abs(diffDays)}` &&
          new Date(r.sentAt).toDateString() === now.toDateString()
      );

      if (reminderSent) continue;

      if (diffDays === 7) {
        await sendReminder(invoice, 'H-7');
      } else if (diffDays === 1) {
        await sendReminder(invoice, 'H-1');
      } else if (diffDays === 0) {
        await sendReminder(invoice, 'OVERDUE');
      } else if (diffDays < -7 && diffDays % 7 === 0) {
        // Send reminder every 7 days after overdue
        await sendReminder(invoice, 'OVERDUE');
      }
    }
  } catch (error) {
    console.error('Reminder check error:', error);
  }
}

async function sendReminder(invoice, type) {
  const customerName = invoice.customer?.name ?? 'Customer';
  const customerPhone = invoice.customer?.phone ?? '';
  const customerEmail = invoice.customer?.email ?? '';

  const message = buildMessage(type, customerName, invoice.totalAmount, invoice.dueDate);

  console.log(`Sending ${type} reminder to ${customerName}...`);

  if (customerPhone) {
    await sendWhatsApp({
      phone: customerPhone,
      message
    });
  }

  if (customerEmail) {
    await sendInvoiceEmail({
      to: customerEmail,
      subject: `Reminder Tagihan #${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h3>Reminder Tagihan</h3>
          <p>Halo ${customerName},</p>
          <p>Tagihan Anda dengan nomor <strong>#${invoice.invoiceNumber}</strong> sebesar <strong>Rp ${invoice.totalAmount.toLocaleString('id-ID')}</strong> sedang ${type === 'OVERDUE' ? 'terlambat' : 'akan jatuh tempo'}.</p>
          <p><strong>Jatuh tempo:</strong> ${new Date(invoice.dueDate).toLocaleString('id-ID')}</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Email ini dikirim secara otomatis. Mohon segera lakukan pembayaran.</p>
        </div>
      `
    });
  }

  await prisma.reminderLog.create({
    data: {
      invoiceId: invoice.id,
      channel: customerPhone && customerEmail ? 'wa/email' : customerPhone ? 'wa' : 'email',
      templateName: type,
      status: 'sent',
      payload: { type, timestamp: new Date() }
    }
  });
}

function buildMessage(type, customerName, amount, dueDate) {
  const formattedDate = new Date(dueDate).toLocaleDateString('id-ID');

  if (type === 'H-7') {
    return `Halo ${customerName}, tagihan Anda sebesar Rp ${amount.toLocaleString('id-ID')} akan jatuh tempo pada ${formattedDate}. Mohon segera diproses. Terima kasih.`;
  }

  if (type === 'H-1') {
    return `Halo ${customerName}, reminder terakhir: tagihan Anda sebesar Rp ${amount.toLocaleString('id-ID')} akan jatuh tempo besok (${formattedDate}). Segera diproses. Terima kasih.`;
  }

  return `Halo ${customerName}, tagihan Anda sebesar Rp ${amount.toLocaleString('id-ID')} sudah melewati jatuh tempo pada ${formattedDate}. Mohon segera dibayar. Terima kasih.`;
}
