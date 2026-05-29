const API_BASE_URL = window.location.origin;

// Elemen DOM (Document Object Model)
const productTableBody = document.getElementById('productTableBody');
const emptyState = document.getElementById('emptyState');
const productForm = document.getElementById('productForm');
const btnRefresh = document.getElementById('btnRefresh');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');

// Pengubah Tema (Dark/Light Mode)
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Elemen Modal Edit
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editId = document.getElementById('editId');
const editName = document.getElementById('editName');
const editPrice = document.getElementById('editPrice');
const editStock = document.getElementById('editStock');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const btnCancelEdit2 = document.getElementById('btnCancelEdit2');

// Elemen Logger API
const loggerMethod = document.getElementById('loggerMethod');
const loggerUrl = document.getElementById('loggerUrl');
const loggerCurl = document.getElementById('loggerCurl');
const loggerResponse = document.getElementById('loggerResponse');

// State Global Aplikasi
let allProducts = [];
let currentCategoryFilter = 'all';

// Helper untuk memformat angka biasa menjadi Rupiah (IDR)
const formatIDR = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
};

// Mengupdate visual logger API di panel sebelah kanan
const updateApiLogger = (method, endpoint, curlCmd, responseData) => {
  loggerMethod.textContent = method;
  loggerMethod.className = `method-badge ${method.toLowerCase()}`;
  loggerUrl.textContent = endpoint;
  loggerCurl.textContent = curlCmd;
  loggerResponse.textContent = JSON.stringify(responseData, null, 2);

  // Efek animasi kilat hijau pada logger saat request berhasil dikirim
  const loggerCard = document.querySelector('.api-logger-card');
  loggerCard.style.borderColor = '#10b981';
  setTimeout(() => {
    loggerCard.style.borderColor = 'var(--accent)';
  }, 1000);
};

// Menghasilkan format perintah cURL tiruan untuk keperluan demo API
const generateCurl = (method, endpoint, data = null) => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  if (method === 'GET' || method === 'DELETE') {
    return `curl -X ${method} ${fullUrl}`;
  }
  return `curl -X ${method} ${fullUrl} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(data)}'`;
};

// [GET] Mengambil seluruh daftar produk dari REST API
const fetchProducts = async (isSilent = false) => {
  const endpoint = '/api/products';
  const method = 'GET';
  const curlCmd = generateCurl(method, endpoint);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    allProducts = data;

    renderProducts();

    // Jika tidak silent, update tampilan Visual Logger
    if (!isSilent) {
      updateApiLogger(method, endpoint, curlCmd, data);
    }
  } catch (error) {
    console.error('Error saat mengambil data produk:', error);
    if (!isSilent) {
      updateApiLogger(method, endpoint, curlCmd, { error: 'Gagal mengambil produk', details: error.message });
    }
  }
};

// Merender (menggambar) baris tabel produk dengan filter pencarian & kategori
const renderProducts = () => {
  const searchTerm = searchInput.value.toLowerCase().trim();

  // Memfilter data berdasarkan kategori terpilih dan kata kunci pencarian
  const filtered = allProducts.filter(product => {
    const matchesCategory = currentCategoryFilter === 'all' || product.category === currentCategoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.id.toString() === searchTerm;
    return matchesCategory && matchesSearch;
  });

  productTableBody.innerHTML = '';

  // Tampilkan keterangan jika pencarian kosong
  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  // Render masing-masing produk ke baris tabel HTML
  filtered.forEach(product => {
    const row = document.createElement('tr');

    // Pilih class CSS badge berdasarkan kategori produk
    let catClass = 'cat-pill';
    if (product.category === 'Makanan') catClass += ' makanan';
    else if (product.category === 'Minuman') catClass += ' minuman';
    else if (product.category === 'Alat Tulis') catClass += ' alat-tulis';

    row.innerHTML = `
      <td><span style="font-family: monospace; color: var(--text-muted)">#${product.id}</span></td>
      <td><strong style="color: var(--text-primary)">${product.name}</strong></td>
      <td><span class="${catClass}">${product.category}</span></td>
      <td><strong style="color: var(--text-primary)">${formatIDR(product.price)}</strong></td>
      <td>
        <span style="font-weight: 600; color: ${product.stock <= 5 ? 'var(--danger)' : 'var(--text-secondary)'}">
          ${product.stock}
        </span>
      </td>
      <td style="text-align: right;">
        <div class="td-actions">
          <button class="btn btn-secondary btn-icon-only edit-btn" data-id="${product.id}" title="Edit Harga/Stok (PUT)">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-danger btn-icon-only delete-btn" data-id="${product.id}" title="Hapus Produk (DELETE)">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;

    productTableBody.appendChild(row);
  });

  // Pasang event listener klik pada tombol Edit (PUT) 
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      openEditModal(id);
    });
  });

  // Pasang event listener klik pada tombol Hapus (DELETE) 
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      deleteProduct(id);
    });
  });
};

// [POST] Menambah produk baru ke database melalui form submit
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('pName').value.trim();
  const price = parseInt(document.getElementById('pPrice').value);
  const stock = parseInt(document.getElementById('pStock').value);
  const category = document.getElementById('pCategory').value;

  const payload = { name, price, stock, category };
  const endpoint = '/api/products';
  const method = 'POST';
  const curlCmd = generateCurl(method, endpoint, payload);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    updateApiLogger(method, endpoint, curlCmd, data);

    if (response.ok) {
      productForm.reset();
      fetchProducts(true); // reload list data produk secara silent
    }
  } catch (error) {
    console.error('Error saat menambah produk:', error);
    updateApiLogger(method, endpoint, curlCmd, { error: 'Gagal menambah produk', details: error.message });
  }
});

// [DELETE] Menghapus produk berdasarkan ID produk terpilih
const deleteProduct = async (id) => {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  // Konfirmasi keamanan hapus data
  if (!confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
    return;
  }

  const endpoint = `/api/products/${id}`;
  const method = 'DELETE';
  const curlCmd = generateCurl(method, endpoint);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    updateApiLogger(method, endpoint, curlCmd, data);

    if (response.ok) {
      fetchProducts(true); // reload list data secara silent
    }
  } catch (error) {
    console.error('Error saat menghapus produk:', error);
    updateApiLogger(method, endpoint, curlCmd, { error: 'Gagal menghapus produk', details: error.message });
  }
};

// Alur kerja Modal Edit (Form Update/PUT)
const openEditModal = (id) => {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  // Isi data produk lama ke dalam input form modal edit
  editId.value = product.id;
  editName.value = product.name;
  editPrice.value = product.price;
  editStock.value = product.stock;

  editModal.classList.add('active');
};

const closeEditModal = () => {
  editModal.classList.remove('active');
};

[btnCancelEdit, btnCancelEdit2].forEach(btn => btn.addEventListener('click', closeEditModal));

// [PUT] Mengirim request update harga/stok produk ke server
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = parseInt(editId.value);
  const price = parseInt(editPrice.value);
  const stock = parseInt(editStock.value);

  const payload = { price, stock };
  const endpoint = `/api/products/${id}`;
  const method = 'PUT';
  const curlCmd = generateCurl(method, endpoint, payload);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    updateApiLogger(method, endpoint, curlCmd, data);

    if (response.ok) {
      closeEditModal();
      fetchProducts(true); // reload list data secara silent
    }
  } catch (error) {
    console.error('Error saat mengupdate produk:', error);
    updateApiLogger(method, endpoint, curlCmd, { error: 'Gagal mengupdate produk', details: error.message });
  }
});

// Event Listener untuk Fitur Pencarian & Filter Kategori
searchInput.addEventListener('input', renderProducts);

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategoryFilter = tab.getAttribute('data-category');
    renderProducts();
  });
});

btnRefresh.addEventListener('click', () => fetchProducts(false));

// Logika Inisialisasi Tema Gelap/Terang (Dark/Light Mode)
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon.className = 'fa-solid fa-sun';
  } else {
    document.body.classList.remove('light-theme');
    themeIcon.className = 'fa-solid fa-moon';
  }
};

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-theme');
  if (isLight) {
    themeIcon.className = 'fa-solid fa-sun';
    localStorage.setItem('theme', 'light');
  } else {
    themeIcon.className = 'fa-solid fa-moon';
    localStorage.setItem('theme', 'dark');
  }
});

// Awal saat Halaman Selesai Dimuat di Browser
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchProducts(false);
});
