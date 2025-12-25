const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

const app = express();

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://i-visitor.vercel.app',
      'https://ivisitor.onrender.com',
      'http://localhost:5173',
      'http://localhost:5000'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Email configuration
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('Email transport configured');
} catch (err) {
  console.error('Failed to configure email transport:', err);
  transporter = null;
}

// Routes
// 1. Get single visitor by ID
app.get('/api/visitor/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await prisma.visitor.findUnique({
      where: { id: parseInt(id) },
      include: {
        resident: true
      }
    });

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json(visitor);
  } catch (err) {
    console.error('Error fetching visitor:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Submit visitor request
app.post('/api/visitor-request', async (req, res) => {
  console.log('Received visitor request:', req.body);
  try {
    const { visitorName, visitorEmail, residentName, residentEmail, visitReason, carNumber } = req.body;

    // Check if resident exists
    let resident = await prisma.resident.findUnique({
      where: { email: residentEmail }
    });

    // Create resident if they don't exist
    if (!resident) {
      try {
        resident = await prisma.resident.create({
          data: {
            name: residentName || 'Resident',
            email: residentEmail
          }
        });
        console.log(`Created new resident: ${residentEmail}`);
      } catch (err) {
        console.error('Error creating resident:', err);
        // If there's a unique constraint error, try to fetch the resident again
        // This handles race conditions where the resident might have been created between our check and create
        if (err.code === 'P2002') { // Prisma unique constraint violation
          resident = await prisma.resident.findUnique({
            where: { email: residentEmail }
          });
          if (!resident) {
            return res.status(500).json({ error: 'Failed to create or find resident' });
          }
        } else {
          throw err;
        }
      }
    }

    // Generate unique 4-digit code and approval token
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const approvalToken = crypto.randomBytes(32).toString('hex');

    // Insert visitor request
    const newVisitor = await prisma.visitor.create({
      data: {
        visitorName,
        visitorEmail,
        residentName,
        residentEmail,
        visitReason,
        carNumber,
        verificationCode: verificationCode.toString(),
        approvalToken,
        status: 'pending'
      }
    });

    // Send email to resident if email transport is configured
    if (transporter) {
      try {
        const backendUrl = process.env.BACKEND_URL || 'https://heedless-palingenetically-londa.ngrok-free.dev';
        const mailOptions = {
          from: process.env.EMAIL_USER || 'noreply@ivisitor.com',
          to: newVisitor.residentEmail,
          subject: 'New Visitor Request - iVisitor',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .info { margin: 10px 0; }
                .label { font-weight: bold; color: #555; }
                .buttons { margin-top: 30px; text-align: center; }
                .btn { display: inline-block; padding: 12px 30px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .btn-approve { background: #10B981; color: white; }
                .btn-reject { background: #EF4444; color: white; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">New Visitor Request</h2>
                </div>
                <div class="content">
                  <div class="info"><span class="label">Visitor Name:</span> ${newVisitor.visitorName}</div>
                  <div class="info"><span class="label">Visitor Email:</span> ${newVisitor.visitorEmail}</div>
                  <div class="info"><span class="label">Visit Reason:</span> ${newVisitor.visitReason}</div>
                  <div class="info"><span class="label">Car Number:</span> ${newVisitor.carNumber || 'Not provided'}</div>
                  
                  <div class="buttons">
                    <a href="${backendUrl}/api/approve/${newVisitor.id}/${approvalToken}" class="btn btn-approve">✓ Approve Visit</a>
                    <a href="${backendUrl}/api/reject/${newVisitor.id}/${approvalToken}" class="btn btn-reject">✗ Reject Visit</a>
                  </div>
                </div>
                <div class="footer">
                  <p>This is an automated email from iVisitor Management System</p>
                </div>
              </div>
            </body>
            </html>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent to resident:', newVisitor.residentEmail);
      } catch (emailErr) {
        console.error('Failed to send email, but continuing with visitor registration:', emailErr);
        // Continue with the registration even if email fails
      }
    } else {
      console.log('Email transport not configured, skipping email notification');
    }
    res.json(newVisitor);
  } catch (err) {
    console.error('Error in visitor-request endpoint:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// 3. Update visitor status (approve/reject)
app.put('/api/visitor-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedVisitor = await prisma.visitor.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    if (status === 'approved' && transporter) {
      try {
        // Send verification code to visitor
        const mailOptions = {
          from: process.env.EMAIL_USER || 'noreply@ivisitor.com',
          to: updatedVisitor.visitorEmail,
          subject: 'Visit Approved - Verification Code',
          html: `
            <h2>Your visit has been approved</h2>
            <p>Your verification code is: ${updatedVisitor.verificationCode}</p>
            <p>Please show this code to the guard upon arrival.</p>
          `
        };
        await transporter.sendMail(mailOptions);
        console.log('Approval email sent to visitor:', updatedVisitor.visitorEmail);
      } catch (emailErr) {
        console.error('Failed to send approval email, but continuing with status update:', emailErr);
        // Continue with the status update even if email fails
      }
    }

    res.json(updatedVisitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Guard verification
app.post('/api/guard-verify', async (req, res) => {
  try {
    const { visitorId, code } = req.body;

    const visitor = await prisma.visitor.findFirst({
      where: {
        id: parseInt(visitorId),
        verificationCode: code
      }
    });

    if (!visitor) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Use direct SQL query to set the current date and time in the database's timezone
    // This bypasses any JavaScript Date handling issues
    await prisma.$executeRaw`
      UPDATE visitors 
      SET in_date = CURRENT_DATE, 
          in_time = CURRENT_TIME 
      WHERE id = ${parseInt(visitorId)}
    `;

    console.log('Updated visitor check-in with SQL CURRENT_DATE and CURRENT_TIME');

    // Fetch the updated visitor to return in the response
    const updatedVisitor = await prisma.visitor.findUnique({
      where: { id: parseInt(visitorId) }
    });

    // Add the current time directly as a formatted string
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Format as 12-hour time
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    // Add the formatted time to the response
    updatedVisitor.formattedTime = formattedTime;

    console.log('Using current time for display:', formattedTime);

    res.json(updatedVisitor);
  } catch (err) {
    console.error('Error in guard verification:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Mark visitor exit
app.put('/api/visitor-exit/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Use direct SQL query to set the current date and time in the database's timezone
    // This bypasses any JavaScript Date handling issues
    await prisma.$executeRaw`
      UPDATE visitors 
      SET out_date = CURRENT_DATE, 
          out_time = CURRENT_TIME 
      WHERE id = ${parseInt(id)}
    `;

    console.log('Updated visitor exit with SQL CURRENT_DATE and CURRENT_TIME');

    // Fetch the updated visitor to return in the response
    const updatedVisitor = await prisma.visitor.findUnique({
      where: { id: parseInt(id) }
    });

    // Add the current time directly as a formatted string
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Format as 12-hour time
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    // Add the formatted time to the response
    updatedVisitor.formattedOutTime = formattedTime;

    console.log('Using current time for display:', formattedTime);

    res.json(updatedVisitor);
  } catch (err) {
    console.error('Error marking visitor exit:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get all visitors
app.get('/api/visitors', async (req, res) => {
  try {
    const visitors = await prisma.visitor.findMany({
      include: {
        resident: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add formatted time for each visitor
    const visitorsWithFormattedTime = visitors.map(visitor => {
      const formattedVisitor = { ...visitor };

      // Format inTime if it exists
      if (visitor.inTime) {
        const now = new Date(visitor.inTime);
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Format as 12-hour time
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        formattedVisitor.formattedTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }

      // Format outTime if it exists
      if (visitor.outTime) {
        const now = new Date(visitor.outTime);
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Format as 12-hour time
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        formattedVisitor.formattedOutTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }

      return formattedVisitor;
    });

    res.json(visitorsWithFormattedTime);
  } catch (err) {
    console.error('Error fetching visitors:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper functions for HTML responses
function successPage(message, details = '') {
  return `<!DOCTYPE html><html><head><title>Success - iVisitor</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}.container{background:white;padding:40px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.2);text-align:center;max-width:500px}.icon{font-size:64px;color:#10B981;margin-bottom:20px}h1{color:#10B981;margin:0 0 10px 0}p{color:#666;line-height:1.6}.details{background:#f9f9f9;padding:15px;border-radius:5px;margin-top:20px;font-size:14px}</style></head><body><div class="container"><div class="icon">✓</div><h1>Success!</h1><p>${message}</p>${details ? `<div class="details">${details}</div>` : ''}<p style="margin-top:30px;font-size:14px;color:#999">You can close this window now.</p></div></body></html>`;
}

function errorPage(message) {
  return `<!DOCTYPE html><html><head><title>Error - iVisitor</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%)}.container{background:white;padding:40px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.2);text-align:center;max-width:500px}.icon{font-size:64px;color:#EF4444;margin-bottom:20px}h1{color:#EF4444;margin:0 0 10px 0}p{color:#666;line-height:1.6}</style></head><body><div class="container"><div class="icon">✗</div><h1>Error</h1><p>${message}</p><p style="margin-top:30px;font-size:14px;color:#999">Please contact support if this issue persists.</p></div></body></html>`;
}

// 6. Approve visitor via email link
app.get('/api/approve/:id/:token', async (req, res) => {
  try {
    const { id, token } = req.params;
    const visitor = await prisma.visitor.findFirst({
      where: { id: parseInt(id), approvalToken: token, status: 'pending' }
    });
    if (!visitor) {
      return res.send(errorPage('Invalid or expired approval link.'));
    }
    await prisma.visitor.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' }
    });
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER || 'noreply@ivisitor.com',
          to: visitor.visitorEmail,
          subject: 'Visit Approved - Verification Code',
          html: `<h2>Your Visit Has Been Approved!</h2><p>Verification code: <strong style="font-size:24px;color:#10B981">${visitor.verificationCode}</strong></p><p>Show this code to the guard upon arrival.</p>`
        });
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr);
      }
    }
    res.send(successPage('Visitor approved successfully!', `Verification code sent to ${visitor.visitorEmail}`));
  } catch (err) {
    console.error('Error in approval endpoint:', err);
    res.send(errorPage('Failed to approve visitor.'));
  }
});

// 7. Reject visitor via email link
app.get('/api/reject/:id/:token', async (req, res) => {
  try {
    const { id, token } = req.params;
    const visitor = await prisma.visitor.findFirst({
      where: { id: parseInt(id), approvalToken: token, status: 'pending' }
    });
    if (!visitor) {
      return res.send(errorPage('Invalid or expired rejection link.'));
    }
    await prisma.visitor.update({
      where: { id: parseInt(id) },
      data: { status: 'rejected' }
    });
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER || 'noreply@ivisitor.com',
          to: visitor.visitorEmail,
          subject: 'Visit Request Update',
          html: `<h2>Visit Request Update</h2><p>Your visit request has not been approved at this time.</p>`
        });
      } catch (emailErr) {
        console.error('Failed to send rejection email:', emailErr);
      }
    }
    res.send(successPage('Visitor rejected.', `${visitor.visitorName} has been notified.`));
  } catch (err) {
    console.error('Error in rejection endpoint:', err);
    res.send(errorPage('Failed to reject visitor.'));
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
