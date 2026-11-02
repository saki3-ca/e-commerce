const nodemailer = require('nodemailer');
const store = require('../data/store');

// Customer-entered text goes into HTML emails (and the admin preview): escape it all.
const escapeHtml = str => String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function escapeDeep(value) {
  if (typeof value === 'string') return escapeHtml(value);
  if (Array.isArray(value)) return value.map(escapeDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, escapeDeep(v)]));
  }
  return value;
}

class EmailService {
  getTransporter() {
    const settings = this.settings || {};
    if (settings.smtpHost && settings.smtpUser && settings.smtpPass) {
      return nodemailer.createTransport({
        host: settings.smtpHost,
        port: Number(settings.smtpPort) || 587,
        secure: settings.smtpSecure || Number(settings.smtpPort) === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass
        }
      });
    }
    return null;
  }

  // Base email styling wrapper
  renderLayout(content, preheader = '') {
    const settings = this.settings || {};
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf7f5; margin: 0; padding: 0; color: #332d2b; }
          .container { max-width: 620px; margin: 25px auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f0e6e0; }
          .header { background: linear-gradient(135deg, #1f1d1d 0%, #362923 100%); padding: 32px 20px; text-align: center; color: #ffffff; }
          .brand-title { font-size: 32px; letter-spacing: 2px; font-family: 'Playfair Display', Georgia, serif; margin: 0; color: #d4af37; font-weight: 700; }
          .brand-subtitle { font-size: 11px; letter-spacing: 3px; color: #e6c89c; text-transform: uppercase; margin-top: 6px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .order-card { background: #faf5f0; border: 1px solid #ecdcd3; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .table th { text-align: left; padding: 10px; border-bottom: 2px solid #ecdcd3; font-size: 12px; text-transform: uppercase; color: #7d6b63; }
          .table td { padding: 12px 10px; border-bottom: 1px solid #f0e6e0; font-size: 14px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .badge-gold { background: #fdf2d0; color: #855c0e; border: 1px solid #e7c768; }
          .badge-green { background: #e6f9ed; color: #166534; border: 1px solid #86efac; }
          .btn { display: inline-block; padding: 14px 28px; background: #1f1d1d; color: #d4af37 !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; border: 1px solid #d4af37; }
          .footer { background: #fdfaf8; padding: 24px; text-align: center; font-size: 12px; color: #8c7f79; border-top: 1px solid #f0e6e0; }
          .preheader { display: none; max-height: 0px; overflow: hidden; }
        </style>
      </head>
      <body>
        <span class="preheader">${preheader}</span>
        <div class="container">
          <div class="header">
            <div style="font-size: 24px; margin-bottom: 4px;">👑</div>
            <h1 class="brand-title">${settings.shopName}</h1>
            <div class="brand-subtitle">${settings.tagline}</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0; font-weight: 600; color: #524742;">${settings.shopName} • ${settings.slogan}</p>
            <p style="margin: 0 0 4px 0;">📍 ${settings.address}</p>
            <p style="margin: 0;">📞 Hotline / WhatsApp: ${settings.ownerPhone} • ✉️ ${settings.ownerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 1. EMAIL TO OWNER: On new customer order
  async sendNewOrderAlertToOwner(order) {
    order = escapeDeep(order);
    const settings = this.settings = await store.getSettings();
    const recipient = settings.ownerEmail || 'maishamonsura@gmail.com';
    const subject = `[Masfeeh] 🛍️ New Order #${order.id} Received - ৳${order.total.toLocaleString()} from ${order.customer.name}`;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="font-weight: 600;">${item.name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">৳${item.price.toLocaleString()}</td>
        <td style="text-align: right; font-weight: 600;">৳${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const bodyHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-gold">New Order Alert</span>
        <h2 style="margin: 10px 0 4px 0; font-size: 22px; color: #1f1d1d;">You Have a New Customer Order!</h2>
        <p style="color: #6d625d; margin: 0; font-size: 14px;">Order ID: <strong>#${order.id}</strong> • Placed: ${new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div class="order-card">
        <h3 style="margin-top: 0; font-size: 16px; color: #423530; border-bottom: 1px solid #e2d2c8; padding-bottom: 8px;">👤 Customer Information</h3>
        <p style="margin: 4px 0;"><strong>Name:</strong> ${order.customer.name}</p>
        <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${order.customer.phone}" style="color: #b07e15; font-weight: 700;">${order.customer.phone}</a></p>
        <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${order.customer.email}">${order.customer.email}</a></p>
        <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${order.customer.address}</p>
        <p style="margin: 4px 0;"><strong>Region:</strong> ${order.customer.city || 'Inside Dhaka'}</p>
        ${order.customer.notes ? `<p style="margin: 4px 0; background: #fff; padding: 8px; border-radius: 6px; border: 1px dashed #d1b8ab;"><strong>Special Instructions:</strong> ${order.customer.notes}</p>` : ''}
      </div>

      <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #362a24;">📦 Ordered Items</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background: #faf5f0; border-radius: 8px; padding: 15px; margin-top: 15px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0;">Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">৳${order.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">Delivery Charge:</td>
            <td style="text-align: right;">৳${order.shipping}</td>
          </tr>
          ${order.discount ? `<tr><td style="padding: 4px 0; color: #166534;">Discount:</td><td style="text-align: right; color: #166534;">-৳${order.discount}</td></tr>` : ''}
          <tr style="border-top: 2px solid #ecdcd3; font-size: 16px;">
            <td style="padding: 8px 0; font-weight: 700; color: #1f1d1d;">Total Payable:</td>
            <td style="text-align: right; font-weight: 700; color: #9c6c0e; font-size: 18px;">৳${order.total.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b5c54;">Payment Method:</td>
            <td style="text-align: right; font-weight: 600;">${order.paymentMethod}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 14px; color: #665952; margin-bottom: 15px;">Log in to the Admin Dashboard to review and accept this order.</p>
        <span class="btn">Review Order #${order.id} in Admin</span>
      </div>
    `;

    const html = this.renderLayout(bodyHtml, `New order #${order.id} placed by ${order.customer.name}`);
    return await this.dispatchEmail({
      to: recipient,
      subject,
      html,
      type: 'OWNER_NEW_ORDER',
      orderId: order.id
    });
  }

  // 2. EMAIL TO CUSTOMER: Order Confirmation receipt
  async sendOrderConfirmationToCustomer(order) {
    const rawEmail = order.customer && order.customer.email;
    order = escapeDeep(order);
    this.settings = await store.getSettings();
    const recipient = rawEmail;
    if (!recipient) return null;

    const subject = `[Masfeeh] Order Received #${order.id} - Little Things... Big Happiness ♡`;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="font-weight: 600;">${item.name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right; font-weight: 600;">৳${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const bodyHtml = `
      <div style="text-align: center; margin-bottom: 25px;">
        <span class="badge badge-gold">Order Confirmed</span>
        <h2 style="margin: 10px 0 4px 0; font-size: 22px; color: #1f1d1d;">Thank You For Choosing Masfeeh! ✨</h2>
        <p style="color: #6d625d; margin: 0; font-size: 14px;">We have received your order <strong>#${order.id}</strong>. We will review and accept it shortly!</p>
      </div>

      <div class="order-card">
        <h3 style="margin-top: 0; font-size: 15px; color: #423530; margin-bottom: 8px;">📍 Shipping Information</h3>
        <p style="margin: 3px 0;"><strong>Recipient:</strong> ${order.customer.name}</p>
        <p style="margin: 3px 0;"><strong>Contact Phone:</strong> ${order.customer.phone}</p>
        <p style="margin: 3px 0;"><strong>Delivery Address:</strong> ${order.customer.address}, ${order.customer.city || 'Inside Dhaka'}</p>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background: #faf5f0; border-radius: 8px; padding: 15px; margin-top: 15px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0;">Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">৳${order.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">Delivery Charge:</td>
            <td style="text-align: right;">৳${order.shipping}</td>
          </tr>
          <tr style="border-top: 2px solid #ecdcd3; font-size: 16px;">
            <td style="padding: 8px 0; font-weight: 700; color: #1f1d1d;">Total Payable:</td>
            <td style="text-align: right; font-weight: 700; color: #9c6c0e; font-size: 18px;">৳${order.total.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b5c54;">Payment Method:</td>
            <td style="text-align: right; font-weight: 600;">${order.paymentMethod}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 14px; color: #665952; margin-bottom: 12px;">You can track your order status live at any time using Order ID: <strong>#${order.id}</strong></p>
        <div style="padding: 10px; background: #fff5e6; border-radius: 6px; display: inline-block; font-size: 13px; color: #805b11; border: 1px solid #ffd899;">
          🔔 You will receive another notification as soon as we accept your order!
        </div>
      </div>
    `;

    const html = this.renderLayout(bodyHtml, `Thank you for your order #${order.id} at Masfeeh`);
    return await this.dispatchEmail({
      to: recipient,
      subject,
      html,
      type: 'CUSTOMER_ORDER_CONFIRMATION',
      orderId: order.id
    });
  }

  // 3. EMAIL TO CUSTOMER: When Owner ACCEPTS the order! (Key user requirement)
  async sendOrderAcceptedNotificationToCustomer(order) {
    const rawEmail = order.customer && order.customer.email;
    order = escapeDeep(order);
    this.settings = await store.getSettings();
    const recipient = rawEmail;
    if (!recipient) return null;

    const subject = `[Masfeeh] 🎉 Great News! Your Order #${order.id} Has Been Accepted & Is Being Prepared!`;

    const itemsList = order.items.map(item => `
      <li style="margin-bottom: 6px;">
        <strong>${item.name}</strong> x ${item.quantity} (৳${(item.price * item.quantity).toLocaleString()})
      </li>
    `).join('');

    const bodyHtml = `
      <div style="text-align: center; margin-bottom: 25px;">
        <span class="badge badge-green">Order Accepted & Processing</span>
        <h2 style="margin: 12px 0 6px 0; font-size: 24px; color: #1f1d1d; font-family: 'Playfair Display', Georgia, serif;">Your Order Has Been Accepted! ✨</h2>
        <p style="color: #4b3e39; margin: 0; font-size: 15px;">Dear <strong>${order.customer.name}</strong>, Masfeeh has accepted your order and our packaging team is preparing your package with love and care!</p>
      </div>

      <div class="order-card" style="border-left: 4px solid #16a34a;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 6px 0;"><strong>Order ID:</strong></td>
            <td style="text-align: right; font-weight: 700; color: #1f1d1d;">#${order.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Current Status:</strong></td>
            <td style="text-align: right;"><span class="badge badge-green">Accepted / Packaging</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Courier Partner:</strong></td>
            <td style="text-align: right; font-weight: 600;">${order.courier || 'Steadfast / Pathao Express'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Tracking Reference:</strong></td>
            <td style="text-align: right; font-family: monospace; font-size: 14px; font-weight: 700; color: #9c6c0e;">${order.trackingCode || order.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Total Due:</strong></td>
            <td style="text-align: right; font-weight: 700; font-size: 16px; color: #1f1d1d;">৳${order.total.toLocaleString()} (${order.paymentMethod})</td>
          </tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #362923; font-size: 15px;">📦 Items in This Package:</h4>
        <ul style="padding-left: 20px; color: #524742; line-height: 1.6;">
          ${itemsList}
        </ul>
      </div>

      <div style="background: #fcf9f2; border: 1px dashed #d9b897; border-radius: 8px; padding: 18px; margin: 25px 0; text-align: center;">
        <h4 style="margin: 0 0 6px 0; color: #7a540d;">🚚 Estimated Delivery Timeline</h4>
        <p style="margin: 0; font-size: 13px; color: #5c4b3f;">
          <strong>Inside Dhaka:</strong> 24 to 48 Hours<br>
          <strong>Outside Dhaka:</strong> 2 to 3 Business Days
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #8c7365;">The delivery agent will call you at <strong>${order.customer.phone}</strong> before arriving.</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 13px; color: #7a6e69; margin-bottom: 12px;">Questions about your order? Message us directly on WhatsApp at <strong>01303-662891</strong>.</p>
      </div>
    `;

    const html = this.renderLayout(bodyHtml, `Your Masfeeh order #${order.id} has been accepted!`);
    return await this.dispatchEmail({
      to: recipient,
      subject,
      html,
      type: 'CUSTOMER_ORDER_ACCEPTED',
      orderId: order.id
    });
  }

  // 4. Dispatch helper: sends via nodemailer if configured, logs to store
  async dispatchEmail({ to, subject, html, type, orderId }) {
    const settings = this.settings || (this.settings = await store.getSettings());
    const transporter = this.getTransporter();
    let status = 'Delivered (Simulated)';
    let errorDetail = null;

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: `"${settings.senderName || 'Masfeeh'}" <${settings.smtpUser}>`,
          to,
          subject,
          html
        });
        status = 'Sent via SMTP';
        console.log(`[EmailService] Live email dispatched to ${to}: ${info.messageId}`);
      } catch (err) {
        console.error(`[EmailService] SMTP send error:`, err);
        status = `SMTP Failed: ${err.message}`;
        errorDetail = err.message;
      }
    } else {
      console.log(`[EmailService] SMTP not set up yet. Logged to system outbox for ${to}`);
    }

    const logRecord = await store.addEmailLog({
      to,
      subject,
      html,
      type,
      orderId,
      status,
      errorDetail
    });

    return logRecord;
  }

  // Test email configuration
  async testSmtp(testTargetEmail) {
    this.settings = await store.getSettings();
    const transporter = this.getTransporter();
    if (!transporter) {
      throw new Error('SMTP credentials are not configured. Please fill in Host, User, and Password.');
    }
    const settings = this.settings;
    const subject = `[Masfeeh] SMTP Test Connection Successful! 🌸`;
    const bodyHtml = `
      <div style="text-align: center;">
        <h2 style="color: #166534;">SMTP Connection Verified! ✅</h2>
        <p>This is a test notification confirming that your email configuration for <strong>${settings.shopName}</strong> is functioning properly.</p>
        <p>Order alerts and customer acceptance notifications will now be dispatched live to this mailbox!</p>
      </div>
    `;
    const html = this.renderLayout(bodyHtml, 'Masfeeh SMTP Test');
    await transporter.sendMail({
      from: `"${settings.senderName || 'Masfeeh'}" <${settings.smtpUser}>`,
      to: testTargetEmail || settings.ownerEmail,
      subject,
      html
    });
    return { success: true, message: `Test email sent to ${testTargetEmail || settings.ownerEmail}` };
  }
}

module.exports = new EmailService();
