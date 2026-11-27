import mysql from 'mysql2/promise';

const REVIEWS_POOL = [
  { rating: 5, comment: 'Phenomenal tailoring! The fabric feels lightweight and super premium.' },
  { rating: 5, comment: 'Hands down one of the best fits I have purchased. True to size and colors are vibrant.' },
  { rating: 4, comment: 'Very stylish aesthetic silhouette. Quick delivery and neatly packaged in box.' },
  { rating: 5, comment: 'Top-tier luxury quality. Looks even better in person than the photos!' },
  { rating: 4, comment: 'Comfortable weave for daily wear. Great stitching and no loose threads.' },
  { rating: 5, comment: 'Loved the fabric texture! Zara & Snitch vibe throughout.' },
  { rating: 5, comment: 'Pure luxury! Received countless compliments the first day I wore this.' },
  { rating: 4, comment: 'Solid build quality and modern cut. Definitely ordering another piece.' }
];

async function seedAllTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'clothing_ecommerce_db'
  });

  console.log('Connected to MySQL to populate all empty tables...');

  // 1. Fetch available product IDs and user IDs
  const [products] = await connection.execute('SELECT product_id, price FROM products LIMIT 300');
  const [users] = await connection.execute('SELECT user_id, name, address FROM users');

  if (products.length === 0 || users.length === 0) {
    console.log('No products or users found to attach relations to.');
    await connection.end();
    return;
  }

  const userId = users[0].user_id;

  // 2. Populate REVIEWS Table (attach 2-3 unique positive reviews to top 150 products)
  console.log('Populating REVIEWS table...');
  const reviewsToInsert = [];
  for (let i = 0; i < Math.min(150, products.length); i++) {
    const prodId = products[i].product_id;
    const r1 = REVIEWS_POOL[(i * 2) % REVIEWS_POOL.length];
    const r2 = REVIEWS_POOL[(i * 3 + 1) % REVIEWS_POOL.length];

    reviewsToInsert.push([prodId, userId, r1.rating, r1.comment, new Date(Date.now() - (i * 3600000 * 24))]);
    reviewsToInsert.push([prodId, userId, r2.rating, r2.comment, new Date(Date.now() - (i * 3600000 * 12))]);
  }

  await connection.execute('DELETE FROM reviews');
  await connection.query(
    'INSERT INTO reviews (product_id, user_id, rating, comment, created_date) VALUES ?',
    [reviewsToInsert]
  );
  console.log(`✓ Inserted ${reviewsToInsert.length} rich product reviews into REVIEWS table.`);

  // 3. Populate ORDERS & ORDER_ITEMS
  console.log('Populating ORDERS & ORDER_ITEMS tables...');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('DELETE FROM order_items');
  await connection.execute('DELETE FROM orders');
  await connection.execute('DELETE FROM payments');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

  const orderStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const paymentMethods = ['UPI', 'CARD', 'COD', 'NETBANKING'];

  for (let o = 1; o <= 12; o++) {
    const p1 = products[(o * 7) % products.length];
    const p2 = products[(o * 11 + 3) % products.length];
    const total = p1.price + (p2 ? p2.price : 0);
    const status = orderStatuses[o % orderStatuses.length];
    const pMethod = paymentMethods[o % paymentMethods.length];
    const orderDate = new Date(Date.now() - o * 86400000 * 3);

    const [orderRes] = await connection.execute(
      'INSERT INTO orders (user_id, order_date, total_amount, status, payment_method) VALUES (?, ?, ?, ?, ?)',
      [userId, orderDate, total, status, pMethod]
    );

    const newOrderId = orderRes.insertId;

    // Insert Items for this Order
    await connection.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [newOrderId, p1.product_id, 1, p1.price]
    );

    if (p2) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [newOrderId, p2.product_id, 1, p2.price]
      );
    }

    // Insert Payment Entry for this Order
    const txnId = `TXN_VEL_${Date.now()}_${o}`;
    await connection.execute(
      'INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id, payment_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newOrderId, pMethod, total, status === 'DELIVERED' ? 'COMPLETED' : 'SUCCESS', txnId, orderDate, userId]
    );
  }
  console.log('✓ Inserted 12 comprehensive orders, order items & payment transactions.');

  // 4. Populate CART & CART_ITEMS (User currently has 2 trending items in bag)
  console.log('Populating CART & CART_ITEMS tables...');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('DELETE FROM cart_items');
  await connection.execute('DELETE FROM cart');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

  const [cartRes] = await connection.execute('INSERT INTO cart (user_id) VALUES (?)', [userId]);
  const cartId = cartRes.insertId;

  const cartProd1 = products[0];
  const cartProd2 = products[1];

  await connection.execute(
    'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
    [cartId, cartProd1.product_id, 1, cartProd1.price, cartId, cartProd2.product_id, 1, cartProd2.price]
  );
  console.log('✓ Initialized live cart & items for active user.');

  console.log('\n🎉 ALL DATABASE TABLES HAVE BEEN FULLY SEEDED WITH LIVE RELATIONAL DATA!');
  await connection.end();
}

seedAllTables().catch(console.error);
