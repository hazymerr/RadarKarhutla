export type KategoriRisiko = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'SANGAT TINGGI';

export type JenisLahan = 'gambut' | 'mineral' | 'semak' | 'bekas_kebun';

export type Musim = 'kemarau' | 'hujan' | 'pancaroba';

export type KecepatanAngin = 'rendah' | 'sedang' | 'tinggi'; // <10km/h, 10-25km/h, >25km/h

export type CurahHujan = 'sangat_rendah' | 'rendah' | 'sedang' | 'tinggi'; // 0-5mm, 5-15mm, 15-30mm, >30mm

export type KelembapanTanah = 'kering_kritis' | 'kering_sedang' | 'lembab' | 'basah';

export interface FormInput {
  lokasi: string;
  musim: Musim;
  jenis_lahan: JenisLahan;
  curah_hujan: CurahHujan;
  kelembapan_udara: number; // 0 - 100%
  kelembapan_tanah: KelembapanTanah;
  kecepatan_angin: KecepatanAngin;
  histori_titik_panas_10km: number; // radius 10km dalam 30 hari
  jarak_sumber_api_km: number | null; // null jika tidak terdeteksi
  
  // Data Petani / Lahan (Tugas 2)
  is_petani: boolean;
  luas_lahan_ha: number;
  kondisi_vegetasi?: string;
  ketersediaan_alat_anggaran?: string;
  catatan_tambahan?: string;

  // Deteksi Geolokasi Pengguna
  userCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    displayName?: string;
    timestamp?: number;
  };
}

export interface RekomendasiPetani {
  metode_utama: string;
  penjelasan: string;
  estimasi_biaya_relatif: 'Rendah' | 'Sedang' | 'Tinggi';
  estimasi_waktu: string;
  alternatif_lain: string[];
}

export interface HasilAnalisis {
  skor_risiko: number;
  kategori_risiko: KategoriRisiko;
  alasan_risiko: string;
  asumsi: string | null;
  peringatan_keselamatan: string | null;
  rekomendasi_petani: RekomendasiPetani;
  
  // Proyeksi 7 hari untuk representasi visual
  proyeksi_7_hari?: {
    hari: number;
    tanggal: string;
    label_hari: string;
    skor: number;
    kategori: KategoriRisiko;
    kondisi: string;
  }[];
  
  // Metadata respons
  metode_komputasi?: 'gemini-ai' | 'aturan-lokal';
}

export interface PresetSkenario {
  id: string;
  judul: string;
  wilayah: string;
  deskripsi: string;
  data: FormInput;
}

export interface GroundingWebSource {
  title: string;
  uri: string;
}

export interface GroundingMapSource {
  title: string;
  uri: string;
  address?: string;
}

export interface SearchGroundingResult {
  summary: string;
  sources: GroundingWebSource[];
  queryTime: string;
  location: string;
}

export interface MapsGroundingResult {
  summary: string;
  places: GroundingMapSource[];
  queryTime: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
