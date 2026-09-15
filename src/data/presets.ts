import { PresetSkenario } from '../types.ts';

export const PRESET_SKENARIOS: PresetSkenario[] = [
  {
    id: 'riau-gambut-kemarau',
    judul: 'Gambut Riau (Bengkalis) - Siaga Kemarau Ekstrem',
    wilayah: 'Kab. Bengkalis, Riau',
    deskripsi: 'Lahan gambut dalam, musim kemarau puncak, angin kencang dan ada 8 hotspot terdeteksi di radius 10 km.',
    data: {
      lokasi: 'Kec. Bukit Batu, Kab. Bengkalis, Riau',
      musim: 'kemarau',
      jenis_lahan: 'gambut',
      curah_hujan: 'sangat_rendah',
      kelembapan_udara: 42,
      kelembapan_tanah: 'kering_kritis',
      kecepatan_angin: 'tinggi',
      histori_titik_panas_10km: 8,
      jarak_sumber_api_km: 2.5,
      is_petani: true,
      luas_lahan_ha: 3.0,
      kondisi_vegetasi: 'Semak pakis kawat dan serasah gambut tebal 1.5 meter',
      ketersediaan_alat_anggaran: 'Alat manual parang dan mesin pompa air apung desa',
      catatan_tambahan: 'Rencana pembersihan untuk peremajaan tanaman kelapa sawit rakyat'
    }
  },
  {
    id: 'kalteng-kotim-darurat',
    judul: 'Kotawaringin Timur (Kalteng) - Kritis Hotspot & Asap',
    wilayah: 'Sampit, Kotawaringin Timur, Kalimantan Tengah',
    deskripsi: 'Gambut terdegradasi, kelembapan udara sangat rendah (38%), titik api aktif tercium dalam 4 km.',
    data: {
      lokasi: 'Kec. Mentawa Baru Ketapang, Kotim, Kalteng',
      musim: 'kemarau',
      jenis_lahan: 'gambut',
      curah_hujan: 'sangat_rendah',
      kelembapan_udara: 38,
      kelembapan_tanah: 'kering_kritis',
      kecepatan_angin: 'tinggi',
      histori_titik_panas_10km: 14,
      jarak_sumber_api_km: 1.8,
      is_petani: true,
      luas_lahan_ha: 1.5,
      kondisi_vegetasi: 'Ilalang kering dan semak belukar liar',
      ketersediaan_alat_anggaran: 'Hanya tenaga keluarga (manual cangkul/parang), anggaran minim',
      catatan_tambahan: 'Petani ingin bersiap menanam sayur hortikultura menjelang musim hujan'
    }
  },
  {
    id: 'sumsel-muba-mineral',
    judul: 'Musi Banyuasin (Sumsel) - Mineral Bekas Kebun Karet',
    wilayah: 'Kab. Musi Banyuasin, Sumatera Selatan',
    deskripsi: 'Tanah mineral lempung berpasir, cuaca kering moderat, belum ada titik api aktif dekat lokasi.',
    data: {
      lokasi: 'Kec. Sekayu, Musi Banyuasin, Sumsel',
      musim: 'pancaroba',
      jenis_lahan: 'bekas_kebun',
      curah_hujan: 'sedang',
      kelembapan_udara: 65,
      kelembapan_tanah: 'kering_sedang',
      kecepatan_angin: 'sedang',
      histori_titik_panas_10km: 1,
      jarak_sumber_api_km: null,
      is_petani: true,
      luas_lahan_ha: 4.5,
      kondisi_vegetasi: 'Tunggul karet tua dan gulma semak berduri',
      ketersediaan_alat_anggaran: 'Tersedia anggaran sewa alat berat mini excavator kelompok tani',
      catatan_tambahan: 'Ingin replanting ke komoditas jagung pipil dan kedelai'
    }
  },
  {
    id: 'kalbar-sambas-aman',
    judul: 'Sambas (Kalbar) - Musim Penghujan Kondisi Aman',
    wilayah: 'Kab. Sambas, Kalimantan Barat',
    deskripsi: 'Curah hujan tinggi dan tanah lembap, risiko kebakaran sangat rendah, ideal untuk penataan kompos alami.',
    data: {
      lokasi: 'Kec. Pemangkat, Kab. Sambas, Kalbar',
      musim: 'hujan',
      jenis_lahan: 'mineral',
      curah_hujan: 'tinggi',
      kelembapan_udara: 82,
      kelembapan_tanah: 'lembab',
      kecepatan_angin: 'rendah',
      histori_titik_panas_10km: 0,
      jarak_sumber_api_km: null,
      is_petani: true,
      luas_lahan_ha: 1.0,
      kondisi_vegetasi: 'Rumput gajah liar dan sisa panen singkong',
      ketersediaan_alat_anggaran: 'Alat manual cangkul & sabit, mesin potong rumput jinjing',
      catatan_tambahan: 'Petani ingin membuat bedengan cabe rawit ramah lingkungan'
    }
  }
];
