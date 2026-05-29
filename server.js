const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'products.json');

// Middleware (Penengah Aplikasi)
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fungsi Pembantu untuk Presistensi Database File JSON
const readDatabase = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error saat membaca database file:', error);
    return [];
  }
};

const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database file:', error);
    return false;
  }
};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. GET /api/products : Menampilkan semua produk
app.get('/api/products', (req, res) => {
  const products = readDatabase();
  res.json(products);
});

// 2. POST /api/products : Menambah produk baru
app.post('/api/products', (req, res) => {
  const { name, price, stock, category } = req.body;

  // Validasi Input
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nama produk (name) harus diisi.' });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'Harga produk (price) harus berupa angka positif.' });
  }
  if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
    return res.status(400).json({ error: 'Stok produk (stock) harus berupa angka positif.' });
  }
  if (!category || category.trim() === '') {
    return res.status(400).json({ error: 'Kategori produk (category) harus diisi.' });
  }

  const products = readDatabase();

  // Auto Increment ID
  const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const newProduct = {
    id: nextId,
    name: name.trim(),
    price: Math.round(Number(price)),
    stock: Math.round(Number(stock)),
    category: category.trim()
  };

  products.push(newProduct);
  const success = writeDatabase(products);

  if (!success) {
    return res.status(500).json({ error: 'Gagal menyimpan data ke database.' });
  }

  res.status(201).json({
    message: 'Produk berhasil ditambahkan!',
    product: newProduct
  });
});

// 3. PUT /api/products/:id : Mengupdate data produk (Harga/Stok) berdasarkan ID
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { price, stock } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID produk tidak valid.' });
  }

  const products = readDatabase();
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: `Produk dengan ID ${id} tidak ditemukan.` });
  }

  // Setidaknya salah satu field (price atau stock) harus diupdate
  if (price === undefined && stock === undefined) {
    return res.status(400).json({ error: 'Harap berikan data harga (price) atau stok (stock) untuk diupdate.' });
  }

  // Validasi nilai jika diberikan
  if (price !== undefined) {
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: 'Harga produk (price) harus berupa angka positif.' });
    }
    products[productIndex].price = Math.round(Number(price));
  }

  if (stock !== undefined) {
    if (isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ error: 'Stok produk (stock) harus berupa angka positif.' });
    }
    products[productIndex].stock = Math.round(Number(stock));
  }

  const success = writeDatabase(products);
  if (!success) {
    return res.status(500).json({ error: 'Gagal menyimpan pembaruan ke database.' });
  }

  res.json({
    message: 'Produk berhasil diperbarui!',
    product: products[productIndex]
  });
});

// 4. DELETE /api/products/:id : Menghapus produk berdasarkan ID
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID produk tidak valid.' });
  }

  const products = readDatabase();
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: `Produk dengan ID ${id} tidak ditemukan.` });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  const success = writeDatabase(products);

  if (!success) {
    return res.status(500).json({ error: 'Gagal menyimpan perubahan ke database.' });
  }

  res.json({
    message: 'Produk berhasil dihapus!',
    product: deletedProduct
  });
});

// Jalankan Server dengan fallback port jika terjadi EADDRINUSE
const startServer = (portAttempt) => {
  const server = app.listen(portAttempt, () => {
    console.log(`REST API server running on: http://localhost:${portAttempt}`);
    console.log(`Database file: ${DB_FILE}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portAttempt} sedang digunakan. Mencoba port ${portAttempt + 1}...`);
      startServer(portAttempt + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);

