# Ambil Produk Toko — V18 Tokopedia Image Fix

- Engine Shopee berasal dari V16 dan tidak diubah pada perbaikan ini.
- Tokopedia memprioritaskan CDN gambar produk `p*-images-sign-*.tokopedia-static.net`.
- Placeholder/aset `1f-web-assets*.tokopedia-static.net` tidak boleh menjadi `image_main`.
- Query signed URL Tokopedia dipertahankan utuh.
- Jika detail memiliki beberapa gambar produk, gambar CDN produk pertama menjadi `image_main` dan sisanya masuk `images`.
