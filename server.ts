import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { hitungRisikoLokal, tentukanKategori } from './src/utils/karhutlaRules.ts';
import { FormInput, HasilAnalisis } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

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

        const candidateModels = [
          'gemini-flash-latest',
          'gemini-3.8-flash',
          'gemini-3.1-flash-lite',
        ];

        let responseText: string | null = null;

        for (const modelName of candidateModels) {
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
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.warn(`[RadarKarhutla] Model ${modelName} encountered temporary unavailability (${errorMsg}), trying next fallback...`);
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

          res.json(result);
          return;
        }
      } catch (geminiError) {
        console.warn('[RadarKarhutla] Gemini AI service temporarily busy, using expert rule engine fallback:', geminiError instanceof Error ? geminiError.message : geminiError);
      }
    }

    // Fallback: Deterministic local rule engine
    const localResult = hitungRisikoLokal(input);
    res.json(localResult);
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
    console.log(`[RadarKarhutla] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
