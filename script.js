document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // 1. HAMBURGER MENU & HEADER SCROLL
    // =========================================
    const hamburger = document.getElementById("hamburger");
    const navUl = document.querySelector("nav ul");
    if (hamburger && navUl) {
        hamburger.addEventListener("click", () => navUl.classList.toggle("open"));
    }

    const header = document.querySelector("header");
    window.addEventListener("scroll", function () {
        if (header) {
            header.style.borderBottomColor = window.scrollY > 50 ? "rgba(200, 168, 75, 0.35)" : "rgba(200, 168, 75, 0.2)";
        }
    });

    // =========================================
    // 2. ANIMASI KEMUNCULAN KARTU PRODUK (Fix Hover)
    // =========================================
    const cards = document.querySelectorAll(".kartu-produk");
    if (cards.length > 0) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            // Munculkan kartu dari bawah
                            entry.target.style.opacity = "1";
                            entry.target.style.transform = "translateY(0)";
                            
                            // PERBAIKAN: Lepaskan kuncian JavaScript setelah 500ms
                            // Ini membuat efek timbul/zoom dari CSS bisa bekerja lagi saat di-hover!
                            setTimeout(() => {
                                entry.target.style.transform = "";
                                entry.target.style.transition = "";
                            }, 500);

                        }, i * 80);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        cards.forEach(card => {
            card.style.opacity = "0";
            card.style.transform = "translateY(30px)";
            card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            observer.observe(card);
        });
    }

    // =========================================
    // 3. RENDER KERANJANG PERTAMA KALI
    // =========================================
    renderKeranjang();

    // =========================================
    // 4. VALIDASI FORM PEMBELIAN
    // =========================================
    const form = document.getElementById("formPembelian");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            // Tolak pesanan jika keranjang masih kosong
            if (keranjang.length === 0) {
                alert("Tas belanja Anda masih kosong! Silakan pilih pakaian terlebih dahulu.");
                return;
            }

            let isFormValid = true;

            function tampilkanError(inputId, errorId, pesan) {
                const errEl = document.getElementById(errorId);
                const inputEl = document.getElementById(inputId);
                if (errEl) errEl.textContent = pesan;
                if (inputEl) inputEl.classList.add("input-error");
                isFormValid = false;
            }

            // Bersihkan error lama sebelum cek ulang
            document.querySelectorAll(".pesan-error").forEach(el => el.textContent = "");
            document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
            document.querySelectorAll(".radio-card").forEach(el => el.style.borderColor = "");

            // Cek Nama Lengkap
            const nama = document.getElementById("namaLengkap").value.trim();
            if (nama === "" || nama.length < 3) tampilkanError("namaLengkap", "error-nama", "Nama lengkap minimal 3 karakter.");
            
            // Cek Email
            const email = document.getElementById("emailPengguna").value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) tampilkanError("emailPengguna", "error-email", "Format email tidak valid.");

            // Cek WhatsApp
            const hp = document.getElementById("nomorHP").value.trim();
            if (!/^[0-9\-+\s]{9,15}$/.test(hp)) tampilkanError("nomorHP", "error-hp", "Nomor WhatsApp tidak valid (9-15 digit).");

            // Cek Ukuran
            const ukuran = document.getElementById("ukuran");
            if (ukuran && ukuran.value === "") tampilkanError("ukuran", "error-ukuran", "Silakan pilih ukuran.");

            // Cek Alamat
            const alamat = document.getElementById("alamat").value.trim();
            if (alamat.length < 15) tampilkanError("alamat", "error-alamat", "Harap isi alamat lengkap (minimal 15 karakter).");

            // Cek Metode Pembayaran
            const metodeDipilih = document.querySelector('input[name="metodeBayar"]:checked');
            if (!metodeDipilih) {
                tampilkanError(null, "error-metode", "Pilih salah satu metode pembayaran.");
                document.querySelectorAll(".radio-card").forEach(el => el.style.borderColor = "rgba(192, 64, 64, 0.5)");
            }

            // Cek Centang Persetujuan
            const persetujuan = document.getElementById("persetujuan").checked;
            if (!persetujuan) tampilkanError(null, "error-persetujuan", "Anda harus menyetujui kebijakan kami.");

            // JIKA VALIDASI SUKSES: Tampilkan loading lalu pop-up Modal
            if (isFormValid) {
                const btn = form.querySelector(".btn-submit");
                const originalHTML = btn.innerHTML;
                
                btn.innerHTML = '<span>Pesanan Diproses...</span><span>⏳</span>';
                btn.style.background = "#2E8B4F"; 
                btn.style.color = "#ffffff"; 
                btn.disabled = true;

                setTimeout(function () {
                    // Reset form dan kembalikan tombol
                    btn.innerHTML = originalHTML; 
                    btn.style.background = ""; 
                    btn.style.color = ""; 
                    btn.disabled = false;
                    
                    form.reset();
                    keranjang = []; // Kosongkan keranjang setelah beli
                    renderKeranjang();
                    
                    // Tampilkan pop-up mewah
                    const modal = document.getElementById("modalSukses");
                    if (modal) modal.classList.add("active");
                }, 2000);
            }
        });

        // Hapus warna merah secara real-time saat mulai diketik/dipilih
        const fields = ["namaLengkap", "emailPengguna", "nomorHP", "ukuran", "alamat"];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", () => el.classList.remove("input-error"));
                if (el.tagName === "SELECT") {
                    el.addEventListener("change", () => el.classList.remove("input-error"));
                }
            }
        });
    }

    // =========================================
    // 5. FUNGSI TUTUP MODAL
    // =========================================
    const modalSukses = document.getElementById("modalSukses");
    const modalHapus = document.getElementById("modalHapus");

    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", function(e) {
            // Tutup jika area gelap diklik
            if (e.target === modal) modal.classList.remove("active");
        });
    });

    const btnTutupSukses = document.getElementById("btnTutupModal");
    if (btnTutupSukses) btnTutupSukses.addEventListener("click", () => modalSukses.classList.remove("active"));
});


/* ===========================================================
   STATE & LOGIKA KERANJANG BELANJA (Di luar DOMContentLoaded)
   =========================================================== */
let keranjang = [];
let pendingHapusId = null;

function tambahKeKeranjang(id, nama, harga, gambar) {
    const itemExist = keranjang.find(item => item.id === id);
    if (itemExist) {
        itemExist.qty++;
        itemExist.subtotal = itemExist.harga * itemExist.qty;
    } else {
        keranjang.push({ id, nama, harga, gambar, qty: 1, subtotal: harga });
    }
    renderKeranjang();
    tampilToast('Produk ditambahkan ke tas belanja');
}

function tambahQty(id) {
    const item = keranjang.find(i => i.id === id);
    if (item) {
        item.qty++;
        item.subtotal = item.harga * item.qty;
        renderKeranjang();
    }
}

function kurangiQty(id) {
    const item = keranjang.find(i => i.id === id);
    if (!item) return;
    
    if (item.qty > 1) {
        item.qty--;
        item.subtotal = item.harga * item.qty;
        renderKeranjang();
    } else {
        // Jika sisa 1 dan ditekan minus, panggil pop-up hapus
        requestHapusItem(id, item.nama);
    }
}

function requestHapusItem(id, nama) {
    pendingHapusId = id;
    const namaProdukEl = document.getElementById('modal-nama-produk');
    if (namaProdukEl) namaProdukEl.textContent = nama;
    
    const modalHapus = document.getElementById('modalHapus');
    if (modalHapus) modalHapus.classList.add('active');
}

function tutupModalHapus() {
    pendingHapusId = null;
    const modalHapus = document.getElementById('modalHapus');
    if (modalHapus) modalHapus.classList.remove('active');
}

function konfirmasiHapus() {
    if (pendingHapusId !== null) {
        keranjang = keranjang.filter(i => i.id !== pendingHapusId);
        pendingHapusId = null;
    }
    const modalHapus = document.getElementById('modalHapus');
    if (modalHapus) modalHapus.classList.remove('active');
    
    renderKeranjang();
    tampilToast('Produk dihapus dari tas belanja');
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(angka);
}

function renderKeranjang() {
    const listEl = document.getElementById('keranjang-list');
    const footerEl = document.getElementById('keranjang-footer');
    const totalEl = document.getElementById('keranjang-total-text');

    if (!listEl) return;
    listEl.innerHTML = '';

    if (keranjang.length === 0) {
        listEl.innerHTML = `
            <div class="keranjang-empty">
                <span class="empty-icon">🛍️</span>
                <p>Tas belanja Anda masih kosong.</p>
                <span>Silakan pilih pakaian dari koleksi kami di atas.</span>
            </div>`;
        if (footerEl) footerEl.style.display = 'none';
        return;
    }

    let total = 0;
    keranjang.forEach(item => {
        total += item.subtotal;
        listEl.innerHTML += `
            <div class="keranjang-item">
                <img class="ki-thumb" src="${item.gambar}" alt="${item.nama}">
                <div class="ki-info">
                    <div class="ki-nama">${item.nama}</div>
                    <div class="ki-harga-satuan">Rp ${formatRupiah(item.harga)}</div>
                </div>
                <div class="ki-qty-control">
                    <button class="ki-qty-btn" onclick="kurangiQty(${item.id})">−</button>
                    <span class="ki-qty-number">${item.qty}</span>
                    <button class="ki-qty-btn" onclick="tambahQty(${item.id})">+</button>
                </div>
                <div class="ki-subtotal">Rp ${formatRupiah(item.subtotal)}</div>
                <button class="ki-hapus" onclick="requestHapusItem(${item.id}, '${item.nama}')" title="Hapus Item">✕</button>
            </div>
        `;
    });

    if (totalEl) totalEl.textContent = 'Rp ' + formatRupiah(total);
    if (footerEl) footerEl.style.display = 'flex';
}

function tampilToast(pesan) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = pesan;
    toast.classList.add('show');
    
    setTimeout(() => toast.classList.remove('show'), 3000);
}