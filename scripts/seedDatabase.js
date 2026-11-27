import mysql from 'mysql2/promise';

// Structured Top Brand Names
const BRANDS = ['ZARA', 'SNITCH', 'RARE RABBIT', "LEVI'S", 'H&M', 'SUPERDRY', 'THE SOULED STORE', 'FLYING MACHINE', 'JACK & JONES', 'TOMMY HILFIGER'];

// Curated Category specifications
const CATEGORIES_DATA = [
  { name: 'T-Shirts', desc: 'Oversized, Graphic, Drop-Shoulder & Regular Tees' },
  { name: 'Shirts', desc: 'Cuban Collar, Oxford, Casual Linen & Corduroy Shirts' },
  { name: 'Pants', desc: 'Baggy Denim, Utility Cargo, Chinos & Pleated Trousers' },
  { name: 'Kurtas', desc: 'Short Kurtas, Bandhgala & Festive Ethnic Sets' },
  { name: 'Track Pants', desc: 'Fleece Joggers & Streetwear Cargo Sweats' },
  { name: 'Co-ord Sets', desc: 'Monochrome Streetwear & Vacation Resort Sets' },
  { name: 'Women Tops', desc: 'Aesthetic Tops, Crop Tees & Draped Blouses' },
  { name: 'Women Dresses', desc: 'Maxi Gowns, Bodycon & Casual Slip Dresses' }
];

// Rich High-Definition unique fashion image collections per category
const CATEGORY_IMAGES = {
  'T-Shirts': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1622445268480-1a4e12e02b80?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=800&q=80'
  ],
  'Shirts': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1604695573706-53170668f6a6?auto=format&fit=crop&w=800&q=80'
  ],
  'Pants': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511196706436-e44a73c6748f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80'
  ],
  'Kurtas': [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1610030469850-8b981e7d23a2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
  ],
  'Track Pants': [
    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80'
  ],
  'Co-ord Sets': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80'
  ],
  'Women Tops': [
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
  ],
  'Women Dresses': [
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'
  ]
};

const STYLES = ['Oversized', 'Structured', 'Slim Fit', 'Relaxed', 'Vintage Washed', 'Textured Woven', 'Minimalist', 'Tailored', 'Utility Cargo', 'Embroidered'];
const FABRICS = ['100% Breathable Cotton', 'Pure Linen Weave', 'Stretch Twill Denim', 'High-Density Fleece', 'Mulberry Silk Blend', 'Terry Cotton', 'Tencel Lyocell'];

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'clothing_ecommerce_db'
  });

  console.log('Connected to MySQL clothing_ecommerce_db successfully.');

  // 1. Ensure Roles Exist
  await connection.execute(`INSERT IGNORE INTO roles (role_id, role_name) VALUES (3, 'ROLE_ADMIN'), (4, 'ROLE_CUSTOMER')`);

  // 2. Ensure Users Exist (Anandha Admin + Demo Customer)
  await connection.execute(`
    INSERT IGNORE INTO users (user_id, name, email, password, phone, address, role_id) 
    VALUES 
    (1, 'Anandha Kumar', 'admin@vilmora.com', '$2a$10$w8.1W017E9R7sX/B1n5b6u0Z4l5y3Y6w5z9q8r7s6t5u4v3w2x1y0', '9876543210', 'Vilmora Headquarters, Chennai', 3),
    (2, 'Demo Shopper', 'user@vilmora.com', '$2a$10$w8.1W017E9R7sX/B1n5b6u0Z4l5y3Y6w5z9q8r7s6t5u4v3w2x1y0', '9876543211', '12 Lakeview Ave, Bangalore', 4)
  `);

  // 3. Upsert Categories
  console.log('Inserting categories...');
  const categoryIdMap = {};
  for (const cat of CATEGORIES_DATA) {
    const [rows] = await connection.execute('SELECT category_id FROM categories WHERE category_name = ?', [cat.name]);
    if (rows.length > 0) {
      categoryIdMap[cat.name] = rows[0].category_id;
    } else {
      const [insertRes] = await connection.execute(
        'INSERT INTO categories (category_name, description) VALUES (?, ?)',
        [cat.name, cat.desc]
      );
      categoryIdMap[cat.name] = insertRes.insertId;
    }
  }

  // 4. Generate & Insert 100 Unique Products Per Category (800 total items)
  console.log('Seeding 100 unique products per category...');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('TRUNCATE TABLE products');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

  let totalInserted = 0;

  for (const [catName, catId] of Object.entries(categoryIdMap)) {
    const baseImages = CATEGORY_IMAGES[catName] || CATEGORY_IMAGES['T-Shirts'];
    const productsToInsert = [];

    for (let i = 1; i <= 100; i++) {
      const brand = BRANDS[(i + catId) % BRANDS.length];
      const style = STYLES[(i * 3) % STYLES.length];
      const fabric = FABRICS[(i * 7) % FABRICS.length];
      
      const productName = `${brand} ${style} ${catName.replace('Women ', '')} #${i}`;
      const description = `Crafted from ${fabric}. Premium modern silhouette tailored with precision stitching and modern finish.`;
      
      // Dynamic realistic pricing
      const price = 799 + (i * 47) % 4500;
      const stock = 25 + (i * 13) % 150;
      const size = ['S,M,L', 'M,L,XL', 'S,M,L,XL,XXL', 'L,XL'][i % 4];
      const color = ['Obsidian Black', 'Chalk White', 'Sage Green', 'Navy Blue', 'Dusty Rose', 'Charcoal Gray', 'Khaki Olive'][i % 7];
      
      // Unique high-definition image by leveraging high-res image index + unique query signature
      const baseImg = baseImages[(i - 1) % baseImages.length];
      const uniqueImg = `${baseImg}&sig=${catId}_${i}`;

      productsToInsert.push([
        productName,
        description,
        price,
        stock,
        size,
        color,
        uniqueImg,
        catId
      ]);
    }

    const sql = `
      INSERT INTO products (name, description, price, stock, size, color, image_path, category_id) 
      VALUES ?
    `;

    await connection.query(sql, [productsToInsert]);
    totalInserted += productsToInsert.length;
    console.log(`✓ Inserted 100 unique items into "${catName}" (Category ID: ${catId})`);
  }

  console.log(`\n🎉 SUCCESS: Successfully injected ${totalInserted} unique products into clothing_ecommerce_db!`);
  await connection.end();
}

seedDatabase().catch(err => {
  console.error('Database seeding failed:', err);
  process.exit(1);
});
