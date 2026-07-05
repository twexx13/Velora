const orderConfirmationEmail = (userName, order) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; color: #333; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #000; color: #fff; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; letter-spacing: 4px; }
    .body { padding: 32px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #000; color: #fff; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .footer { background: #000; color: #aaa; text-align: center; padding: 20px; font-size: 12px; }
    .btn { display: inline-block; background: #000; color: #fff; padding: 12px 28px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>VELORA</h1><p>Order Confirmed</p></div>
    <div class="body">
      <h2>Hi ${userName}!</h2>
      <p>Thank you for your order!</p>
      <p><strong>Invoice:</strong> ${order.invoiceNumber}</p>
      <p><strong>Total:</strong> Rs.${order.totalPrice?.toLocaleString('en-IN')}</p>
      <h3>Items</h3>
      <table>
        <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
        ${order.orderItems?.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>Rs.${item.price?.toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </table>
      <br/>
      <a class="btn" href="${process.env.FRONTEND_URL}">Visit Velora</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Velora. All rights reserved.</div>
  </div>
</body>
</html>
`;

module.exports = { orderConfirmationEmail };