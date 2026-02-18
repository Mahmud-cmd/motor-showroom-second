// URL Web App Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbyJvwefCYeCMejSyR7SHiD_5UryLM_TNw62Iii46HGUPpGCFhVBZXQsFhys81pPY6yrRQ/exec";

// Fungsi untuk memberikan gambar default jika di spreadsheet kosong
function dapatkanGambarFamiliar(jenis) {
    const nama = jenis.toLowerCase();
    if (nama.includes('nmax')) return 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=400&q=80';
    if (nama.includes('pcx') || nama.includes('vario')) return 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=400&q=80';
    if (nama.includes('scoopy') || nama.includes('fazzio')) return 'https://images.unsplash.com/photo-1519750292352-c9fc17322ed7?auto=format&fit=crop&w=400&q=80';
    if (nama.includes('beat')) return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80';
    
    // Default jika tidak ada yang cocok
    return 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80';
}

// 1. Fungsi Jam Real-time
function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    const timeDisplay = now.toLocaleDateString('id-ID', options).replace('pukul', '|');
    document.getElementById('realtime-clock').innerHTML = `<i class="bi bi-clock-fill me-2 text-primary"></i> ${timeDisplay}`;
}

setInterval(updateClock, 1000);
updateClock();

// 2. Fungsi Login Admin
function login() {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;

    if (user === "iwanmahmud" && pass === "120121") {
        sessionStorage.setItem("adminLoggedIn", "true");
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        document.getElementById('admin-panel').classList.remove('d-none');
        document.getElementById('katalog').classList.add('d-none');
        alert("Selamat datang, Admin!");
    } else {
        alert("Username atau password salah!");
    }
}

// 3. Fungsi Logout
function logout() {
    sessionStorage.removeItem("adminLoggedIn");
    location.reload();
}

// 4. Ambil Data Unit dari Google Sheets
async function getCatalog() {
    const listContainer = document.getElementById('motor-list');
    
    try {
        const response = await fetch(`${API_URL}?function=getMotorTersedia`);
        const data = await response.json();

        listContainer.innerHTML = ''; 
        document.getElementById('unit-count').innerText = `${data.length} Unit Stok Ready`;

        if (data.length === 0) {
            listContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-card-list display-1 text-muted"></i>
                    <h4 class="mt-3 text-muted">Belum ada unit tersedia saat ini.</h4>
                </div>`;
            return;
        }

        data.forEach((motor, index) => {
            const harga = motor.hargaBuka 
                ? `Rp ${Number(motor.hargaBuka).toLocaleString('id-ID')}` 
                : 'Hubungi Dealer';

            listContainer.innerHTML += `
                <div class="col-md-6 col-lg-4 col-xl-3">
                    <div class="card motor-card h-100 shadow-sm">
                        <div class="img-container position-relative">
                            <img src="${motor.foto || dapatkanGambarFamiliar(motor.jenis)}" 
                                 class="w-100 h-100 object-fit-cover" alt="${motor.jenis}">
                            <span class="status-badge">Ready</span>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold text-dark mb-1">${motor.jenis}</h5>
                            <p class="text-muted small mb-3"><i class="bi bi-patch-check-fill text-primary"></i> Kondisi Terawat</p>
                            <div class="mt-auto">
                                <div class="price-text mb-3">${harga}</div>
                                <div class="d-grid">
                                    <button class="btn btn-outline-primary btn-detail" data-index="${index}">
                                        Lihat Detail Unit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Tambah event listener untuk tombol detail
        document.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                showMotorDetail(data[index]);
            });
        });

    } catch (error) {
        console.error("Fetch Error:", error);
        listContainer.innerHTML = `<div class="col-12 text-center py-5 text-danger">Koneksi ke server bermasalah. Pastikan Web App sudah di-deploy sebagai 'Anyone'.</div>`;
    }
}

// 5. Fungsi Tampilkan Detail Motor di Modal
function showMotorDetail(motor) {
    const harga = motor.hargaBuka 
        ? `Rp ${Number(motor.hargaBuka).toLocaleString('id-ID')}` 
        : 'Hubungi Dealer';

    // Buat modal HTML jika belum ada
    if (!document.getElementById('motorDetailModal')) {
        const modalHTML = `
            <div class="modal fade" id="motorDetailModal" tabindex="-1" aria-labelledby="motorDetailLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title fw-bold" id="motorDetailLabel">Detail Unit Motor</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img id="modal-image" src="" class="img-fluid rounded" alt="Motor Image">
                                </div>
                                <div class="col-md-6">
                                    <h4 id="modal-title" class="fw-bold text-primary"></h4>
                                    <p id="modal-price" class="price-text fs-5"></p>
                                    <p id="modal-status" class="badge bg-success fs-6"></p>
                                    <div class="mt-4">
                                        <button id="contact-dealer" class="btn btn-primary me-2"><i class="bi bi-whatsapp"></i> Hubungi Dealer</button>
                                        <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Isi modal dengan data motor
    document.getElementById('modal-image').src = motor.foto || dapatkanGambarFamiliar(motor.jenis);
    document.getElementById('modal-title').textContent = motor.jenis;
    document.getElementById('modal-price').textContent = harga;
    document.getElementById('modal-status').textContent = `Status: ${motor.status}`;

    // Tambah event listener untuk tombol Hubungi Dealer
    document.getElementById('contact-dealer').onclick = () => {
        const message = encodeURIComponent(`Halo, saya tertarik dengan motor ${motor.jenis} di showroom Anda. Harga: ${harga}.`);
        window.open(`https://wa.me/62881080591250?text=${message}`, '_blank');
    };

    // Tampilkan modal
    const modal = new bootstrap.Modal(document.getElementById('motorDetailModal'));
    modal.show();
}

// 6. Fungsi Tambah Unit (Kirim ke GAS via Fetch POST)
document.getElementById('formTambah').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    const motorData = {
        jenis: document.getElementById('jenis').value,
        tahun: document.getElementById('tahun').value,
        hargaBeli: document.getElementById('hargaBeli').value,
        biayaService: document.getElementById('biayaService').value,
        hargaBuka: document.getElementById('hargaBuka').value,
        tanggalMasuk: document.getElementById('tanggalMasuk').value,
        foto: document.getElementById('foto').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(motorData)
        });

        const result = await response.text();
        if (result === "Motor added successfully") {
            alert("Unit berhasil disimpan ke Database!");
            e.target.reset();
            logout();  // Refresh tampilan
        } else {
            alert("Gagal menyimpan unit: " + result);
        }
    } catch (err) {
        console.error("Error saving motor:", err);
        alert("Gagal menyimpan unit. Periksa koneksi.");
    }

    btn.disabled = false;
    btn.innerText = "Simpan ke Spreadsheet";
});

document.addEventListener('DOMContentLoaded', getCatalog);