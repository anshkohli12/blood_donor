const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const emailTemplates = {
  // Contact form response
  contactResponse: (data) => ({
    to: data.userEmail,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    subject: `Re: ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9fafb;
            padding: 30px 20px;
            border-left: 4px solid #dc2626;
            border-right: 4px solid #dc2626;
          }
          .section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .section-title {
            color: #dc2626;
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 16px;
            text-transform: uppercase;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 5px;
          }
          .original-message {
            background: #f3f4f6;
            padding: 15px;
            border-left: 3px solid #9ca3af;
            margin: 15px 0;
            font-style: italic;
            color: #6b7280;
          }
          .response {
            background: #fef2f2;
            padding: 15px;
            border-left: 3px solid #dc2626;
            margin: 15px 0;
          }
          .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            text-align: center;
            font-size: 14px;
          }
          .footer a {
            color: #dc2626;
            text-decoration: none;
          }
          .btn {
            display: inline-block;
            background: #dc2626;
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 15px;
            font-weight: bold;
          }
          .info-row {
            margin: 8px 0;
          }
          .label {
            font-weight: bold;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🩸 Blood Donor Platform</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Response to Your Inquiry</p>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">Dear ${data.userName},</div>
            <p>Thank you for contacting us. We have reviewed your inquiry and are pleased to provide you with a response.</p>
          </div>

          <div class="section">
            <div class="section-title">📝 Your Original Message</div>
            <div class="info-row">
              <span class="label">Subject:</span> ${data.subject}
            </div>
            <div class="info-row">
              <span class="label">Submitted on:</span> ${data.submittedDate}
            </div>
            <div class="original-message">
              ${data.originalMessage}
            </div>
          </div>

          <div class="section">
            <div class="section-title">💬 Our Response</div>
            <div class="response">
              ${data.adminResponse}
            </div>
            <div class="info-row" style="margin-top: 15px; font-size: 14px; color: #6b7280;">
              <span class="label">Responded by:</span> ${data.respondedBy}<br>
              <span class="label">Date:</span> ${data.responseDate}
            </div>
          </div>

          <div class="section" style="text-align: center;">
            <p>If you have any further questions, please don't hesitate to contact us again.</p>
            <a href="http://localhost:5173/contact" class="btn">Contact Us Again</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Blood Donor Platform</strong></p>
          <p>Connecting donors, patients, and blood banks to save lives</p>
          <p style="margin-top: 15px;">
            <a href="http://localhost:5173">Visit Our Platform</a> | 
            <a href="http://localhost:5173/my-messages/${encodeURIComponent(data.userEmail)}">View My Messages</a>
          </p>
          <p style="margin-top: 10px; font-size: 12px;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </div>
      </body>
      </html>
    `
  }),

  // Urgent blood request notification
  urgentBloodRequest: (data) => ({
    to: data.bloodBankEmail,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    subject: `🚨 URGENT: Blood Request for ${data.bloodType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .urgent-header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .urgent-badge {
            background: #fef2f2;
            color: #dc2626;
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            border: 2px solid #dc2626;
            margin-bottom: 10px;
          }
          .content {
            background: #fff;
            padding: 30px 20px;
            border-left: 4px solid #dc2626;
            border-right: 4px solid #dc2626;
          }
          .info-box {
            background: #f9fafb;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
          }
          .blood-type {
            font-size: 48px;
            font-weight: bold;
            color: #dc2626;
            text-align: center;
            margin: 20px 0;
          }
          .btn-urgent {
            display: inline-block;
            background: #dc2626;
            color: white !important;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            font-weight: bold;
            text-align: center;
          }
          .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            text-align: center;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="urgent-header">
          <div class="urgent-badge">🚨 URGENT REQUEST</div>
          <h1 style="margin: 10px 0;">Immediate Blood Needed</h1>
        </div>
        
        <div class="content">
          <div class="blood-type">${data.bloodType}</div>
          
          <div class="info-box">
            <strong>👤 Patient:</strong> ${data.patientName}<br>
            <strong>💉 Units Needed:</strong> ${data.unitsNeeded}<br>
            <strong>📅 Needed By:</strong> ${data.neededBy}<br>
            <strong>🏥 Hospital:</strong> ${data.hospitalName}
          </div>

          <div class="info-box">
            <strong>📞 Contact Person:</strong> ${data.contactName}<br>
            <strong>📱 Phone:</strong> ${data.contactPhone}<br>
            <strong>📧 Email:</strong> ${data.contactEmail}
          </div>

          ${data.medicalCondition ? `
          <div class="info-box">
            <strong>⚕️ Medical Condition:</strong><br>
            ${data.medicalCondition}
          </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="http://localhost:5173/blood-bank-requests" class="btn-urgent">
              View Request Details
            </a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Blood Donor Platform</strong></p>
          <p>Immediate action required - A life may depend on it</p>
        </div>
      </body>
      </html>
    `
  }),

  // Blood request status update
  bloodRequestStatusUpdate: (data) => ({
    to: data.requesterEmail,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    subject: `Blood Request Update: ${data.status.toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .status-badge {
            display: inline-block;
            padding: 10px 25px;
            border-radius: 25px;
            font-weight: bold;
            margin: 15px 0;
          }
          .status-approved {
            background: #dcfce7;
            color: #166534;
            border: 2px solid #22c55e;
          }
          .status-rejected {
            background: #fee2e2;
            color: #991b1b;
            border: 2px solid #ef4444;
          }
          .status-fulfilled {
            background: #dbeafe;
            color: #1e40af;
            border: 2px solid #3b82f6;
          }
          .content {
            background: #f9fafb;
            padding: 30px 20px;
            border-left: 4px solid #dc2626;
            border-right: 4px solid #dc2626;
          }
          .info-box {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            text-align: center;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🩸 Blood Request Update</h1>
          <div class="status-badge status-${data.status}">
            ${data.status === 'approved' ? '✅ APPROVED' : 
              data.status === 'rejected' ? '❌ REJECTED' : 
              data.status === 'fulfilled' ? '✔️ FULFILLED' : data.status.toUpperCase()}
          </div>
        </div>
        
        <div class="content">
          <div class="info-box">
            <p><strong>Dear ${data.requesterName},</strong></p>
            <p>${data.statusMessage}</p>
          </div>

          <div class="info-box">
            <strong>🩸 Blood Type:</strong> ${data.bloodType}<br>
            <strong>💉 Units:</strong> ${data.unitsNeeded}<br>
            <strong>🏥 Blood Bank:</strong> ${data.bloodBankName}<br>
            <strong>📅 Status Updated:</strong> ${data.updateDate}
          </div>

          ${data.note ? `
          <div class="info-box">
            <strong>📝 Note from Blood Bank:</strong><br>
            ${data.note}
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p><strong>Blood Donor Platform</strong></p>
          <p>Thank you for using our platform to save lives</p>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (type, data) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email not configured. Skipping email send.');
      return { success: false, message: 'Email not configured' };
    }

    const emailConfig = emailTemplates[type](data);
    
    console.log(`Sending ${type} email to:`, emailConfig.to);
    
    const result = await transporter.sendMail(emailConfig);
    
    console.log('Email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig
};
