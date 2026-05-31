# RESTApi - ExpressJS Products API & Interactive Dashboard

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-blue.svg)](https://nodejs.org/)
[![ExpressJS Version](https://img.shields.io/badge/express-v4.19.2-green.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-ISC-orange.svg)](https://opensource.org/licenses/ISC)
[![UI Design](https://img.shields.io/badge/UI-Glassmorphism--Dark%2FLight-violet.svg)](#)

Aplikasi **REST API** sederhana yang dibangun menggunakan **ExpressJS** untuk mengelola data produk terintegrasi dengan **Dashboard Web Visual Interaktif** berarsitektur Glassmorphism modern. Proyek ini dilengkapi fitur *Live API Request & Response Tracker* untuk memudahkan pengujian endpoint secara real-time.

---

## Fitur Utama

1. **REST API CRUD Lengkap**: Fungsionalitas penuh untuk menampilkan (GET), menambah (POST), memperbarui (PUT), dan menghapus (DELETE) data produk.
2. **Dashboard Visual Mewah**: Antarmuka responsif dengan desain Glassmorphism premium.
3. **Dual Tema (Dark / Light Mode)**: Beralih tema secara mulus dengan penyimpanan preferensi otomatis di browser (*localStorage*).
4. **Live API Visualizer Tracker**: Menampilkan perintah **cURL** dinamis beserta **JSON Response** asli dari server secara real-time di setiap aksi CRUD.
5. **Database Presisten Lokal**: Menggunakan penyimpanan file JSON lokal (`products.json`) sehingga data hasil manipulasi tetap tersimpan aman walau server direstart.
6. **Desain Tabel Responsif**: Dilengkapi fitur pencarian kata kunci, filter kategori cepat, area scrollable, dan *sticky header* blur transparan.

---

## Tech Stack

- **Backend**: Node.js, ExpressJS
- **Middleware**: CORS, Express JSON Parser, Express Static Router
- **Database**: Local JSON File Persistence
- **Frontend**: HTML5 (Strict XHTML/JSX Linting Compliant), Vanilla CSS3, Vanilla JavaScript (Fetch API)

---

## Struktur Model Data Produk

Setiap data produk disimpan dengan struktur tabel/objek sebagai berikut:

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto Increment (Dibuat otomatis oleh server) |
| `name` | Text | Nama barang/produk |
| `price` | Integer | Harga produk (Rupiah) |
| `stock` | Integer | Jumlah stok produk yang tersedia |
| `category` | Text | Kategori produk (*Makanan*, *Minuman*, *Alat Tulis*) |

---

## Dokumentasi Endpoint REST API

### 1. Menampilkan Semua Produk (GET)
- **URL**: `/api/products`
- **Method**: `GET`
- **Deskripsi**: Mengambil seluruh daftar produk dari database lokal.
- **Contoh Respons JSON (Status 200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Kopi Susu Gula Aren",
      "price": 18000,
      "stock": 45,
      "category": "Minuman"
    }
  ]
  ```

### 2. Menambah Produk Baru (POST)
- **URL**: `/api/products`
- **Method**: `POST`
- **Header**: `Content-Type: application/json`
- **Request Body (JSON)**:
  ```json
  {
    "name": "Pulpen Gel Hitam",
    "price": 8000,
    "stock": 100,
    "category": "Alat Tulis"
  }
  ```
- **Contoh Respons JSON (Status 201 Created)**:
  ```json
  {
    "message": "Produk berhasil ditambahkan!",
    "product": {
      "id": 5,
      "name": "Pulpen Gel Hitam",
      "price": 8000,
      "stock": 100,
      "category": "Alat Tulis"
    }
  }
  ```

### 3. Memperbarui Data Produk (Harga/Stok) (PUT)
- **URL**: `/api/products/:id`
- **Method**: `PUT`
- **Header**: `Content-Type: application/json`
- **Request Body (JSON)**: 
  ```json
  {
    "price": 20000,
    "stock": 40
  }
  ```
- **Contoh Respons JSON (Status 200 OK)**:
  ```json
  {
    "message": "Produk berhasil diperbarui!",
    "product": {
      "id": 1,
      "name": "Kopi Susu Gula Aren",
      "price": 20000,
      "stock": 40,
      "category": "Minuman"
    }
  }
  ```

### 4. Menghapus Produk (DELETE)
- **URL**: `/api/products/:id`
- **Method**: `DELETE`
- **Deskripsi**: Menghapus produk dari database berdasarkan ID.
- **Contoh Respons JSON (Status 200 OK)**:
  ```json
  {
    "message": "Produk berhasil dihapus!",
    "product": {
      "id": 1,
      "name": "Kopi Susu Gula Aren",
      "price": 20000,
      "stock": 40,
      "category": "Minuman"
    }
  }
  ```

---

## Cara Menjalankan Aplikasi Secara Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di komputer Anda:

### 1. Prasyarat
Pastikan komputer Anda sudah terinstal **[Node.js](https://nodejs.org/)** (Rekomendasi versi LTS terbaru).

### 2. Kloning Repositori
```bash
git clone https://github.com/username_kamu/express-products-api.git
cd express-products-api
```

### 3. Instal Dependensi
Unduh semua paket modul pustaka yang diperlukan (`express` dan `cors`):
```bash
npm install
```

### 4. Jalankan Server
Nyalakan server utama ExpressJS:
```bash
npm start
```

### 5. Akses Aplikasi
Buka browser favorit Anda dan akses alamat URL aktif yang tertera di terminal, contoh:
**`http://localhost:3000`** atau **`http://localhost:3001`**

