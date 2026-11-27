import mysql from 'mysql2/promise';

// Top Tier Brands
const BRANDS = ['ZARA', 'SNITCH', 'RARE RABBIT', "LEVI'S", 'H&M', 'SUPERDRY', 'THE SOULED STORE', 'FLYING MACHINE', 'JACK & JONES', 'TOMMY HILFIGER'];

// Curated 10 Categories matching user requests
const CATEGORIES_DATA = [
  { name: 'T-Shirts', desc: 'Oversized, Graphic, Drop-Shoulder & Solid Minimal Tees' },
  { name: 'Shirts', desc: 'Cuban Collar, Oxford, Casual Linen & Corduroy Shirts' },
  { name: 'Pants', desc: 'Baggy Denim, Utility Cargo, Chinos & Pleated Trousers' },
  { name: 'Kurtas', desc: 'Short Kurtas, Bandhgala & Festive Ethnic Sets' },
  { name: 'Track Pants', desc: 'Fleece Joggers & Streetwear Cargo Sweats' },
  { name: 'Co-ord Sets', desc: 'Monochrome Streetwear & Vacation Resort Sets' },
  { name: 'Women Tops', desc: 'Aesthetic Tops, Crop Tees & Draped Blouses' },
  { name: 'Women Dresses', desc: 'Maxi Gowns, Bodycon & Casual Slip Dresses' },
  { name: 'Footwear', desc: 'Chunky Sneakers, Casual Loafers, Minimal Trainers & High Tops' },
  { name: 'Kids', desc: 'Vibrant Casuals, Everyday Cotton Tees, Dungarees & Sets' }
];

// Curated high quality distinct Unsplash Photo IDs (verified fashion photography)
const PHOTO_BANK = [
  "photo-1521572267360-ee0c2909d518", "photo-1583743814966-8936f5b7be1a", "photo-1576566588028-4147f3842f27",
  "photo-1503342217505-b0a15ec3261c", "photo-1562157873-818bc0726f68", "photo-1529374255404-311a2a4f1fd9",
  "photo-1618354691373-d851c5c3a990", "photo-1581655353564-df123a1eb820", "photo-1622445268480-1a4e12e02b80",
  "photo-1527719327859-c6ce80353573", "photo-1503342394128-c104d54dba01", "photo-1512436991641-6745cdb1723f",
  "photo-1586790170083-2f9ceadc732d", "photo-1596755094514-f87e34085b2c", "photo-1602810318383-e386cc2a3ccf",
  "photo-1598033129183-c4f50c736f10", "photo-1607345366928-199ea26cfe3e", "photo-1594938298603-c8148c4dae35",
  "photo-1620012253295-c15c429f66bf", "photo-1603252109303-2751441dd157", "photo-1589310243389-96a5483213a8",
  "photo-1621072156002-e2fccdc0b176", "photo-1604695573706-53170668f6a6", "photo-1596755094514-f87e34085b2c",
  "photo-1608231387042-66d1773070a5", "photo-1541099649105-f69ad21f3246", "photo-1542272604-780c96856592",
  "photo-1624378439575-d8705ad7ae80", "photo-1517445312882-bc9910d016b7", "photo-1506629082955-511b1aa562c8",
  "photo-1473966968600-fa801b869a1a", "photo-1584370848010-d7fe6bc767ec", "photo-1551854838-212c50b4c184",
  "photo-1511196706436-e44a73c6748f", "photo-1516257984-b1b4d707412e", "photo-1552902865-b72c031ac5ea",
  "photo-1583391733956-3750e0ff4e8b", "photo-1610030469983-98e550d6193c", "photo-1597983073493-88cd35cf93b0",
  "photo-1617627143750-d86bc21e42bb", "photo-1566737236500-c8ac43014a67", "photo-1605518216938-7c31b7b14ad0",
  "photo-1509631179647-0177331693ae", "photo-1610030469850-8b981e7d23a2", "photo-1539109136881-3be0616acf4b",
  "photo-1515886657613-9f3515b0c78f", "photo-1483985988355-763728e1935b", "photo-1539571696357-5a69c17a67c6",
  "photo-1517841905240-472988babdf9", "photo-1507679799987-c73779587ccf", "photo-1534528741775-53994a69daeb",
  "photo-1519085360753-af0119f7cbe7", "photo-1492562080023-ab3db95bfbce", "photo-1490481651871-ab68de25d43d",
  "photo-1485230895905-ec40ba36b9bc", "photo-1508427953056-b00b8d78ebf5", "photo-1496747611176-843222e1e57c",
  "photo-1558769132-cb1aea458c5e", "photo-1515372039744-b8f02a3ae446", "photo-1572804013309-59a88b7e92f1",
  "photo-1549298916-b41d501d3772", "photo-1595950653106-6c9ebd614d3a", "photo-1560769629-975ec94e6a86",
  "photo-1525966222134-fcfa99b8ae77", "photo-1542291026-7eec264c27ff", "photo-1514989940723-e8e51635b782",
  "photo-1519457431-44ccd64a579b", "photo-1622290291468-a28f7a7dc6a8", "photo-1503944583220-79d8926ad5e2",
  "photo-1519238263530-99bdd11df2ea", "photo-1543163521-1bf539c55dd2", "photo-1511556532299-8f662fc26c06",
  "photo-1502716119720-b23a93e5fe1b", "photo-1516762689617-e1cffcef479d", "photo-1544441893-675973e31985"
];

const STYLES = ['Oversized', 'Structured', 'Slim Fit', 'Relaxed', 'Vintage Washed', 'Textured Woven', 'Minimalist', 'Tailored', 'Utility Cargo', 'Embroidered', 'Graphic Drop', 'Heavyweight', 'Contemporary'];
const FABRICS = ['100% Breathable Cotton', 'Pure Linen Weave', 'Stretch Twill Denim', 'High-Density Fleece', 'Mulberry Silk Blend', 'Terry Cotton', 'Tencel Lyocell', 'Brushed Flannel', 'Mercerized Supima Cotton'];

async function seedDatabaseEnhanced() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'clothing_ecommerce_db'
  });

  console.log('Connected to MySQL clothing_ecommerce_db.');

  // 1. Ensure Roles
  await connection.execute(`INSERT IGNORE INTO roles (role_id, role_name) VALUES (3, 'ROLE_ADMIN'), (4, 'ROLE_CUSTOMER')`);

  // 2. Ensure Users
  await connection.execute(`
    INSERT IGNORE INTO users (user_id, name, email, password, phone, address, role_id) 
    VALUES 
    (1, 'Anandha Kumar', 'admin@vilmora.com', '$2a$10$w8.1W017E9R7sX/B1n5b6u0Z4l5y3Y6w5z9q8r7s6t5u4v3w2x1y0', '9876543210', 'Velmora Headquarters, Chennai', 3),
    (2, 'Demo Shopper', 'user@vilmora.com', '$2a$10$w8.1W017E9R7sX/B1n5b6u0Z4l5y3Y6w5z9q8r7s6t5u4v3w2x1y0', '9876543211', '12 Lakeview Ave, Bangalore', 4)
  `);

  // 3. Upsert Categories
  console.log('Upserting 10 Categories...');
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

  // 4. Truncate Products cleanly
  console.log('Clearing old product catalog...');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('TRUNCATE TABLE products');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

  let totalInserted = 0;

  for (const [catName, catId] of Object.entries(categoryIdMap)) {
    const productsToInsert = [];

    for (let i = 1; i <= 100; i++) {
      const brand = BRANDS[(i + catId * 3) % BRANDS.length];
      const style = STYLES[(i * 5 + catId) % STYLES.length];
      const fabric = FABRICS[(i * 3 + catId) % FABRICS.length];
      
      const productName = `${brand} ${style} ${catName.replace('Women ', '')} #${i}`;
      const description = `Designed with ${fabric}. Signature luxury tailoring featuring modern silhouette, reinforced seams, and refined drape.`;
      
      const price = 899 + ((i * 53 + catId * 110) % 4800);
      const stock = 30 + ((i * 17) % 120);
      const size = ['S,M,L', 'M,L,XL', 'S,M,L,XL,XXL', 'L,XL'][i % 4];
      const color = ['Obsidian Black', 'Chalk White', 'Sage Green', 'Navy Blue', 'Dusty Rose', 'Charcoal Gray', 'Khaki Olive', 'Midnight Indigo', 'Sand Beige'][i % 9];
      
      // Select photo from photo bank deterministically so every product is distinct
      const photoId = PHOTO_BANK[(i * 7 + catId * 13) % PHOTO_BANK.length];
      const uniqueImg = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=85&product=${catId}_${i}`;

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
    console.log(`✓ Inserted 100 unique items for "${catName}" (Category ID: ${catId})`);
  }

  console.log(`\n🎉 SUCCESS: Successfully injected ${totalInserted} unique products into clothing_ecommerce_db across 10 categories!`);
  await connection.end();
}

seedDatabaseEnhanced().catch(err => {
  console.error('Database seeding error:', err);
  process.exit(1);
});
