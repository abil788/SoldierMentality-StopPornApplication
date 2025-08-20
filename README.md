# SoldierMentality — StopPornApplication

> Aplikasi mobile untuk membantu pengguna menghentikan kebiasaan menonton konten pornografi. Dibuat menggunakan **React Native** dengan **Expo**.

---

## 🔎 Ringkasan

SoldierMentality adalah aplikasi mobile yang ditujukan untuk membantu pengguna membangun kontrol diri dan kebiasaan sehat sebagai pengganti konsumsi konten pornografi. Aplikasi ini dibangun menggunakan React Native dan dijalankan dengan Expo agar mudah di-debug dan di-deploy ke perangkat Android/iOS.

## ✨ Fitur Utama

* Pelacakan hari tanpa pornografi (streaks)
* Pengingat / notifikasi harian untuk motivasi
* Statistik sederhana (hari berturut-turut, total hari)
* Tips dan artikel singkat untuk mengelola kebiasaan
* Pengaturan pribadi ( tujuan harian)

> Catatan: fitur di atas bisa disesuaikan atau ditambahkan sesuai kebutuhan proyek.

## 📦 Teknologi

* React Native
* Expo (CLI & SDK)
* AsyncStorage (penyimpanan lokal) atau alternatif yang Anda pilih
* React Navigation (stack/tabs)
* Komponen UI (bisa gunakan React Native Paper, NativeBase, atau Tailwind + UI kit pilihan)

## 🧰 Prasyarat

Pastikan Anda memiliki environment berikut:

* Node.js (versi LTS direkomendasikan)
* npm atau yarn
* Expo CLI: `npm install -g expo-cli` atau gunakan `npx expo`
* Android Studio / Xcode (opsional, jika ingin menjalankan emulator)
* Perangkat fisik dengan Expo Go (untuk pengujian cepat)

## 🚀 Cara Menjalankan (Development)

1. Clone repo:

```bash
git clone https://github.com/abil788/SoldierMentality-StopPornApplication.git
cd SoldierMentality-StopPornApplication
```

2. Install dependensi:

```bash
npm install
# atau
# yarn install
```

3. Jalankan Expo:

```bash
npx expo start
# atau jika menggunakan expo-cli global
# expo start
```

4. Buka di perangkat:

* Pindai QR code dengan aplikasi **Expo Go** (Android/iOS) untuk menjalankan aplikasi.
* Atau tekan `a` untuk membuka di Android emulator / `i` untuk iOS simulator (jika tersedia).

## 📱 Build Produksi

Untuk build produksi gunakan EAS atau build klasik Expo (tergantung SDK Expo yang digunakan):

```bash
# jika menggunakan EAS (disarankan untuk fitur build cross-platform modern)
eas build -p android
# atau
eas build -p ios
```

Atau jika memakai `expo build` (SDK lama):

```bash
expo build:android
expo build:ios
```

> Pastikan Anda sudah mengkonfigurasi akun Expo dan kredensial yang diperlukan.

## 🗂️ Struktur Folder (Contoh)

```
/SoldierMentality-StopPornApplication
├─ /assets         # gambar, ikon, font
├─ /src
│  ├─ /components  # komponen UI kecil
│  ├─ /screens     # layar (Home, Stats, Tips, Settings)
│  ├─ /navigation  # React Navigation
│  ├─ /utils       # helper, format tanggal
│  └─ /services    # storage, api (jika ada backend)
├─ app.json
├─ package.json
└─ README.md
```

## 🔒 Penyimpanan & Privasi

Aplikasi ini menyimpan data pengguna (mis. streak, preferensi) secara lokal pada perangkat menggunakan AsyncStorage. Jika Anda menambahkan sinkronisasi ke backend, pastikan:

* Data sensitif dienkripsi
* Pengguna diberi penjelasan privasi

## ✅ Tips Pengembangan & Testing

* Gunakan mode `development` saat mengembangkan: `npx expo start --dev-client`
* Tes di perangkat nyata dengan Expo Go untuk memastikan notifikasi dan perilaku lifecycle bekerja.
* Untuk notifikasi gunakan `expo-notifications` dan ikuti dokumentasinya.

## 🤝 Kontribusi

Terbuka untuk kontribusi! Jika ingin menambahkan fitur atau memperbaiki bug:

1. Fork repo
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan: `git commit -m "Tambah fitur XYZ"`
4. Push dan bikin Pull Request

## 📝 Menambahkan Fitur Baru (Contoh)

Jika menambahkan dukungan login atau sinkronisasi cloud:

* Buat folder `services/auth` untuk menangani auth
* Simpan konfigurasi di `.env` (ingat jangan commit `.env` ke repo)
* Update README dengan instruksi env dan API keys

## 📸 Screenshots

Tambahkan screenshot aplikasi di sini (letakkan file di `/assets/screenshots`), contoh:

```
![Home screen](assets/screenshots/home.png)
![Stats screen](assets/screenshots/stats.png)
```

## 📄 Lisensi

Lisensi default: MIT — ubah sesuai kebutuhan.

```text
MIT License
```

## ✉️ Kontak

Jika ada pertanyaan atau ingin kerja sama, hubungi: `abil788` di GitHub atau tambahkan detail kontak lain di sini.

---

Terima kasih sudah membuat proyek dengan tujuan penting — semoga membantu banyak orang! 💪
