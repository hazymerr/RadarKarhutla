import { FormInput, HasilAnalisis, KategoriRisiko } from '../types.ts';

export function tentukanKategori(skor: number): KategoriRisiko {
  if (skor <= 30) return 'RENDAH';
  if (skor <= 60) return 'SEDANG';
  if (skor <= 85) return 'TINGGI';
  return 'SANGAT TINGGI';
}

export function hitungRisikoLokal(input: FormInput): HasilAnalisis {
  let skor = 0;
  const alasanPoin: string[] = [];
  const asumsiList: string[] = [];

  // 1. Musim (Kemarau = risiko dasar lebih tinggi)
  if (input.musim === 'kemarau') {
    skor += 22;
    alasanPoin.push('periode musim kemarau meningkatkan kekeringan serasah alami');
  } else if (input.musim === 'pancaroba') {
    skor += 12;
  } else {
    skor += 4;
  }

  // 2. Curah hujan & Kelembapan Udara (Curah hujan rendah + kelembapan udara rendah = risiko naik signifikan)
  let cuacaSkor = 0;
  if (input.curah_hujan === 'sangat_rendah') cuacaSkor += 20;
  else if (input.curah_hujan === 'rendah') cuacaSkor += 14;
  else if (input.curah_hujan === 'sedang') cuacaSkor += 6;
  else cuacaSkor += 1;

  if (input.kelembapan_udara < 45) cuacaSkor += 16;
  else if (input.kelembapan_udara < 60) cuacaSkor += 10;
  else if (input.kelembapan_udara < 75) cuacaSkor += 4;
  else cuacaSkor += 1;

  skor += cuacaSkor;
  if (input.curah_hujan === 'sangat_rendah' || input.curah_hujan === 'rendah' || input.kelembapan_udara < 50) {
    alasanPoin.push(`curah hujan yang minim disertai kelembapan udara rendah (${input.kelembapan_udara}%) membuat vegetasi sangat mudah tersulut`);
  }

  // 3. Jenis Lahan (Gambut = risiko jauh lebih tinggi dibanding mineral)
  if (input.jenis_lahan === 'gambut') {
    skor += 22;
    alasanPoin.push('karakteristik lahan gambut menyimpan potensi kebakaran bawah permukaan (smouldering fire) yang sulit dipadamkan');
  } else if (input.jenis_lahan === 'semak') {
    skor += 14;
    alasanPoin.push('vegetasi semak kering berpotensi menjadi bahan bakar cepat rambat');
  } else if (input.jenis_lahan === 'bekas_kebun') {
    skor += 11;
  } else {
    skor += 6;
  }

  // Kelembapan Tanah
  if (input.kelembapan_tanah === 'kering_kritis') {
    skor += 15;
  } else if (input.kelembapan_tanah === 'kering_sedang') {
    skor += 9;
  } else if (input.kelembapan_tanah === 'lembab') {
    skor += 3;
  } else {
    skor -= 4;
  }

  // 4. Kecepatan Angin (mempercepat penyebaran jika ada api)
  if (input.kecepatan_angin === 'tinggi') {
    skor += 14;
    alasanPoin.push('hembusan angin kencang berisiko melipatgandakan laju rambat api dan loncatan bara');
  } else if (input.kecepatan_angin === 'sedang') {
    skor += 7;
  } else {
    skor += 2;
  }

  // 5. Histori Titik Panas radius 10km dalam 30 hari terakhir
  if (input.histori_titik_panas_10km > 10) {
    skor += 15;
    alasanPoin.push(`tercatat ${input.histori_titik_panas_10km} hotspot aktif dalam radius 10 km menandakan kerawanan kawasan sangat intensif`);
  } else if (input.histori_titik_panas_10km >= 4) {
    skor += 10;
    alasanPoin.push(`adanya ${input.histori_titik_panas_10km} titik panas historis menunjukkan adanya aktivitas api di sekitar wilayah`);
  } else if (input.histori_titik_panas_10km >= 1) {
    skor += 5;
  }

  // 6. Jarak dari Sumber Api Aktif
  if (input.jarak_sumber_api_km !== null) {
    if (input.jarak_sumber_api_km <= 3) {
      skor += 16;
      alasanPoin.push(`jarak sumber api aktif sangat dekat (${input.jarak_sumber_api_km} km) sehingga ancaman penjalaran langsung sangat nyata`);
    } else if (input.jarak_sumber_api_km <= 8) {
      skor += 9;
    }
  } else {
    asumsiList.push('Tidak ada laporan sumber api aktif spesifik di lokasi langsung, diasumsikan jarak sumber api terdekat >10 km');
  }

  // Normalisasi skor 0 - 100
  skor = Math.max(5, Math.min(100, Math.round(skor)));
  const kategori = tentukanKategori(skor);

  // Alasan Risiko (2-3 kalimat)
  let alasan_risiko = '';
  if (alasanPoin.length >= 2) {
    alasan_risiko = `Skor risiko ${skor} (${kategori}) dipicu oleh gabungan ${alasanPoin.slice(0, 2).join(', serta ')}. ${alasanPoin[2] ? 'Kondisi ini diperparah oleh ' + alasanPoin[2] + '.' : 'Potensi terjadinya dan meluasnya karhutla dalam 7 hari ke depan sangat perlu diantisipasi.'}`;
  } else {
    alasan_risiko = `Skor risiko karhutla berada pada level ${kategori} (${skor}/100) berdasarkan pemantauan cuaca dan tipe tutupan lahan. Fluktuasi kelembapan dan arah angin tetap wajib dipantau berkala selama 7 hari ke depan.`;
  }

  // Peringatan Keselamatan jika TINGGI / SANGAT TINGGI
  let peringatan_keselamatan: string | null = null;
  if (kategori === 'SANGAT TINGGI') {
    peringatan_keselamatan = 'PERINGATAN DARURAT KARHUTLA: Kondisi cuaca dan lahan sangat ekstrem! DILARANG KERAS menyalakan api dalam bentuk apa pun. Segera siapkan masker pelindung (minimal N95/kain berlapis basah), amankan balita serta lansia dari potensi paparan asap tebal, dan aktifkan posko ronda patroli api desa secara bergantian.';
  } else if (kategori === 'TINGGI') {
    peringatan_keselamatan = 'PERINGATAN SIAGA KARHUTLA: Tingkat kerawanan api tinggi. Hindari segala aktivitas pembersihan lahan yang memicu percikan api. Pastikan pasokan air (embung/parit sekunder) dan pompa portable siap pakai, serta pasang sekat bakar pembatas kebun.';
  }

  // TUGAS 2: REKOMENDASI PENCEGAHAN UNTUK PETANI (PLTB)
  const luas = input.luas_lahan_ha || 1;
  const isGambut = input.jenis_lahan === 'gambut';
  const isLuas = luas >= 2;

  let metode_utama = '';
  let penjelasan = '';
  let estimasi_biaya_relatif: 'Rendah' | 'Sedang' | 'Tinggi' = 'Sedang';
  let estimasi_waktu = '';
  let alternatif_lain: string[] = [];

  if (isGambut) {
    if (isLuas) {
      metode_utama = 'Metode Chopping & Mulching dengan Bantuan Dekomposer Mikroorganisme Gambut';
      penjelasan = 'Sisa tebasan rumput, ilalang, dan ranting dicacah halus menggunakan mesin pencacah (chipper/chopper) lalu dihamparkan merata sebagai mulsa penutup tanah. Siramkan larutan mikroorganisme pengurai (dekomposer lokal seperti EM4 atau Tricoderma) agar serasah cepat lapuk menjadi pupuk organik tanpa perlu dibakar sama sekali. Buat parit sekat bakar selebar minimal 3 meter di sekeliling batas lahan untuk menyekat rambatan api dari luar kebun.';
      estimasi_biaya_relatif = 'Sedang';
      estimasi_waktu = '7 - 14 hari pengerjaan';
      alternatif_lain = [
        'Pemanfaatan ekskavator mini untuk land clearing mekanis tanpa bakar dan pembuatan parit tapal batas',
        'Pengomposan dalam guludan (heaping system) yang ditutup terpal',
        'Pengajuan bantuan pinjam pakai mesin perajang serasah melalui Pokja Desa Peduli Gambut (BRGM)'
      ];
    } else {
      metode_utama = 'Penebasan Manual dan Fermentasi Dekomposisi Alami (Kompos Serasah)';
      penjelasan = 'Tebas gulma dan semak menggunakan parang atau arit secara manual, lalu kumpulkan sisa tanaman menjadi barisan guludan memanjang di antara calon larikan tanaman. Campurkan sisa tanaman dengan pupuk kandang atau cairan bio-dekomposer lalu tutup dengan mulsa daun pisang atau terpal agar membusuk secara alami dalam 3-4 minggu. Pastikan tanah gambut tetap terjaga kelembapannya dengan tidak mengeringkan parit cacing secara berlebihan.';
      estimasi_biaya_relatif = 'Rendah';
      estimasi_waktu = '4 - 7 hari pengerjaan';
      alternatif_lain = [
        'Metode tebas timbun (chopping manual) langsung menjadi mulsa organik',
        'Gotong royong kelompok tani untuk pembuatan sekat bakar basah di batas ladang',
        'Konsultasi penyuluh pertanian lapangan (PPL) untuk pasokan bakteri pengurai gratis'
      ];
    }
  } else {
    // Mineral atau Semak atau Bekas Kebun
    if (isLuas) {
      metode_utama = 'Land Clearing Mekanis Tanpa Bakar (Mekanisasi Excavator Rake & Chopper)';
      penjelasan = 'Gunakan alat berat (excavator dengan garpu pembersih atau traktor rotary) untuk merobohkan semak belukar dan menumpuk sisa kayu tanpa ada pembakaran. Batang kayu besar ditumpuk rapi di jalur tepi sebagai pembatas angin atau bahan kayu bakar rumah tangga, sementara ranting dan dedaunan dicacah langsung menjadi mulsa tanah. Buat sekat bakar (fire break) bersih dari serasah selebar 4 meter sepanjang batas perbatasan hutan atau kebun tetangga.';
      estimasi_biaya_relatif = 'Tinggi';
      estimasi_waktu = '3 - 6 hari kerja mesin';
      alternatif_lain = [
        'Sistem sewa traktor rotary gilir melalui kelompok tani / Gapoktan setempat',
        'Metode tebang-cacah bertahap dikombinasikan dengan penanaman tanaman penutup tanah (Legume Cover Crop)',
        'Pemanfaatan sisa kayu sebagai bahan baku arang sekam atau kayu pertukangan'
      ];
    } else {
      metode_utama = 'Metode Tebas-Cacah dan Mulsa Organik (Chopping & Mulching Manual)';
      penjelasan = 'Babat vegetasi semak dan rumput ilalang secara manual menggunakan parang atau mesin babat rumput dorong, kemudian cacah sisa tanaman menjadi potongan pendek 5-10 cm. Tebarkan cacahan tersebut secara merata di atas bedengan atau permukaan tanah untuk menjaga kelembapan tanah dan menekan pertumbuhan gulma baru. Sisa ranting yang lebih keras dapat dikumpulkan di sudut kebun untuk dijadikan kompos padat tanpa perlu dibakar.';
      estimasi_biaya_relatif = 'Rendah';
      estimasi_waktu = '3 - 5 hari pengerjaan';
      alternatif_lain = [
        'Pembuatan kompos bokashi serasah dengan molase dan dedak',
        'Pembersihan sekat bakar selebar 2-3 meter mengelilingi bidang tanam',
        'Pemanfaatan sisa pangkasan untuk pakan ternak kambing atau sapi jika ada jenis rumput gajah/rumput lapang'
      ];
    }
  }

  // Tambahan sekat bakar & rekomendasi BRG jika relevan
  if (kategori === 'TINGGI' || kategori === 'SANGAT TINGGI') {
    alternatif_lain.push('Wajib mendesak: Pembuatan sekat bakar selebar minimal 4-5 meter bersih hingga tanah mineral/basah sebelum memulai pengerjaan fisik');
  }
  if (isGambut) {
    alternatif_lain.push('Rujukan: Akses bantuan alat/saprodi PLTB melalui program Desa Peduli Gambut (DPG) Badan Restorasi Gambut dan Mangrove (BRGM) RI');
  }

  // Proyeksi 7 Hari
  const sekarang = new Date();
  const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const proyeksi_7_hari = [];
  
  // Tren proyeksi tergantung pada musim dan cuaca
  let drift = input.musim === 'kemarau' ? 2 : (input.musim === 'hujan' ? -3 : 0);
  for (let i = 1; i <= 7; i++) {
    const d = new Date(sekarang);
    d.setDate(sekarang.getDate() + i);
    const dayName = namaHari[d.getDay()];
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    
    // Variasi acak kecil yang stabil
    const dailyScore = Math.max(5, Math.min(100, Math.round(skor + (i - 1) * drift + Math.sin(i * 1.5) * 4)));
    const dailyCat = tentukanKategori(dailyScore);
    
    let kondisi = 'Cuaca kering berlanjut';
    if (dailyCat === 'SANGAT TINGGI') kondisi = 'Ekstrem kering & siaga darurat';
    else if (dailyCat === 'TINGGI') kondisi = 'Rawan percikan & angin kencang';
    else if (dailyCat === 'SEDANG') kondisi = 'Kering moderat, waspada';
    else kondisi = 'Relatif lembap & aman';

    proyeksi_7_hari.push({
      hari: i,
      tanggal: dateStr,
      label_hari: `Hari ke-${i} (${dayName})`,
      skor: dailyScore,
      kategori: dailyCat,
      kondisi,
    });
  }

  return {
    skor_risiko: skor,
    kategori_risiko: kategori,
    alasan_risiko,
    asumsi: asumsiList.length > 0 ? asumsiList.join('; ') : null,
    peringatan_keselamatan,
    rekomendasi_petani: {
      metode_utama,
      penjelasan,
      estimasi_biaya_relatif,
      estimasi_waktu,
      alternatif_lain
    },
    proyeksi_7_hari,
    metode_komputasi: 'aturan-lokal',
  };
}
