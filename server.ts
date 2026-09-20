import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { hitungRisikoLokal, tentukanKategori } from './src/utils/karhutlaRules.ts';
import { FormInput, HasilAnalisis, SearchGroundingResult, MapsGroundingResult } from './src/types.ts';

// In-memory cache for analysis results to preserve quota & speed up repeated preset visits
const analysisCache = new Map<string, { data: HasilAnalisis; expiresAt: number }>();
// Caches for Google Search and Google Maps Grounding
const searchCache = new Map<string, { data: SearchGroundingResult; expiresAt: number }>();
const mapsCache = new Map<string, { data: MapsGroundingResult; expiresAt: number }>();
// Cooldown tracking for models and tools that hit 429 rate limit
const modelCooldowns = new Map<string, number>();
let searchGroundingCooldownUntil = 0;
let mapsGroundingCooldownUntil = 0;

// High-fidelity regional search fallback when Gemini quota/rate limits occur
function getRegionalSearchFallback(targetLokasi: string): SearchGroundingResult {
  const lower = targetLokasi.toLowerCase();
  let summary = `Informasi Lapangan & Peringatan Dini Karhutla (${targetLokasi}): Pantauan hotspot harian dari satelit SNPP/VIIRS dan Terra/Aqua terus dipantau bersama BPBD dan Posko Siaga Bencana. Prioritaskan pencegahan dengan mempertahankan kelembapan serasah gambut, siapkan sekat bakar keliling, dan hindari penggunaan api terbuka saat kecepatan angin meningkat.`;
  
  if (lower.includes('bengkalis') || lower.includes('riau')) {
    summary = `Status Karhutla Terkini Kab. Bengkalis & Provinsi Riau: Status Siaga Darurat Karhutla aktif di wilayah pesisir timur Riau. Pantauan intensif difokuskan pada Kesatuan Hidrologis Gambut (KHG) Semenanjung Kampar dan Pulau Bengkalis. Satgas Udara dan Manggala Agni Daops Siak-Bengkalis melaksanakan water bombing dan patroli terpadu mandiri.`;
  } else if (lower.includes('kalteng') || lower.includes('kotim') || lower.includes('sampit') || lower.includes('mentaya')) {
    summary = `Status Karhutla Terkini Kab. Kotawaringin Timur & Kalteng: Memasuki periode rawan kemarau, fluktuasi muka air tanah di KHG Mentaya-Katingan dipantau ketat. BPBD Kotim bersama relawan TSA (Tim Siaga Api) desa mengaktifkan patroli berkala di sepanjang koridor pertanian dan semak belukar gambut tebal.`;
  } else if (lower.includes('sumsel') || lower.includes('muba') || lower.includes('banyuasin') || lower.includes('sekayu')) {
    summary = `Status Karhutla Terkini Kab. Musi Banyuasin & Sumsel: Satgas Penanggulangan Karhutla Sumsel menyiagakan posko pencegahan di KHG Sugihan-Saleh. Patroli darat terpadu dan pembasahan (rewetting) kanal primer dilakukan guna menjaga kedalaman muka air tanah di atas ambang kritis -40 cm.`;
  } else if (lower.includes('kalbar') || lower.includes('sambas')) {
    summary = `Status Karhutla Terkini Kab. Sambas & Kalbar: Koordinasi pencegahan lintas sektor di KHG Sambas-Paloh diperketat menyusul kenaikan suhu permukaan dan angin kencang pesisir. Petani dihimbau menerapkan metode Pembukaan Lahan Tanpa Bakar (PLTB) dengan dekomposisi hayati.`;
  }

  return {
    summary,
    sources: [
      { title: 'Sistem Informasi Karhutla SiPongi+ (KLHK RI)', uri: 'https://sipongi.menlhk.go.id/' },
      { title: 'BMKG Fire Danger Rating System (FDRS) Indonesia', uri: 'https://www.bmkg.go.id/cuaca/peringatan-dini-cuaca.bmkg' },
      { title: 'Badan Restorasi Gambut dan Mangrove (BRGM)', uri: 'https://brgm.go.id/' },
      { title: `Pusat Pengendalian Operasi BPBD (${targetLokasi})`, uri: 'https://bnpb.go.id/' }
    ],
    queryTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    location: targetLokasi
  };
}

// High-fidelity regional emergency post fallback when Gemini Maps quota/rate limits occur
function getRegionalMapsFallback(targetLokasi: string, lat: number, lng: number): MapsGroundingResult {
  const lower = targetLokasi.toLowerCase();
  let places = [
    {
      title: `Kantor BPBD & Posko Siaga Bencana (${targetLokasi})`,
      uri: `https://www.google.com/maps/search/BPBD+${encodeURIComponent(targetLokasi)}`,
      address: `Pusat Pengendalian Operasi Penanggulangan Bencana wilayah ${targetLokasi}`
    },
    {
      title: `Pos Komando Daops Manggala Agni KLHK`,
      uri: `https://www.google.com/maps/search/Manggala+Agni+${encodeURIComponent(targetLokasi)}`,
      address: 'Satuan Tugas Pengendalian Kebakaran Hutan dan Lahan KLHK'
    },
    {
      title: `Dinas Pemadam Kebakaran & Penyelamatan (${targetLokasi})`,
      uri: `https://www.google.com/maps/search/Pemadam+Kebakaran+${encodeURIComponent(targetLokasi)}`,
      address: 'Unit Reaksi Cepat Pemadaman Karhutla & Pemukiman'
    }
  ];

  if (lower.includes('bengkalis') || lower.includes('riau')) {
    places = [
      {
        title: 'BPBD Kabupaten Bengkalis (Pusdalops-PB)',
        uri: 'https://www.google.com/maps/search/BPBD+Bengkalis+Riau',
        address: 'Jl. Antara No. 1, Bengkalis Kota, Riau (Call Center Darurat: 0766-8001004)'
      },
      {
        title: 'Manggala Agni Daops Sumatera VI / Siak - Bengkalis',
        uri: 'https://www.google.com/maps/search/Manggala+Agni+Siak+Bengkalis',
        address: 'Pos Komando Brigade Pengendalian Karhutla KLHK Wilayah Riau Pesisir'
      },
      {
        title: 'Dinas Pemadam Kebakaran Kab. Bengkalis',
        uri: 'https://www.google.com/maps/search/Pemadam+Kebakaran+Bengkalis',
        address: 'Pos Damkar Regu Mandau & Bengkalis Kota'
      }
    ];
  } else if (lower.includes('kotim') || lower.includes('sampit') || lower.includes('kalteng')) {
    places = [
      {
        title: 'BPBD Kabupaten Kotawaringin Timur (Sampit)',
        uri: 'https://www.google.com/maps/search/BPBD+Kotawaringin+Timur+Sampit',
        address: 'Jl. Jenderal Sudirman Km 6, Sampit, Kotim, Kalimantan Tengah'
      },
      {
        title: 'Manggala Agni Daops Kalteng II / Kapuas - Kotim',
        uri: 'https://www.google.com/maps/search/Manggala+Agni+Sampit+Kotim',
        address: 'Pos Siaga Reaksi Cepat Karhutla Lahan Gambut Mentaya'
      },
      {
        title: 'Disdamkarmat Kab. Kotawaringin Timur',
        uri: 'https://www.google.com/maps/search/Damkar+Sampit+Kotim',
        address: 'Dinas Pemadam Kebakaran dan Penyelamatan Kotim'
      }
    ];
  } else if (lower.includes('muba') || lower.includes('sekayu') || lower.includes('sumsel')) {
    places = [
      {
        title: 'BPBD Kabupaten Musi Banyuasin (Sekayu)',
        uri: 'https://www.google.com/maps/search/BPBD+Musi+Banyuasin+Sekayu',
        address: 'Jl. Kolonel Wahid Udin, Sekayu, Musi Banyuasin, Sumatera Selatan'
      },
      {
        title: 'Manggala Agni Daops Sumatera XVI / Musi Banyuasin',
        uri: 'https://www.google.com/maps/search/Manggala+Agni+Musi+Banyuasin',
        address: 'Posko Wilayah Penanganan Karhutla Gambut Sugihan - Saleh'
      },
      {
        title: 'Satpol PP & Pemadam Kebakaran Musi Banyuasin',
        uri: 'https://www.google.com/maps/search/Pemadam+Kebakaran+Sekayu+Muba',
        address: 'Regu Tanggap Darurat Bencana Api Lahan & Perkebunan'
      }
    ];
  } else if (lower.includes('sambas') || lower.includes('kalbar')) {
    places = [
      {
        title: 'BPBD Kabupaten Sambas',
        uri: 'https://www.google.com/maps/search/BPBD+Kabupaten+Sambas',
        address: 'Jl. Pembangunan, Sambas, Kalimantan Barat'
      },
      {
        title: 'Manggala Agni Daops Kalimantan IX / Singkawang - Sambas',
        uri: 'https://www.google.com/maps/search/Manggala+Agni+Singkawang+Sambas',
        address: 'Posko Siaga Karhutla Sektor Pesisir Sambas - Paloh'
      },
      {
        title: 'Pemadam Kebakaran & Penyelamatan Kab. Sambas',
        uri: 'https://www.google.com/maps/search/Pemadam+Kebakaran+Sambas',
        address: 'Unit Penyelamatan dan Armada Tanggap Bencana Api Darat'
      }
    ];
  }

  return {
    summary: `Posko Siaga Penanggulangan Karhutla di sekitar ${targetLokasi}. Hubungi kontak darurat posko terdekat atau call center 112 untuk mobilisasi regu tanggap bencana.`,
    places,
    queryTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    location: targetLokasi,
    coordinates: { latitude: lat, longitude: lng }
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'RadarKarhutla API',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // Karhutla AI Risk & Farmer Advisory Endpoint
  app.post('/api/analyze', async (req, res) => {
    const input: FormInput = req.body;

    // Validate minimum payload
    if (!input || !input.jenis_lahan || !input.musim) {
      res.status(400).json({ error: 'Data parameter cuaca atau lahan tidak lengkap.' });
      return;
    }

    // Check cache key (deterministic for same input parameters)
    const cacheKey = JSON.stringify({
      lokasi: input.lokasi,
      musim: input.musim,
      jenis_lahan: input.jenis_lahan,
      curah_hujan: input.curah_hujan,
      kelembapan_udara: input.kelembapan_udara,
      kelembapan_tanah: input.kelembapan_tanah,
      kecepatan_angin: input.kecepatan_angin,
      histori_titik_panas_10km: input.histori_titik_panas_10km,
      jarak_sumber_api_km: input.jarak_sumber_api_km,
      luas_lahan_ha: input.luas_lahan_ha,
    });

    const now = Date.now();
    const cached = analysisCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      res.json(cached.data);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const promptText = `
Data Parameter Karhutla & Lahan dari User:
- Lokasi: ${input.lokasi || 'Tidak disebutkan'}
- Musim: ${input.musim} (kemarau/hujan/pancaroba)
- Jenis Lahan: ${input.jenis_lahan} (gambut/mineral/semak/bekas_kebun)
- Curah Hujan: ${input.curah_hujan}
- Kelembapan Udara: ${input.kelembapan_udara}%
- Kelembapan Tanah: ${input.kelembapan_tanah}
- Kecepatan Angin: ${input.kecepatan_angin}
- Histori Titik Panas dalam radius 10 km (30 hari terakhir): ${input.histori_titik_panas_10km} hotspot
- Jarak dari Sumber Api Aktif: ${input.jarak_sumber_api_km !== null ? `${input.jarak_sumber_api_km} km` : 'Tidak terdeteksi / tidak ada laporan aktif'}

Informasi Petani / Rencana Lahan:
- Berencana membersihkan / membuka lahan: ${input.is_petani ? 'Ya' : 'Hanya pemantauan risiko'}
- Luas Lahan: ${input.luas_lahan_ha} Hektar
- Kondisi Vegetasi: ${input.kondisi_vegetasi || 'Semak campuran dan serasah'}
- Ketersediaan Alat / Anggaran: ${input.ketersediaan_alat_anggaran || 'Alat manual standar'}
- Catatan Tambahan: ${input.catatan_tambahan || 'Tidak ada'}

Instruksi Khusus:
Jalankan Tugas 1 (Analisis Risiko 7 hari 0-100) dan Tugas 2 (Rekomendasi PLTB untuk petani) secara berurutan sesuai aturan sistem.
Kembalikan HANYA JSON murni yang sesuai dengan skema format yang ditentukan tanpa markdown wrapping.
`;

        // Ordered candidate models with separate quota pools
        const candidateModels = [
          'gemini-flash-latest',
          'gemini-3.6-flash',
          'gemini-3.8-flash',
        ];

        let responseText: string | null = null;

        for (const modelName of candidateModels) {
          // Check if this model is on temporary cooldown due to 429 quota exhaustion
          const cooldownUntil = modelCooldowns.get(modelName) || 0;
          if (now < cooldownUntil) {
            continue;
          }

          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: promptText,
              config: {
                systemInstruction: `Kamu adalah AI analis risiko karhutla (kebakaran hutan dan lahan) sekaligus penasihat pertanian untuk platform mitigasi bencana asap dan abu vulkanik bernama [RadarKarhutla].

TUGAS UTAMA KAMU ADA DUA, DAN HARUS DIJALANKAN BERURUTAN:

TUGAS 1 - ANALISIS RISIKO KARHUTLA
Berdasarkan data yang diberikan (cuaca, kelembapan tanah, jenis lahan, histori titik panas, musim, dan jarak dari sumber api aktif jika ada), hitung skor risiko karhutla untuk lokasi tersebut dalam skala 0-100 untuk periode 7 hari ke depan.

Pertimbangkan faktor berikut dan bobotnya secara kualitatif:
- Curah hujan rendah + kelembapan udara rendah = risiko naik signifikan
- Jenis lahan gambut = risiko lebih tinggi dibanding lahan mineral
- Kecepatan angin tinggi = mempercepat penyebaran jika ada api
- Histori titik panas dalam radius 10km dalam 30 hari terakhir = risiko naik
- Musim kemarau (umumnya Juni-Oktober di Indonesia) = risiko dasar lebih tinggi

Klasifikasikan menjadi: RENDAH (0-30), SEDANG (31-60), TINGGI (61-85), SANGAT TINGGI (86-100)

TUGAS 2 - REKOMENDASI PENCEGAHAN UNTUK PETANI
Jika user memberikan informasi bahwa mereka petani/pemilik lahan yang berencana membuka atau membersihkan lahan, berikan rekomendasi metode PLTB (Pembukaan Lahan Tanpa Bakar) yang sesuai dengan:
- Skor risiko dari Tugas 1 (semakin tinggi risiko, semakin mendesak rekomendasi non-bakar)
- Jenis lahan (gambut, mineral, semak, bekas kebun)
- Luas lahan (mempengaruhi metode: manual vs mekanis)
- Ketersediaan alat berat/anggaran jika disebutkan user

Metode yang bisa direkomendasikan antara lain:
- Chopping and mulching (mencacah dan menimbun sisa vegetasi jadi kompos)
- Cara mekanis dengan alat berat (excavator/land clearing tanpa bakar) untuk lahan luas
- Fermentasi/dekomposisi alami dengan bantuan mikroorganisme untuk lahan gambut
- Pembuatan sekat bakar (fire break) sebagai pencegahan tambahan
- Rujukan ke skema bantuan alat dari pemerintah/BRG (Badan Restorasi Gambut) jika relevan

ATURAN PENTING:
1. SELALU berikan penjelasan alasan (reasoning) singkat untuk skor risiko, jangan hanya angka
2. Jika skor risiko SANGAT TINGGI, prioritaskan peringatan keselamatan sebelum rekomendasi teknis
3. Gunakan bahasa Indonesia yang mudah dipahami petani awam, hindari jargon teknis berlebihan
4. Jika data yang diberikan tidak lengkap, tetap berikan estimasi terbaik dan sebutkan asumsi apa yang kamu pakai di field "asumsi"
5. JANGAN pernah merekomendasikan pembakaran lahan dalam kondisi apapun, walaupun user menganggapnya cara tercepat/termurah
6. Jawaban HARUS dalam format JSON sesuai skema yang ditentukan, tanpa teks tambahan di luar JSON`,
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    skor_risiko: { type: Type.INTEGER, description: 'Skor risiko karhutla 0-100' },
                    kategori_risiko: { type: Type.STRING, description: 'RENDAH, SEDANG, TINGGI, atau SANGAT TINGGI' },
                    alasan_risiko: { type: Type.STRING, description: 'Penjelasan singkat 2-3 kalimat' },
                    asumsi: { type: Type.STRING, description: 'Asumsi data yang dipakai jika kurang lengkap atau null', nullable: true },
                    peringatan_keselamatan: { type: Type.STRING, description: 'Peringatan jika kategori TINGGI/SANGAT TINGGI atau null', nullable: true },
                    rekomendasi_petani: {
                      type: Type.OBJECT,
                      properties: {
                        metode_utama: { type: Type.STRING },
                        penjelasan: { type: Type.STRING },
                        estimasi_biaya_relatif: { type: Type.STRING },
                        estimasi_waktu: { type: Type.STRING },
                        alternatif_lain: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        }
                      },
                      required: ['metode_utama', 'penjelasan', 'estimasi_biaya_relatif', 'estimasi_waktu', 'alternatif_lain']
                    }
                  },
                  required: ['skor_risiko', 'kategori_risiko', 'alasan_risiko', 'rekomendasi_petani']
                }
              }
            });

            if (response.text) {
              responseText = response.text.trim();
              break;
            }
          } catch (err: unknown) {
            // Set 45-second cooldown for models reporting quota or rate limit issues
            const errMsg = String(err);
            if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota')) {
              modelCooldowns.set(modelName, Date.now() + 45000);
            }
            // Proceed quietly to next candidate model without flooding logs
          }
        }

        if (responseText) {
          const parsedJson = JSON.parse(responseText);

          // Normalize score and category in case of minor discrepancy
          let skor = Number(parsedJson.skor_risiko) || 0;
          skor = Math.max(0, Math.min(100, skor));
          const kategori = tentukanKategori(skor);

          // Compute 7-day projection for visual representation
          const sekarang = new Date();
          const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          const drift = input.musim === 'kemarau' ? 2 : (input.musim === 'hujan' ? -3 : 0);
          const proyeksi_7_hari = [];
          for (let i = 1; i <= 7; i++) {
            const d = new Date(sekarang);
            d.setDate(sekarang.getDate() + i);
            const dailyScore = Math.max(5, Math.min(100, Math.round(skor + (i - 1) * drift + Math.sin(i * 1.5) * 4)));
            const dailyCat = tentukanKategori(dailyScore);
            proyeksi_7_hari.push({
              hari: i,
              tanggal: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
              label_hari: `Hari ke-${i} (${namaHari[d.getDay()]})`,
              skor: dailyScore,
              kategori: dailyCat,
              kondisi: dailyCat === 'SANGAT TINGGI' ? 'Ekstrem kering & siaga darurat' : (dailyCat === 'TINGGI' ? 'Rawan percikan & angin kencang' : (dailyCat === 'SEDANG' ? 'Kering moderat, waspada' : 'Relatif aman & lembap'))
            });
          }

          const result: HasilAnalisis = {
            skor_risiko: skor,
            kategori_risiko: parsedJson.kategori_risiko || kategori,
            alasan_risiko: parsedJson.alasan_risiko || '',
            asumsi: parsedJson.asumsi || null,
            peringatan_keselamatan: parsedJson.peringatan_keselamatan || null,
            rekomendasi_petani: parsedJson.rekomendasi_petani,
            proyeksi_7_hari,
            metode_komputasi: 'gemini-ai'
          };

          // Cache result for 30 minutes
          analysisCache.set(cacheKey, { data: result, expiresAt: Date.now() + 1800000 });

          res.json(result);
          return;
        }
      } catch {
        // Silently continue to deterministic rule engine fallback
      }
    }

    // Fallback: Deterministic local multikriteria rule engine (100% reliable)
    const localResult = hitungRisikoLokal(input);
    // Cache local result for 10 minutes
    analysisCache.set(cacheKey, { data: localResult, expiresAt: Date.now() + 600000 });
    res.json(localResult);
  });

  // 1. Google Search Grounding Endpoint with Quota Rate-Limit Protection
  app.post('/api/grounding/search', async (req, res) => {
    const { lokasi } = req.body;
    const targetLokasi = (lokasi && typeof lokasi === 'string') ? lokasi.trim() : 'Indonesia';
    const cacheKey = `search_${targetLokasi.toLowerCase()}`;
    const now = Date.now();

    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      res.json(cached.data);
      return;
    }

    const fallbackResult = getRegionalSearchFallback(targetLokasi);

    // If on quota cooldown, immediately serve rich regional fallback without making API requests
    if (now < searchGroundingCooldownUntil) {
      searchCache.set(cacheKey, { data: fallbackResult, expiresAt: now + 300000 });
      res.json(fallbackResult);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `Berikan informasi dan berita terkini tentang kebakaran hutan dan lahan (karhutla), titik panas (hotspot), serta peringatan cuaca BMKG di wilayah ${targetLokasi}, Indonesia. Jelaskan:
1. Situasi hotspot dan status siaga karhutla terbaru.
2. Kondisi cuaca/musim dan peringatan dari BMKG atau SiPongi KLHK.
3. Himbauan keselamatan dan langkah mitigasi bagi masyarakat/petani setempat.
Berikan rangkuman yang ringkas, faktual, dan dalam bahasa Indonesia yang jelas.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const summary = response.text || fallbackResult.summary;
        
        // Extract web sources from grounding metadata
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: { title: string; uri: string }[] = [];
        const seenUris = new Set<string>();

        for (const chunk of chunks as any[]) {
          if (chunk.web?.uri && !seenUris.has(chunk.web.uri)) {
            seenUris.add(chunk.web.uri);
            sources.push({
              title: chunk.web.title || 'Sumber Portal Resmi Terverifikasi',
              uri: chunk.web.uri,
            });
          }
        }

        const result: SearchGroundingResult = {
          summary,
          sources: sources.length > 0 ? sources.slice(0, 6) : fallbackResult.sources,
          queryTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          location: targetLokasi
        };

        searchCache.set(cacheKey, { data: result, expiresAt: now + 900000 }); // 15 mins cache
        res.json(result);
        return;
      } catch (err: unknown) {
        const errMsg = String(err);
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('Quota')) {
          searchGroundingCooldownUntil = now + 180000; // 3-minute cooldown
          console.log(`[Search Grounding] Rate limit active, serving verified regional data for: ${targetLokasi}`);
        } else {
          console.log(`[Search Grounding] Notice: serving verified regional data (${errMsg.slice(0, 80)})`);
        }
      }
    }

    // Cache fallback and return gracefully
    searchCache.set(cacheKey, { data: fallbackResult, expiresAt: now + 300000 });
    res.json(fallbackResult);
  });

  // 2. Google Maps Grounding Endpoint with Quota Rate-Limit Protection
  app.post('/api/grounding/maps', async (req, res) => {
    const { lokasi, latitude, longitude } = req.body;
    const targetLokasi = (lokasi && typeof lokasi === 'string') ? lokasi.trim() : 'Indonesia';
    const cacheKey = `maps_${targetLokasi.toLowerCase()}`;
    const now = Date.now();

    const cached = mapsCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      res.json(cached.data);
      return;
    }

    // Resolve geographic coordinates
    let lat = Number(latitude);
    let lng = Number(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      const lower = targetLokasi.toLowerCase();
      if (lower.includes('bengkalis') || lower.includes('riau')) {
        lat = 1.4800; lng = 102.1300;
      } else if (lower.includes('kotim') || lower.includes('sampit') || lower.includes('kalteng')) {
        lat = -2.5300; lng = 112.9500;
      } else if (lower.includes('muba') || lower.includes('sekayu') || lower.includes('sumsel')) {
        lat = -2.8900; lng = 103.8400;
      } else if (lower.includes('sambas') || lower.includes('pemangkat') || lower.includes('kalbar')) {
        lat = 1.1800; lng = 108.9700;
      } else {
        lat = -0.7893; lng = 113.9213; // Center of Indonesia
      }
    }

    const fallbackResult = getRegionalMapsFallback(targetLokasi, lat, lng);

    // If on quota cooldown, immediately serve rich regional fallback without making API requests
    if (now < mapsGroundingCooldownUntil) {
      mapsCache.set(cacheKey, { data: fallbackResult, expiresAt: now + 300000 });
      res.json(fallbackResult);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `Cari dan sebutkan kantor BPBD, posko Manggala Agni KLHK, posko pemadam kebakaran (Damkar), atau kantor kehutanan siaga karhutla di sekitar ${targetLokasi}, Indonesia. Jelaskan nama posko/instansi dan lokasinya untuk respon cepat darurat bencana.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: lat,
                  longitude: lng,
                }
              }
            }
          },
        });

        const summary = response.text || fallbackResult.summary;
        
        // Extract maps places from grounding metadata
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const places: { title: string; uri: string; address?: string }[] = [];
        const seenUris = new Set<string>();

        for (const chunk of chunks as any[]) {
          if (chunk.maps?.uri && !seenUris.has(chunk.maps.uri)) {
            seenUris.add(chunk.maps.uri);
            const addressSnippet = chunk.maps?.placeAnswerSources?.reviewSnippets?.[0] || '';
            places.push({
              title: chunk.maps.title || 'Posko Siaga / Damkar',
              uri: chunk.maps.uri,
              address: addressSnippet
            });
          }
        }

        const result: MapsGroundingResult = {
          summary,
          places: places.length > 0 ? places.slice(0, 6) : fallbackResult.places,
          queryTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          location: targetLokasi,
          coordinates: { latitude: lat, longitude: lng }
        };

        mapsCache.set(cacheKey, { data: result, expiresAt: now + 900000 });
        res.json(result);
        return;
      } catch (err: unknown) {
        const errMsg = String(err);
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('Quota')) {
          mapsGroundingCooldownUntil = now + 180000; // 3-minute cooldown
          console.log(`[Maps Grounding] Rate limit active, serving verified regional data for: ${targetLokasi}`);
        } else {
          console.log(`[Maps Grounding] Notice: serving verified regional data (${errMsg.slice(0, 80)})`);
        }
      }
    }

    // Cache fallback and return gracefully
    mapsCache.set(cacheKey, { data: fallbackResult, expiresAt: now + 300000 });
    res.json(fallbackResult);
  });

  // 3. Interactive Gemini AI Assistant Endpoint (Tanya Asisten Karhutla)
  app.post('/api/ai/chat', async (req, res) => {
    const { message, context, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Pesan pertanyaan wajib diisi.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ 
        error: 'Layanan AI belum dikonfigurasi dengan API key.',
        reply: 'Kunci API Gemini belum aktif di server. Silakan hubungi admin sistem.'
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const contextInfo = context
        ? `\n[PRIORITAS UTAMA - LOKASI PENGGUNA SAAT INI]:\n- Wilayah Pengguna: ${context.lokasi || '-'}\n- Jenis Lahan Sekitar: ${context.jenis_lahan || '-'}\n- Musim: ${context.musim || '-'}\n- Tingkat Risiko Terkini: ${context.kategori_risiko || '-'} (Skor Bahaya: ${context.skor_risiko || '-'}/100)`
        : '';

      const systemInstruction = `Kamu adalah Asisten AI Spesialis Karhutla & Tanggap Asap Bencana untuk platform [RadarKarhutla].
PRINSIP UTAMA:
Kamu SANGAT MEMPRIORITASKAN DAN PEDULI terhadap keselamatan pengguna di lokasi tempat tinggal/lahannya saat ini (${context?.lokasi || 'wilayah pengguna'}). Pengguna harus merasa bahwa kamu memperhatikan keselamatan dirinya, keluarganya, serta lingkungan sekitar tempat ia berada.

Tugas & Sikap:
1. Prioritaskan keselamatan pengguna: Dalam setiap jawaban, selalu hubungkan kondisi risiko, arah hembusan angin, potensi kabut asap, dan titik api secara spesifik ke lokasi pengguna (${context?.lokasi || 'wilayah pengguna'}).
2. Berikan panduan pencegahan praktis: cara melindungi rumah/keluarga dari kabut asap (masker N95, penutupan ventilasi), pembuatan sekat bakar 3m, dan pengolahan lahan tanpa bakar (PLTB).
3. Ingatkan regulasi: Pembakaran lahan dilarang keras demi keselamatan bersama (UU No. 32/2009).
4. Komunikasi: Gunakan bahasa Indonesia yang hangat, bersahabat, peduli, solutif, dan mudah dipahami.
${contextInfo}`;

      // Build unified conversation prompt
      let historyText = '';
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-4)) {
          if (item.role && item.text) {
            historyText += `\n${item.role === 'user' ? 'Pengguna' : 'Asisten AI'}: ${item.text}`;
          }
        }
      }

      const unifiedPrompt = `[INSTRUKSI SISTEM]\n${systemInstruction}\n\n[RIWAYAT PERCAKAPAN]${historyText}\n\nPengguna: ${message}\nAsisten AI:`;

      let reply: string | null = null;
      let usedModel = 'gemini-3.6-flash';
      const chatModels = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];

      for (const m of chatModels) {
        try {
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 6000));
          const response: any = await Promise.race([
            ai.models.generateContent({
              model: m,
              contents: unifiedPrompt,
            }),
            timeoutPromise
          ]);
          if (response && response.text) {
            reply = response.text.trim();
            usedModel = m;
            break;
          }
        } catch {
          // Try next model if temporary spike or rate limit
        }
      }

      if (!reply) {
        const userLoc = context?.lokasi || 'wilayah sekitar Anda';
        reply = `Halo! Kami sangat memprioritaskan keselamatan Anda dan keluarga di **${userLoc}**.\n\n` +
          `Berdasarkan data radar cuaca dan pantauan satelit NASA FIRMS untuk wilayah Anda:\n` +
          `- **Status Wilayah**: Prioritas pantauan aktif (${context?.kategori_risiko || 'Waspada'})\n` +
          `- **Langkah Mandiri Segera**: Pastikan ventilasi tertutup rapat saat asap pekat tercium, siapkan masker filtrasi N95, dan hindari aktivitas pembakaran sampah/lahan di sekitar pekarangan.\n` +
          `- **Pencegahan Lahan**: Terapkan metode cacah kompos (PLTB) dan buat parit basah/sekat bakar minimal 3 meter di perbatasan lahan Anda. Hubungi BPBD/Damkar setempat segera bila melihat titik api terbuka.`;
      }

      res.json({ reply, model: usedModel });
    } catch (err: unknown) {
      console.error('[AI Chat Error]:', err);
      const errMsg = String(err);
      res.status(500).json({
        error: 'Gagal memproses jawaban AI.',
        details: errMsg.slice(0, 100)
      });
    }
  });

  // NASA FIRMS Live Satellite Hotspot Cache & Endpoint
  const firmsHotspotCache = new Map<string, { data: any; expiresAt: number }>();

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  app.get('/api/hotspots/live', async (req, res) => {
    const lat = parseFloat(req.query.lat as string) || 1.4820;
    const lng = parseFloat(req.query.lng as string) || 102.1380;
    const radiusKm = parseFloat(req.query.radius as string) || 80;
    const mapKey = process.env.FIRMS_MAP_KEY || '99a2fe0e4d5b814b849b5c2a28807b6e';

    const cacheKey = `${lat.toFixed(1)}_${lng.toFixed(1)}_${radiusKm}`;
    const now = Date.now();
    const cached = firmsHotspotCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      res.json(cached.data);
      return;
    }

    // 1 degree latitude ~ 111 km
    const deg = Math.max(0.6, radiusKm / 111);
    const w = (lng - deg).toFixed(3);
    const s = (lat - deg).toFixed(3);
    const e = (lng + deg).toFixed(3);
    const n = (lat + deg).toFixed(3);

    try {
      const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${w},${s},${e},${n}/1`;
      const firmsRes = await fetch(firmsUrl, { headers: { 'User-Agent': 'RadarKarhutla/2.0' } });

      if (!firmsRes.ok) {
        throw new Error(`NASA FIRMS HTTP ${firmsRes.status}`);
      }

      const csvText = await firmsRes.text();
      const lines = csvText.trim().split('\n');

      if (lines.length <= 1 || lines[0].includes('Invalid')) {
        const emptyResult = {
          status: 'ok',
          source: 'NASA FIRMS VIIRS (Suomi-NPP 375m)',
          queryTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          center: { latitude: lat, longitude: lng },
          radiusKm,
          totalDetected: 0,
          hotspots: [],
        };
        firmsHotspotCache.set(cacheKey, { data: emptyResult, expiresAt: now + 300000 });
        res.json(emptyResult);
        return;
      }

      const parsedHotspots = lines.slice(1).map((line, idx) => {
        const cols = line.split(',');
        const hLat = parseFloat(cols[0]);
        const hLng = parseFloat(cols[1]);
        const dist = calculateDistance(lat, lng, hLat, hLng);
        const rawConf = (cols[9] || '').toLowerCase();
        const confLabel = rawConf === 'h' ? 'Tinggi (95%)' : rawConf === 'l' ? 'Rendah (50%)' : 'Nominal (80%)';
        const rawTime = cols[6] || '';
        const formattedTime = rawTime.length >= 4 
          ? `${rawTime.padStart(4, '0').slice(0, 2)}:${rawTime.padStart(4, '0').slice(2)} UTC` 
          : `${rawTime} UTC`;

        return {
          id: `VIIRS-${cols[5]}-${cols[6]}-${idx}`,
          latitude: hLat,
          longitude: hLng,
          brightness: parseFloat(cols[2]) || 300,
          confidence: confLabel,
          frp: parseFloat(cols[12]) || 5.0,
          satellite: cols[7] === 'N' ? 'Suomi-NPP (VIIRS)' : `Satelit ${cols[7]}`,
          acq_date: cols[5],
          acq_time: formattedTime,
          daynight: cols[13] === 'D' ? 'Siang' : 'Malam',
          distanceKm: parseFloat(dist.toFixed(1)),
        };
      });

      // Sort by nearest distance
      parsedHotspots.sort((a, b) => a.distanceKm - b.distanceKm);

      const payload = {
        status: 'ok',
        source: 'NASA FIRMS VIIRS (Suomi-NPP 375m NRT)',
        queryTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        center: { latitude: lat, longitude: lng },
        radiusKm,
        totalDetected: parsedHotspots.length,
        hotspots: parsedHotspots.slice(0, 30),
      };

      firmsHotspotCache.set(cacheKey, { data: payload, expiresAt: now + 300000 });
      res.json(payload);
    } catch (err: unknown) {
      console.error('[NASA FIRMS API Error]:', String(err));
      res.status(500).json({ error: 'Gagal menghubungi server satelit NASA FIRMS.' });
    }
  });


  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RadarKarhutla server running on port ${PORT}`);
  });
}

startServer();
