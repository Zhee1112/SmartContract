

## SISTEM REKOMENDASI PENYUNTINGAN KATA
## PADA BERITA UNIVERSITAS MENGGUNAKAN
## ALGORITMA JARO-WINKLER DAN INDOBERT

## Proposal



## Oleh:
## Noeni Indah Sulistiyani
## NIM: 11220910000007



## PROGRAM STUDI TEKNIK INFORMATIKA
## FAKULTAS SAINS DAN TEKNOLOGI
## UNIVERSITAS ISLAM NEGERI SYARIF HIDAYATULLAH
## JAKARTA
## 2026 M / 1447 H

## LEMBAR PERSETUJUAN

## JUDUL PROPOSAL
## SISTEM REKOMENDASI PENYUNTINGAN KATA
## PADA BERITA UNIVERSITAS MENGGUNAKAN
## ALGORITMA JARO-WINKLER DAN INDOBERT

## Proposal Tugas Akhir
Sebagai salah satu bentuk syarat untuk memperoleh gelar Sarjana Komputer
(S.Kom)

## Oleh:
## Noeni Indah Sulistiyani
## NIM: 11220910000007



## Menyetujui,
## Dosen Pembimbing Proposal I




Nurul Faizah Rozy, MTI
## NIP. 197202092023212002
Dosen Pembimbing Proposal II




Saepul Aripiyanto, M.Kom
## NIP. 198909112020121007


ii


## DAFTAR ISI

LEMBAR PERSETUJUAN..................................................................................... i
DAFTAR ISI ........................................................................................................... ii
DAFTAR TABEL .................................................................................................. iii
DAFTAR GAMBAR ............................................................................................. iv
- Latar Belakang ............................................................................................ 1
- Identifikasi Masalah .................................................................................... 8
- Rumusan Masalah ....................................................................................... 8
- Batasan Masalah.......................................................................................... 9
a. Metode..................................................................................................... 9
b. Tools ........................................................................................................ 9
c. Proses .................................................................................................... 10
- Tujuan Penelitian ...................................................................................... 10
- Manfaat Penelitian .................................................................................... 11
a. Bagi Penulis .......................................................................................... 11
b. Bagi Universitas .................................................................................... 11
c. Bagi Pembaca/Pengembang .................................................................. 11
- Penelitian Terdahulu yang Relevan .......................................................... 12
- Metodologi Penelitian ............................................................................... 25
a. Metode Pengumpulan Data ................................................................... 26
b. Metode Perancangan Sistem ................................................................. 26
DAFTAR PUSTAKA ........................................................................................... 33




iii

## DAFTAR TABEL

Tabel 1 Literatur Sejenis ....................................................................................... 12
Tabel 2 Tabel Pembanding.................................................................................... 18



iv

## DAFTAR GAMBAR

Gambar 1. Alur Penelitian..................................................................................... 25


## 1


## 1. Latar Belakang
Membangun  citra saat  ini  dipandang  sebagai  elemen  fundamental
dalam organisasi modern, yang penerapannya tidak terbatas pada perusahaan
komersial,  tetapi  juga  mencakup  lembaga  pendidikan seperti  universitas
(Tsaabitah & Sjech Djamil Djambek, 2025). Salah satu langkah penting yang
dapat   dilakukan   universitas   untuk   membangun   citra   adalah   dengan
menyampaikan berita kampusnya melalui situs web resmi. Di era informasi
saat  ini, situs  web  resmi  universitas  berfungsi  sebagai  penghubung  antara
universitas dan masyarakat. Situs web ini memungkinkan masyarakat melihat
tampilan  dasar  universitas  dan  membentuk  kesan  dasar  tentang  universitas.
Untuk meningkatkan pengaruh sosial, sangat penting untuk membangun situs
web resmi sehingga dapat terbangun citra universitas yang baik (Dan & Yin,
## 2021).
Dalam upaya membangun citra universitas yang baik, situs web resmi
universitas harus berkomitmen untuk melakukan reformasi dan inovasi, serta
secara  konsisten  meningkatkan  komunikasi,  pengarahan,  pengaruh,  dan
kredibilitas   dalam   penyampaian   berita.   Jenis   berita   yang   disampaikan
biasanya   beragam   seperti   konferensi,   kegiatan,   kunjungan   pemimpin,
pertukaran   akademik,   dan   penghargaan   untuk   tenaga   pendidik   serta
mahasiswa universitas (Mengxia Wang, 2020).
Dalam prosesnya, berita memiliki beberapa tahapan sebelum akhirnya
dipublikasikan   ke   situs   web   resmi.   Tahapan   ini   mencakup   proses
perencanaan,  peliputan,  penulisan,  verifikasi,  hingga  penyuntingan  oleh
editor (Kustiawan  et  al.,  2025).  Salah  satu  proses  yang  seringkali  disebut
sebagai tahapan krusial dalam menentukan sebuah kelayakan berita sebelum
dipublikasikan ialah proses penyuntingan oleh editor. Pada proses ini editor
harus memastikan bahwa informasi yang disajikan benar dan relevan dengan
kebutuhan  masyarakat (Parwati,  2021). Kualitas  berita  sangat  dipengaruhi
oleh  penyuntingan  yang  baik. Universitas dapat  menghasilkan  berita  yang
tidak hanya informatif tetapi juga akurat, sehingga memperkuat kepercayaan

## 2

masyarakat melalui  tata  kelola penyuntingan yang  terarah  dan  terorganisir.
Proses  penyuntingan yang  tepat  akan  membantu  mempertahankan  loyalitas
pembaca  dan  memungkinkan situsnya menjangkau  audiens  yang  lebih  luas
(Wilti & Harmonis, 2024).
Mengingat jumlah berita yang masuk dalam sehari rata-rata mencapai
puluhan,  tahap  penyuntingan  menghadapi  tantangan  karena  beban  kerja
editor  yang  tinggi.  Saat  jam  sibuk,  kualitas  penyuntingan  dapat  menurun
(Fatia et al., 2025). Sehingga layaknya manusia pada umumnya, editor juga
dapat melakukan kesalahan dalam pemeriksaan  ejaan kata dalam menjalani
tugasnya.   Hal   ini   disebabkan   oleh   kelalaian   editor   atau   kurangnya
pengetahuan  editor  terhadap  pembaruan  kata  yang  sesuai  dengan  KBBI
(Maghfira  et  al.,  2017).  Selain  kesalahan  penulisan  ejaan  kata,  bentuk
kesalahan yang sering ditemukan pada berita adalah penulisan kata serapan
yang  keliru  serta bahasa  asing  tanpa  penggunaan  huruf  miring (Feby  Rani
Sokawati  et  al.,  2025).  Kesalahan-kesalahan  tersebut dapat  mengubah  apa
yang  ingin  disampaikan  dan  membuat masyarakat mendapatkan  informasi
yang salah (Maghfira et al., 2017).
Untuk   memperoleh   gambaran   kondisi   aktual, penulis   melakukan
wawancara   dengan   Kepala   Pusat   Informasi   dan   Humas UIN   Syarif
Hidayatullah Jakarta pada 29 Desember 2025. Diketahui bahwa unit tersebut
bertanggung jawab secara signifikan untuk meliput, membuat, menyunting,
hingga mempublikasikan berita tentang kegiatan yang terjadi di UIN Jakarta.
Dalam  satu  hari,  terdapat  satu  sampai  tiga  kegiatan  yang  diliput.  Setiap
kegiatan  biasanya  menghasilkan  satu  sampai  dua  berita.  Intensitas  kegiatan
dan produksi berita ini menunjukkan beban kerja tim redaksi yang signifikan,
karena sebagian besar berita yang dibuat merupakan berita aktual yang harus
segera dipublikasikan.
Seiring  dengan  banyaknya berita yang  dibuat,  proses  penyuntingan
bahasa  menjadi  salah  satu  langkah  yang  paling  penting. Dalam  tahap  ini,
editor harus memastikan bahwa tidak ada kesalahan dalam penulisan berita
seperti penggunaan ejaan yang tidak sesuai KBBI, kesalahan penulisan kata,

## 3

serta keraguan terhadap penggunaan kata asing yang sudah diserap ke Bahasa
Indonesia.  Namun, pemeriksaan  yang  dilakukan  oleh  tim  editor  masih
dikerjakan secara  manual  menggunakan dua  cara. Pertama, pemeriksaan
dilakukan  berdasarkan  pengetahuan  yang  dimiliki  oleh  tim  editor  terkait
aturan  kepenulisan  seperti  tata  bahasa,  ejaan,  dan  penggunaan  kata  asing.
Kedua, editor melakukan pemeriksaan dengan mencari informasi tambahan
yang  tidak  diketahui  terkait  aturan  kepenulisan  di  KBBI  dan  berita  sejenis
pada  situs web  lainnya. Kondisi  ini mengakibatkan menurunnya kecepatan
publikasi karena memerlukan waktu penyuntingan yang lebih lama. Namun,
berita tentang kegiatan yang diliput harus disiarkan pada hari yang sama agar
tetap  aktual  dan  relevan. Untuk  memenuhi  target  tersebut,  editor harus
bekerja  dengan  cepat dalam tekanan  waktu  yang  tinggi.  Pada  akhirnya ini
menyebabkan adanya kesalahan bahasa dalam berita yang dipublikasikan dan
penurunan  efisiensi  proses penyuntingan  (Pusat  Informasi  dan  Humas  UIN
## Jakarta, 2025).
Dengan  munculnya  permasalahan  tersebut, (Kustiawan  et  al.,  2025)
menyimpulkan   bahwa proses   pembuatan   siaran   berita   membutuhkan
pengelolaan   yang   terstruktur   dan   mampu   menyesuaikan   diri   dengan
kemajuan   teknologi   informasi. Ini   menegaskan   bahwa   suatu   sistem
diperlukan untuk membantu tim editor melakukan penyuntingan (Maghfira et
al., 2017).
Seiring   dengan   perkembangan   teknologi,   telah   tersedia   berbagai
aplikasi   daring   yang   bertujuan   membantu   proses   penyuntingan   bahasa
Indonesia,  seperti  SIPEBI,  ejaan.id,  lektur.id,  dan  Typoonline.  Aplikasi-
aplikasi  tersebut  umumnya  mampu  mendeteksi  kesalahan ejaan,  kata  tidak
baku, serta variasi penulisan tertentu dengan mengacu pada  KBBI. Namun,
berdasarkan  kajian  terhadap  beberapa  aplikasi  tersebut,  masih  ditemukan
sejumlah   keterbatasan. Pertama,   aplikasi   cenderung   hanya   menandai
kesalahan tanpa memberikan alasan kategorisasi yang jelas, apakah kesalahan
tersebut disebabkan oleh ejaan, kata tidak baku, atau penggunaan kata asing.
Kedua,  rekomendasi  perbaikan  yang  diberikan  masih  terbatas  atau  tidak

## 4

konsisten,  terutama  pada  kasus  kesalahan  pengetikan  dan  variasi  kata  yang
mendekati bentuk baku,  serta kata dengan imbuhan. Ketiga, aplikasi belum
sepenuhnya mendukung kebutuhan penyuntingan berita yang membutuhkan
penandaan  kesalahan  secara  informatif  dan  rekomendasi  kata  yang  relevan
bagi editor (Lubis et al., 2023).
Pendekatan  yang  umum  digunakan  untuk  menangani  permasalahan
pengolahan   teks,   sebagaimana   yang   diterapkan   pada   aplikasi-aplikasi
penyuntingan  tersebut adalah Natural  Language  Processing  (NLP),  yang
merupakan  cabang  ilmu  dalam  komputer  dan  kecerdasan  buatan  yang
berfokus pada interaksi antara komputer dan manusia melalui bahasa alami.
NLP   menitikberatkan   pada   kemampuan   komputer   untuk   memahami,
menafsirkan,  dan  menghasilkan  bahasa  manusia  secara  otomatis. Dengan
demikian,    NLP    bertujuan    untuk    menjembatani    kesenjangan    antara
komunikasi  manusia  dan  pemahaman  mesin,  sehingga  komputer  dapat
berinteraksi dengan manusia menggunakan bahasa alami (Praneesh, 2023).
Dalam    NLP,    salah    satu    pendekatan    yang    berkaitan    dengan
penyuntingan   teks   adalah   analisis   morfologi.   Analisis   morfologi   pada
dasarnya merujuk pada proses pengolahan sebuah kata menjadi bentuk dasar
(lemma)  dan  tag  morfologis  tertentu.  Salah  satu  penerapan  dari  analisis
morfologi adalah dalam  tugas pemeriksaan  ejaan  (spelling  checking) (Li  et
al., 2023).
Dalam  penerapannya,  pemeriksaan  ejaan  tidak  hanya  berfokus  pada
struktur morfologis kata, tetapi juga pada tingkat kemiripan antara kata yang
salah  dengan  kata  yang  benar.  Oleh  karena  itu,  pengukuran  kemiripan  kata
menjadi  aspek  penting. Konsep  kemiripan  kata  dalam  pengolahan  teks
umumnya  didasarkan  pada  tingkat  kesamaan  antara  dua  string.  Salah  satu
pendekatan  yang  umum  digunakan  adalah  pengukuran  kesamaan  karakter
(string  similarity),  di  mana  semakin  banyak  kesamaan  pola  karakter  antara
dua string maka tingkat kemiripannya semakin tinggi (Fahma et al., 2018).
Sejumlah  penelitian  terdahulu  telah  membandingkan  kinerja  berbagai
algoritma kemiripan kata dalam mendeteksi kesalahan ejaan dan memberikan

## 5

rekomendasi kata. Pertama, penelitian oleh (Rochmawati &
Kusumaningrum,  2016) melakukan  studi  perbandingan  beberapa  algoritma
approximate   string   matching,   yaitu   Levenshtein   Distance,   Hamming
Distance, Damerau-Levenshtein Distance, dan Jaro-Winkler Distance, untuk
mengidentifikasi   kesalahan   pengetikan   teks   berbahasa   Indonesia.   Hasil
penelitian tersebut menunjukkan bahwa algoritma Jaro-Winkler memberikan
kinerja  terbaik  dalam  pengecekan  kata  dibandingkan  algoritma  lainnya,
khususnya  pada  kasus  kesalahan  pengetikan  yang  melibatkan  perbedaan
karakter  yang  relatif  kecil. Kedua, (Yanfi  et  al.,  2023a) membandingkan
algoritma N-gram, Levenshtein Distance, dan Jaro-Winkler Distance dalam
tugas  koreksi  kesalahan  ejaan  bahasa  Indonesia  dengan  menggunakan  data
berita.   Hasil   eksperimen   menunjukkan   bahwa   Jaro-Winkler   Distance
memiliki performa yang lebih baik dibandingkan Levenshtein Distance dalam
membandingkan string pendek seperti kata dan nama, sehingga dinilai lebih
sesuai untuk perbaikan kesalahan ejaan pada tingkat kata. Ketiga, penelitian
oleh (Tresna  et  al.,  2025) mengusulkan  sistem  perbaikan  kesalahan  kata
dengan  mengombinasikan  algoritma  Jaro-Winkler  dan  Jaccard  Similarity.
Penelitian   tersebut   menunjukkan   bahwa   Jaro-Winkler   memiliki   peran
dominan dalam menghasilkan kandidat koreksi yang relevan, terutama karena
kemampuannya memberikan bobot lebih pada kesamaan awalan kata.
Sementara  itu,  penelitian (Tien  et  al.,  2022) menegaskan  bahwa
pemeriksaan berbasis kata hanya memadai untuk kesalahan non-word seperti
tipo.  Sebaliknya,  kesalahan real-word seperti  penggunaan  ejaan  yang  tidak
tepat tidak  dapat  ditentukan  tanpa  mempertimbangkan  konteks  kalimat,
sehingga koreksi ejaan harus mengandalkan informasi semantik kontekstual.
Berangkat   dari   temuan   tersebut,   sejumlah   penelitian   terdahulu
selanjutnya mulai     memanfaatkan     model     berbasis     konteks     untuk
meningkatkan  kemampuan  deteksi  dan  koreksi  kesalahan  ejaan,  khususnya
pada  kesalahan  real-word  yang  sangat  bergantung  pada  konteks  kalimat.
Pertama,  penelitian  oleh (Rahman  et  al.,  2023) mengusulkan  BSpell,  yaitu
model pengecek ejaan bahasa Bangla berbasis BERT yang dipadukan dengan

## 6

CNN  untuk  menangkap  pola  karakter  dan  representasi  semantik  secara
kontekstual.  Hasil  evaluasi  menunjukkan  bahwa  model  berbasis  BERT
mampu mengoreksi kesalahan ejaan yang secara leksikal valid namun tidak
sesuai   secara   semantik   dalam   konteks   kalimat,   sehingga   mengungguli
pendekatan N-gram dan rule-based. Kedua, penelitian oleh (Tien et al., 2022)
pada  bahasa  Vietnam  mengombinasikan  BERT  dengan  language  model  N-
gram  untuk  mendeteksi  dan  mengoreksi  kesalahan  ejaan  pada  tingkat  kata.
Studi tersebut membuktikan bahwa BERT memberikan peningkatan F1-score
yang signifikan, terutama dalam mendeteksi kesalahan real-word yang tidak
dapat  diidentifikasi  hanya  dengan  pemeriksaan  kamus  atau  jarak  string.
Temuan ini menegaskan bahwa representasi kontekstual dua arah pada BERT
efektif dalam memahami hubungan antar-kata dalam kalimat.
Selanjutnya, dalam konteks bahasa Indonesia, penelitian (Anadra et al.,
2025) yang  membandingkan  BiLSTM  dan  IndoBERT  menunjukkan  bahwa
IndoBERT memiliki kinerja yang lebih unggul dan stabil dalam menangkap
konteks  semantik  kalimat,  tercermin  dari  nilai balanced  accuracy dan F1-
score yang  lebih  tinggi.  Keunggulan  ini  menunjukkan  bahwa  IndoBERT
tidak  hanya  efektif  pada  tugas  analisis  sentimen,  tetapi  juga  relevan  untuk
tugas-tugas lain yang memerlukan pemahaman konteks, termasuk deteksi dan
koreksi  kesalahan  ejaan  berbasis  kalimat. Di  balik  keunggulannya, model
BERT  memiliki  keterbatasan  struktural  dalam  mendeteksi  kesalahan  kata
pada   kasus   penyisipan   (insertion)   dan   penghapusan   (deletion),   karena
mekanisme  pembelajarannya  mengasumsikan  bahwa  setiap  posisi  dalam
kalimat selalu diisi oleh sebuah kata (Zhou et al., 2022).
Dengan   demikian,   mengombinasikan   IndoBERT   sebagai   model
pemahaman   konteks   dengan   algoritma   Jaro-Winkler   sebagai   pengukur
kemiripan kata dinilai sebagai pendekatan yang saling melengkapi, di mana
Jaro-Winkler   efektif   dalam   menghasilkan   kandidat   koreksi   berbasis
kemiripan string,   sementara   IndoBERT   berperan   dalam   memvalidasi
kandidat tersebut berdasarkan konteks semantik kalimat secara utuh.

## 7

Untuk memastikan bahwa sistem rekomendasi penyuntingan kata yang
dikembangkan dapat bekerja secara objektif dan terukur, digunakan sebuah
matriks   penilaian   yang   dikenal   sebagai confusion   matrix.   Matriks   ini
berfungsi   untuk   menganalisis   sejauh   mana   model   yang   dikembangkan
mampu memberikan performa yang optimal, baik secara merata pada seluruh
kelas  maupun  hanya  unggul  pada  kelas-kelas  tertentu  saja (Pommé  et  al.,
## 2022).
Dalam  mengembangkan  sistem  rekomendasi  penyuntingan  kata  yang
terstruktur dan sistematis, penelitian ini memerlukan metode pengembangan
yang mampu mengakomodasi proses pemahaman masalah, pengolahan data,
pemodelan,  hingga  evaluasi  secara  bertahap.  Salah  satu  metodologi  yang
banyak digunakan dalam pengembangan sistem berbasis data adalah Cross-
Industry  Standard  Process  for  Data  Mining (CRISP-DM).  Metodologi  ini
bersifat  netral  terhadap  teknologi  dan  telah  terbukti  efektif  dalam  berbagai
penelitian  karena  menyediakan  tahapan  yang  jelas  mulai  dari  pemahaman
masalah,  pemahaman  data,  persiapan  data,  pemodelan,  evaluasi,  hingga
penerapan  sistem (Landolt  et  al.,  2021). Oleh  karena  itu,  CRISP-DM
dipandang  sesuai  untuk  digunakan  sebagai  kerangka  pengembangan  sistem
dalam penelitian ini.
Berdasarkan kajian terhadap aplikasi penyuntingan yang telah ada serta
penelitian-penelitian  terdahulu,  algoritma  Jaro-Winkler  terbukti  efektif  dan
konsisten  dalam  mendeteksi  kesalahan  pada  tingkat  kata,  khususnya  yang
berkaitan dengan kesalahan ejaan dan variasi penulisan. Namun, baik aplikasi
maupun  penelitian  sebelumnya  umumnya  masih  berfokus  pada  deteksi
kesalahan  kata  secara  leksikal  dan  belum  mempertimbangkan  kesesuaian
penggunaan kata dalam konteks kalimat. Selain itu, pendekatan yang ada juga
belum secara khusus diarahkan pada kebutuhan penyuntingan bahasa berita
universitas,   yang   mencakup   kesalahan   kata   baku,   penggantian   kata,
penggunaan  kata  asing,  serta  kata  serapan  yang  memiliki  padanan  dalam
KBBI.  Oleh  karena  itu,  penelitian  ini  mengusulkan  pengembangan  sistem
rekomendasi penyuntingan kata pada berita universitas dengan judul “Sistem

## 8

Rekomendasi Penyuntingan Kata pada Berita Universitas
Menggunakan Algoritma Jaro-Winkler dan IndoBERT.”
## 2. Identifikasi Masalah
Berdasarkan pemaparan latar belakang yang telah dipaparkan, maka
dapat diidentifikasikan permasalahan yang ada sebagai berikut:
- Proses penyuntingan kata pada berita universitas masih didominasi
oleh  pemeriksaan  manual  dan  pendekatan  berbasis  aturan  serta
kamus,  sehingga  rentan  terhadap  kesalahan  manusia, dan tidak
efisien dalam kondisi beban kerja tinggi.
- Pendekatan deteksi kesalahan kata yang ada masih belum sempurna,
karena metode  berbasis  kemiripan kata  seperti  Jaro-Winkler yang
efektif  untuk  kesalahan non-word masih lemah  dalam  menangani
kesalahan real-word, sementara model bahasa seperti BERT mampu
memahami  makna  kalimat  tetapi  memiliki  keterbatasan  struktural
dalam   mendeteksi   kesalahan   tertentu,   sehingga   belum   tersedia
model  terpadu  yang  mampu  menggabungkan  kekuatan  keduanya
dalam konteks penyuntingan berita universitas.
## 3. Rumusan Masalah
Berdasarkan permasalahan yang telah dikemukakan pada latar belakang
di atas, rumusan masalah pada penelitian ini, yaitu:
- Bagaimana   merancang   model   rekomendasi   penyuntingan   kata
otomatis pada   berita   universitas menggunakan   algoritma   Jaro-
Winkler dan IndoBERT secara terpisah?
- Bagaimana merancang model   hibrida   yang   mengintegrasikan
kandidat rekomendasi dari Jaro–Winkler dengan pemilihan/validasi
berbasis    konteks    semantik    menggunakan    IndoBERT    untuk
menangani kesalahan real-word pada berita universitas?

## 9

## 4. Batasan Masalah
Dengan   mempertimbangkan   rumusan   masalah   di   atas,   penulis
membatasi topik penelitian   untuk   memenuhi   tujuan   penelitian sebagai
berikut:
a. Metode
- Algoritma  Jaro-Winkler  digunakan  sebagai  metode  utama  untuk
mendeteksi   kesalahan   dan   membentuk   kandidat   rekomendasi
penyuntingan kata pada tingkat kata.
- Model   bahasa   IndoBERT   digunakan   sebagai   metode   validasi
konteks pada tingkat kalimat untuk menilai kesesuaian rekomendasi
kata yang dihasilkan oleh Jaro-Winkler.
- Model hanya memberikan rekomendasi tanpa melakukan perbaikan
otomatis pada kata yang dianggap tidak tepat.
- Proses pengembangan model dilakukan menggunakan metodologi
Cross-Industry Standard Process for Data Mining (CRISP-DM).
- Proses evaluasi model dilakukan menggunakan confusion matrix.
b. Tools
- Bahasa pemrograman yang digunakan dalam pengembangan model
adalah Python.
- Perangkat  pengembangan  yang  digunakan  meliputi Google  Colab,
Visual Studio Code, dan Git/GitHub.
- Kosakata Bahasa Indonesia yang digunakan sebagai acuan kata baku
dalam penelitian ini dibatasi pada data KBBI versi V.
- Penelitian  ini  menggunakan  korpus  Bahasa  Indonesia  dari  sumber
terbuka,  seperti  Kaggle,  sebagai  data  pendukung  untuk  analisis
konteks kalimat dan pemanfaatan model bahasa IndoBERT.

## 10

c. Proses
- Analisis  utama  dilakukan  pada  tingkat  kata  (word-level)  untuk
mendeteksi    kesalahan    penulisan    dan    membentuk    kandidat
rekomendasi penyuntingan kata.
- Validasi  konteks  dilakukan  pada  tingkat  kalimat  (sentence-level)
menggunakan  IndoBERT  untuk  menilai  kesesuaian  rekomendasi
kata.
- Model memberikan  penandaan  (flag)  pada  kata  yang  terindikasi
bermasalah disertai alasan penandaan.
- Model memberikan  beberapa  rekomendasi  kata  terdekat  (top-k)
untuk  kata  yang  terindikasi  sebagai  kesalahan  ejaan  atau  variasi
tidak baku.
- Data berita yang digunakan berasal dari 100 berita universitas yang
dikelola oleh Pusat Informasi dan Humas UIN Syarif Hidayatullah
Jakarta tahun 2025.
- Model  yang  dikembangkan  hanya  difokuskan  untuk  mendeteksi
dan   merekomendasikan   penyuntingan   kata   pada   teks   berita
universitas.
- Model menggunakan kosakata Bahasa Indonesia sebagai acuan kata
baku serta daftar kata Bahasa Inggris sebagai indikator kata asing.
## 5. Tujuan Penelitian
Adapun tujuan yang ingin dicapai melalui penelitian ini, yaitu:
- Merancang  model  rekomendasi  penyuntingan  kata  otomatis  pada
berita    universitas    menggunakan    algoritma    Jaro-Winkler    dan
IndoBERT secara terpisah.
- Merancang    model    hibrida    yang    mengintegrasikan    kandidat
rekomendasi dari Jaro–Winkler dengan pemilihan/validasi berbasis
konteks   semantik   menggunakan   IndoBERT   untuk   menangani
kesalahan real-word pada berita universitas.

## 11

## 6. Manfaat Penelitian
a. Bagi Penulis
Bagi  penulis,  manfaat  penelitian  ini  yaitu  sebagai  sarana  dalam
mengimplementasikan ilmu yang sudah dipelajari selama perkuliahan
dan meningkatkan pemahaman penulis mengenai penerapan algoritma
kemiripan     kata     dalam     pengolahan     teks,     khususnya     dalam
pengembangan sistem deteksi dan rekomendasi penyuntingan kata pada
berita institusional, serta melatih kemampuan penulis dalam merancang
dan mengimplementasikan sistem berbasis komputasi sesuai kebutuhan
nyata di lapangan.
b. Bagi Universitas
Bagi  universitas,  hasil  penelitian  ini  diharapkan  dapat  menjadi
referensi  dan  solusi  awal  bagi  Pusat  Informasi  dan  Humas  dalam
mendukung  proses  penyuntingan  berita  institusional,  khususnya  pada
aspek pemeriksaan bahasa pada tingkat kata, sehingga dapat membantu
meningkatkan efisiensi  dan  kualitas  publikasi  berita  di  lingkungan
universitas.
c. Bagi Pembaca/Pengembang
Bagi   pembaca/pengembang,   penelitian   ini   diharapkan   dapat
menjadi  bahan  referensi  bagi  pembaca  dan  peneliti  selanjutnya  yang
tertarik  pada  pengembangan  sistem  pendukung  penyuntingan  teks,
khususnya  pada  konteks  berita  institusional  dan  penerapan  algoritma
kemiripan kata dalam Bahasa Indonesia.

## 12

- Penelitian Terdahulu yang Relevan
## Tabel 1 Literatur Sejenis
## No. Judul Artikel Penulis Tahun Permasalahan Algoritma Hasil Penelitian
## 1

## Perbaikan Kesalahan
## Kata Menggunakan
## Kombinasi Jaro-
## Winkler & Jaccard
## Similarity
## • I Made Agus Tresna
## • Ramaditia
## • Dwiyansaputra
## • Halil Akhyar
## 2025
Kredibilitas berita online
menurun akibat banyaknya
typo yang sulit dideteksi
secara manual karena beban
kerja editor yang tinggi.
Jaro-Winkler, Jaccard
## Similarity
Jaro-Winkler dominan dalam
memberikan kandidat
perbaikan yang relevan,
sementara Jaccard efektif
menyaring kandidat tersebut.
## 2
Comparison of Spelling
## Error Correction
Algorithms for the
## Indonesian Language
## • Yanfi Yanfi
## • Reina Setiawan
## • Haryono Soeparno
## • Widodo Budiharto
## 2023
Kurangnya perbandingan
performa algoritma koreksi
ejaan menggunakan dataset
besar khusus untuk Bahasa
## Indonesia.
N-gram, Jaro-Winkler,
## Levenshtein Distance
Kedua algoritma efektif
mendukung koreksi kata; Jaro-
Winkler sangat cocok untuk
perbandingan string kecil
seperti kata dan nama.
## 3
## Active Verb Spell
Checking Mem- + P in
## Indonesian Language
Using Jaro-Winkler
## • Dimas Aryo
## Anggoro
## • Inayah Nurfadilah
## 2022
Kesalahan penulisan kata kerja
aktif mem- + p sering terjadi
karena aturan morfologi yang
kompleks dan kurangnya
pemahaman EBI.
Jaro-Winkler Distance (JWD)
Sistem berhasil memperbaiki
kata kerja tidak baku menjadi
baku dengan nilai ambang
## (threshold) 0,95 (autocorrect)
## & 0,92 (saran).
## 4
## Essay Auto-scoring
using N-Gram and Jaro
## • Herlina Jayadianti
## • Budi Santosa
## • Judanti Cahyaning
## 2023
Kesalahan penulisan pada
ujian essay dapat mengurangi
skor secara tidak adil; metode
Hybrid N-Gram dan Jaro-
## Winkler
Kombinasi Jaro-Winkler dan
N-Gram efektif mendeteksi
dan memperbaiki typo Bahasa

## 13

## No. Judul Artikel Penulis Tahun Permasalahan Algoritma Hasil Penelitian
## Winkler Based
## Indonesian Typos
## • Shoffan Saifullah
## • Rafal Drezewski
Levenshtein sebelumnya
dirasa lambat untuk skala
besar.
Indonesia untuk sistem
penilaian otomatis.
## 5
## Pemanfaatan Natural
## Language Processing
## Untuk Pengecekan
Ejaan Sesuai KBBI
## • Tusty Nadia
## Maghfira
## • Imam Cholissodin
## • Agus Wahyu
## Widodo
## 2017
Kurangnya pengetahuan aturan
ejaan dan pengaruh bahasa
asing/gaul yang menyebabkan
kesalahan fatal pada dokumen
resmi/ilmiah.
NLP (Tokenization, Data
## Cleaning)
Sistem berbasis NLP ini lebih
adaptif dan fleksibel dibanding
sistem konvensional dalam
memverifikasi ejaan sesuai
## KBBI.
## 6
## Efficient Bounded Jaro-
## Winkler Similarity
## Based Search
## • Jan Martin Keil
## 2019
Kalkulasi sekuensial Jaro-
Winkler memakan waktu lama
untuk penggunaan real-time
atau pada dataset string
berukuran sangat besar.
Bounded Jaro-Winkler
(Optimized)
Algoritma Bounded yang
diusulkan berhasil
mempercepat pencarian string
mirip tanpa mengorbankan
kualitas hasil Jaro-Winkler.
## 7
## Deteksi Kata Serapan
## Terhadap Dokumen
## Menggunakan
## Pendekatan Deep
## Learning
## • Windi Halimardani
## • Edy Rahman
## Syahputra
## • Husni Lubis
## 2023
Sulitnya mengidentifikasi kata
serapan dalam konteks
dokumen besar yang dapat
mengganggu akurasi analisis
teks/sentimen.
Deep Learning (CNN -
## Convolutional Neural
## Network)
Model Deep Learning mampu
memahami konteks
penggunaan kata serapan dan
membedakannya dari kata asli
bahasa lokal.

## 14

## No. Judul Artikel Penulis Tahun Permasalahan Algoritma Hasil Penelitian
## 8
## Sistem Koreksi
## Kesalahan Pengetikan
Kata Kunci dalam
## Pencarian Artikel
## Menggunakan
Algoritma Jaro-Winkler
## • Ariadi Retno Tri
## Hayati Ririd
## • Pramana Yoga
## Saputra
## • Adita Mulya Sastri
## 2019
Kesalahan pengetikan (typo)
pada mesin pencari jurnal
menyebabkan informasi yang
relevan tidak ditemukan,
sehingga pengguna harus
mengulang pencarian secara
manual
Jaro-Winkler
Algoritma Jaro-Winkler sangat
efektif untuk perbaikan kata
yang salah urutan karakternya
karena mempertimbangkan
faktor transposition dan prefix
## 9
BERT-Inspired
Progressive Stacking to
## Enhance Spelling
Correction in Bengali
## Text
## • Debajyoty Banik
## • Saneyika Das
## • Sheshikala Martha
## • Achyut Shankar
## 2024
Bahasa Bengali memiliki
morfologi yang kaya; model
standar sering gagal
menangani kata berimbuhan
dan konteks kalimat yang
kompleks secara bersamaan.
BERT, Progressive Stacking
Penggunaan progressive
stacking pada layer BERT
memungkinkan ekstraksi fitur
yang lebih mendalam untuk
memperbaiki kata yang salah
berdasarkan konteks.
## 10
BSpell: A CNN-
Blended BERT Based
## Bangla Spell Checker
## • Chowdhury Rafeed
## Rahman
- MD. Hasibur
## Rahman
## • Samiha Zakir
## • Mohammed Rafsan
## • Mohammed Eunus
## Ali
## 2023
Kesalahan pengetikan bahasa
Bengali sering terjadi karena
kemiripan fonetik; model
butuh pemahaman pola
pengetikan sekaligus konteks
penggunaan kata.
BSpell (CNN + BERT)
Integrasi CNN (SemanticNet)
ke dalam BERT membantu
model memahami struktur
internal kata (morfologi)
secara lebih baik untuk deteksi
kesalahan.

## 15

## No. Judul Artikel Penulis Tahun Permasalahan Algoritma Hasil Penelitian
## 11
## Vietnamese Spelling
Error Detection and
## Correction Using
BERT and N-gram
## • Dong Nguyen Tien
## • Tuoi Tran Thi Minh
## • Loi Le Vu
## • Tuan Dang Minh
## 2022
Model transformer murni
kadang melewatkan aturan
lokal bahasa; diperlukan
keseimbangan antara
pemahaman konteks global
dan probabilitas kata lokal.
BERT + N-gram Language
## Model
Kombinasi BERT untuk
konteks dan N-gram untuk
validasi urutan kata lokal
menghasilkan saran perbaikan
yang jauh lebih akurat secara
semantik.
## 12
Scaling BERT Models
for Turkish Automatic
Punctuation and
## Capitalization
## Correction
## • Abdulkader Saoud
## • Mahmut Alomeyr
## • Himmet Toprak
## Kesgin
## • Mehmet Fatih
## Amasyali
## 2024
Bahasa aglutinatif (seperti
Turki/Indonesia) memiliki
tantangan pada imbuhan;
model besar seringkali lambat
secara komputasi namun
akurasinya tinggi.
BERT (Variant: Tiny, Mini,
## Small, Medium, Base)
Skalabilitas ukuran model
BERT sangat berpengaruh
pada kemampuan koreksi teks
berita; semakin besar model,
semakin baik pemahaman
struktur kalimat.
## 13
Algoritma Jaro-Winkler
## Distance: Fitur
## Autocorrect Dan
## Spelling Suggestion
## Pada Penulisan Naskah
## Bahasa Indonesia Di
## BMS TV
## • Agung Prasetyo
## • Wiga Maulana
## Baihaqi
## • Iqbaluddin Syam
## Had
## 2018
Kesalahan ejaan (typo) pada
naskah berita mengganggu
News Anchor saat siaran. Fitur
autocorrect umum seringkali
tidak sesuai konteks bahasa
## Indonesia.
Jaro-Winkler Distance &
## Porter Stemmer
Sistem berhasil membantu
News Director mendeteksi
kesalahan ejaan secara efisien
dan mempermudah
penghimpunan naskah dari
kontributor.

## 16

## No. Judul Artikel Penulis Tahun Permasalahan Algoritma Hasil Penelitian
## 14
IndoBERT for
## Indonesian Fake News
## Detection
## • Sani Muhamad Isa
## • Gary Nico
## • Mikhael Permana
## 2022
Masifnya penyebaran hoaks
selama pandemi COVID-19
yang sulit diverifikasi secara
manual oleh masyarakat dalam
waktu singkat.
IndoBERT (Transformer)
Model IndoBERT sangat
efektif mendeteksi berita palsu
karena kemampuannya
memahami konteks kalimat
secara dua arah (bidirectional).
## 15
Spell corrector for
Bangla language using
Norvig’s Algorithm and
Jaro-Winkler distance
## • Istiak Ahamed
## • Maliha Jahan
## • Zarin Tasnim
## • Tajbia Karim
## • S. M. Salim Reza
## • Dilshad Ara Hossain
## 2021
Tingginya tingkat kesalahan
ejaan di platform online dan
keterbatasan metode koreksi
sebelumnya yang lambat atau
kurang akurat.
## Norvig’s Algorithm & Jaro-
## Winkler Distance
Integrasi Jaro-Winkler pada
algoritma Norvig
meningkatkan akurasi
peringkat saran kata
dibandingkan hanya
menggunakan probabilitas kata
murni.
## 16
The Hybrid of Jaro-
Winkler and Rabin-
Karp Algorithm in
## Detecting Indonesian
## Text Similarity
## • Muhamad Arief
## Yulianto
## • Nurhasanah
## Nurhasanah
## 2021
Keterbatasan algoritma Rabin-
Karp dalam menangani
perubahan karakter kecil dan
efektivitas Jaro-Winkler yang
terbatas pada string pendek.
Hybrid Jaro-Winkler & Rabin-
## Karp
Penggabungan Jaro-Winkler
setelah proses Rabin-Karp
terbukti meningkatkan akurasi
dalam mendeteksi kesamaan
teks yang mengalami
modifikasi.

## 17

## No. Judul Artikel Penulis Tahun Permasalahan Algoritma Hasil Penelitian
## 17
## Vartani Spellcheck –
## Automatic Context-
## Sensitive Spelling
Correction of OCR-
generated Hindi Text
Using BERT and
## Levenshtein Distance
## • Aditya Pal
## • Abhijit Mustafi
## 2021
Rendahnya akurasi teks hasil
OCR pada bahasa inflektif
karena struktur karakter
kompleks dan keterbatasan
model koreksi yang tidak peka
konteks.
BERT & Levenshtein Distance
(Edit Distance)
Pendekatan berbasis konteks
(BERT) yang dikombinasikan
dengan jarak edit efektif
memperbaiki kesalahan OCR
yang signifikan pada teks.
## 18
## A Comprehensive
Approach to
## Misspelling Correction
with BERT and
## Levenshtein Distance
## • Amirreza Naziri
## • Hossein Zeinali
## 2024
Kesalahan ejaan dapat
berakibat fatal
(finansial/nyawa) dan
menurunkan kualitas model
NLP lainnya.
BERT Masked Language
Model (ParsBERT)
dikombinasikan dengan
## Levenshtein Distance.
Peningkatan skor F1 relatif
lebih dari 28% dibandingkan
metode baseline.
## 19
## Aplikasi Spelling
## Correcting Pada
## Penulisan Bahasa
## Indonesia Dengan
## Metode Jaro Winkler
## • Fauzan Risang
## • Agung Samudero
## • Jati Sasongko
## Wibowo
## 2024
Kesalahan pengetikan sering
terjadi saat menyusun
dokumen, sehingga diperlukan
alat bantu koreksi otomatis
Jaro-Winkler Distance
Sistem mampu memberikan
saran perbaikan kata
berdasarkan tingkat kemiripan
nilai tertinggi
## 20
## Penerapan Algoritma
BERT dalam Analisis
## Sentimen Opini Publik
terhadap Destinasi
## • Saikin
## • Mohammad Taufan
## • Asri Zaen
## • Sofiansyah Fadli
## 2025
Pentingnya memahami
sentimen wisatawan untuk
meningkatkan kualitas layanan
pariwisata di Bali
BERT (Bidirectional Encoder
Representations from
## Transformers)
Model mencapai akurasi tinggi
sebesar 91%, presisi 92%,
recall 91%, dan F1-score 91%

## 18

## No. Judul Artikel Penulis Tahun Permasalahan Algoritma Hasil Penelitian
Wisata dengan Metode
## CRISP-DM
## • Hairul Fahmi

## Tabel 2 Tabel Pembanding
## No
Penulis dan
## Tahun
## Objek
## Penelitian
## Dataset Pre-processing Algoritma Evaluasi
## Metode
## Pengembangan
## Deployment
## 1
(Tresna et al.,
## 2025)
## Kesalahan
penulisan
(typo) pada
artikel berita
online
10 artikel berita online
## Universitas Mataram
& kamus 14.500+ kata
Case folding, filtering
alfabet, dan tokenizing
- Jaro-Winkler
## • Jaccard
## Similarity
## Akurasi - Aplikasi
## 2
(Yanfi et al.,
## 2023b)
## Kesalahan
pengetikan
(typo) dalam
bahasa
## Indonesia
4.507 kalimat berita
## Indonesia (17.199
kata) & kamus 10.837
kata
Case folding, punctuation
erasure, filter karakter, n-
gram
## • N-gram
- Jaro-Winkler
## • Levenshtein
## Distance
## Akurasi - -
## 3
(Anggoro &
## Nurfadilah,
## 2022)
Kata kerja aktif
berawalan
mem- + p
KBBI V (667 verba
mem- + p, 1.398 non-
verba) & 90 kata uji
Tokenizing, case folding,
dan filtering
- Jaro-Winkler
## Distance
## Akurasi - Aplikasi

## 19

## No
Penulis dan
## Tahun
## Objek
## Penelitian
## Dataset Pre-processing Algoritma Evaluasi
## Metode
## Pengembangan
## Deployment
## 4
(Jayadianti et
al., 2023)
## Kesalahan
penulisan
(typo) pada
jawaban ujian
essay
115 jawaban dari 23
responden
Case folding, filtering,
tokenizing
- N-Gram
- Jaro-Winkler
## Akurasi -
## Sistem
penilaian
essay otomatis
## 5
(Maghfira et
al., 2017)
## Kesalahan
ejaan Bahasa
## Indonesia
## (umum)
KBBI dan esai uji 500
kata
Celaning dan
## Tokenization
## • NLP
(Tokenization,
## Data Cleaning)
## Akurasi - -
## 6
(Keil, 2019)
## Pencarian
kemiripan
string pada
dataset besar
Dataset nama (Wi90),
100.000 query
Indexing dan sorting
(Prepared)
## • Bounded Jaro-
## Winkler
(Optimized)
## Throughput
(ops/s) dan
efisiensi
waktu
(Peningkatan
signifikan)
## - -
## 7
(Halimardani
et al., 2024)
Kata serapan
asing dalam
dokumen
## Bahasa
## Indonesia
Dokumen teks
(dataset opini)
Analisis data dan
ekstraksi fitur
## • CNN
## Akurasi
deteksi
(Tinggi)
## - Web

## 20

## No
Penulis dan
## Tahun
## Objek
## Penelitian
## Dataset Pre-processing Algoritma Evaluasi
## Metode
## Pengembangan
## Deployment
## 8
(Retno et al.,
## 2019)
Kata kunci
pencarian judul
artikel jurnal
118 judul artikel JIP
## Polinema
Case folding, tokenizing,
filtering
- Jaro-Winkler
## Presisi,
## Deletion,
## Addition
## - Aplikasi
## 9
(Banik et al.,
## 2024)
Koreksi ejaan
pada teks
bahasa Bengali
## Nayadiganta
Mohiuddin dataset
(6.300 kata) &
Prothom-Alo corpus
(1 jt token)
## Tokenization, Matrix
representation, Hybrid
## Masking
## • BERT
## • Progressive
## Stacking
## F1-score,
## Precision,
## Recall. Hasil:
baseline
akurasi
## 91,5%
## - -
## 10
(Rahman et
al., 2023)
Deteksi dan
koreksi ejaan
kata demi kata
## Bangla & Hindi
Corpus (10 jt+
kalimat), Real error
dataset (6.300
kalimat)
Word & character
masking, CNN vector
representation
- BSpell (CNN +
## BERT)
Word level
correction
accuracy
## - Web
## 11
(Tien et al.,
## 2022)
Deteksi dan
koreksi ejaan
bahasa
## Vietnam
## Vietnam Benchmark
## Dataset (human-made
errors), CMCBert
Corpus (25 GB)
## Telex-to-accent
conversion, Subword
tokenization
## • BERT
## • N-gram
## Language Model
## F1-score
## (phrase
detection)
## - -

## 21

## No
Penulis dan
## Tahun
## Objek
## Penelitian
## Dataset Pre-processing Algoritma Evaluasi
## Metode
## Pengembangan
## Deployment
## 12
(Saoud et al.,
## 2024)
Koreksi tanda
baca dan
kapitalisasi
otomatis
batubayk/TR-News
dataset (760 MB),
jutaan kalimat berita
Normalisasi teks,
Segmentasi sub-paragraf
(512 token), Labeling
- BERT (Variant:
## Tiny, Mini,
## Small, Medium,
## Base)
## Precision,
## Recall, F1
score.
## - -
## 13
(Prasetyo et
al., 2018)
Naskah berita
## TV (BMS TV)
Kamus KBBI (46.402
kata) & naskah berita
## BMS TV
Tokenizing, Case folding,
## Stemming
- Jaro-Winkler
## Distance
## • Porter Stemmer
Black box
testing (Unit
testing) &
## Acceptance
testing
## (UAT)
## Extreme
## Programming
## (XP)
## Aplikasi
## 14
(Isa et al.,
## 2022)
Berita palsu
(Fake News)
## Bahasa
## Indonesia
## Dataset
turnbackhoax.id
(6.930 berita: 3.465
hoax, 3.465 valid)
## Hapus Emoji, Hapus
tanda baca berlebih, Data
resampling
- IndoBERT
(Transformer)
## Accuracy,
## Precision,
## Recall, F1-
score
## - -
## 15
(Ahamed et
al., 2021)
## Ejaan Bahasa
## Bangla
(Bengali)
## Bangla Dictionary
(959.232 kata unik) &
1.000 kata uji
Splits and edits (Deletion,
## Insertion, Transpose,
## Replace)
## • Norvig’s
## Algorithm
- Jaro-Winkler
## Distance
## Akurasi - -

## 22

## No
Penulis dan
## Tahun
## Objek
## Penelitian
## Dataset Pre-processing Algoritma Evaluasi
## Metode
## Pengembangan
## Deployment
## 16
(Yulianto &
## Nurhasanah,
## 2021)
Kemiripan teks
## (similarity)
## Bahasa
## Indonesia
## Corpus Ramayana &
Hindi Hun-Spell
## Dictionary (470.000+
kata)
## Tokenisasi, Lookup
dictionary, NER
## • Hybrid Jaro-
## Winkler
- Rabin-Karp
## Akurasi - -
## 17
(Pal &
## Mustafi,
## 2020)
## Teks Bahasa
Hindi hasil
## OCR
## Corpus Ramayana &
Hindi Hun-Spell
## Dictionary (470.000+
kata)
## Tokenisasi, Lookup
dictionary, NER
## • BERT
## • Levenshtein
## Distance
## Akurasi - -
## 18
(Naziri &
## Zeinali, 2024)
## Koreksi
kesalahan
ejaan kata riil
(real-word) dan
non-riil pada
bahasa Persia.
Subset dari buku
digital Taaghche dan
## Wikipedia Persia.
## Total 8.059.076
kalimat pelatihan dan
37.040 kalimat
evaluasi.
Penghapusan angka,
tanda baca, dan huruf
Latin; tokenisasi; serta
pemangkasan
berdasarkan panjang
kalimat (5-256 token).
- BERT Masked
## Language Model
(ParsBERT)
- dengan
## Levenshtein
## Distance.
## Akurasi,
## Presisi,
Recall, dan
F1-Score
(Micro &
## Macro
## Average).
## - -
## 19
(Risang
## Agung
Samudero et
al., 2024)
## Koreksi
kesalahan
pengetikan
(typo) pada
Kamus kata dasar
bahasa Indonesia
(KBBI) berjumlah
28.528 kata
## Case Folding,
## Tokenization, Stopword
## Removal, Filtering
- Jaro-Winkler
## Distance
## Black Box
## Testing
## (pengujian
fungsionalitas
aplikasi)
## Waterfall Aplikasi

## 23

## No
Penulis dan
## Tahun
## Objek
## Penelitian
## Dataset Pre-processing Algoritma Evaluasi
## Metode
## Pengembangan
## Deployment
naskah bahasa
## Indonesia
## 20
(Saikin et al.,
## 2025)
## Opini
publik/ulasan
wisatawan
pada destinasi
wisata di Bali
1.000 ulasan Google
Maps dari 5 destinasi
wisata di Bali
## Cleansing, Translation,
## Case Folding,
## Tokenizing, Filtering,
Stemming, dan Labelling
## • BERT
(Bidirectional
## Encoder
## Representations
from
## Transformers)
## Confusion
## Matrix
(Akurasi,
## Presisi,
Recall, dan
F1-Score)
## CRISP-DM  -
21 (Noeni, 2026)
## Deteksi
kesalahan dan
rekomendasi
penyuntingan
kata teks berita
universitas
100 berita publikasi
UIN Syarif
## Hidayatullah Jakarta
tahun 2025; KBBI
versi V; dataset
kosakata Bahasa
Inggris;  dan Korpus
Bahasa Indonesia di
sumber terbuka
Cleansing, Case folding,
## Tokenization, Stopword
removal, Stemming
## • Jaro Winkler
- IndoBERT
## Confusion
## Matrix
(Akurasi,
## Precision,
## Recall, F-1
## Score)
CRISP-DM  Web


## 24

Berdasarkan  perbandingan  terhadap  penelitian-penelitian  terdahulu,
dapat disimpulkan bahwa sebagian besar penelitian sebelumnya dalam bidang
deteksi dan koreksi kesalahan kata masih berfokus pada pendekatan berbasis
kemiripan   string   pada   tingkat   kata,   seperti   Jaro-Winkler,   Levenshtein
Distance,  N-Gram,  atau  kombinasi  heuristik  lainnya. Beberapa  penelitian
terdahulu  telah  mulai  memanfaatkan  model  bahasa  kontekstual  berbasis
transformer  seperti  BERT  untuk  deteksi  dan  koreksi  kesalahan  ejaan  pada
bahasa  lain  seperti  Vietnam  dan  Bangla,  namun  pendekatan  serupa  belum
diterapkan secara spesifik pada Bahasa Indonesia, khususnya dalam konteks
penyuntingan    teks    berita universitas dengan    memanfaatkan    model
IndoBERT. Oleh   karena   itu,   penelitian   ini bertujuan   untuk mengkaji
pemanfaatan IndoBERT dalam konteks Bahasa Indonesia untuk mendukung
penyuntingan   kata,   serta   mengombinasikannya   dengan   algoritma   Jaro-
Winkler  dalam  sebuah  sistem  rekomendasi  penyuntingan  kata  berbasis
hybrid.   Penelitian   ini   juga   merancang   skenario eksperimen   dengan
membandingkan  performa  Jaro-Winkler  secara  mandiri,  IndoBERT  secara
mandiri, serta pendekatan hybrid Jaro-Winkler dan IndoBERT, menggunakan
dataset yang lebih beragam berupa kosakata KBBI versi V, dataset kosakata
Bahasa  Inggris, korpus  Bahasa  Indonesia  dari  sumber  terbuka,  dan  berita
universitas.

## 25

## 8. Metodologi Penelitian

## Gambar 1. Alur Penelitian

## 26

a. Metode Pengumpulan Data
## 1) Studi Literatur
Penulis  memperoleh  informasi  yang  dibutuhkan  melalui  kegiatan
membaca,   merangkum,   serta   menganalisis   data   dari   berbagai
sumber pustaka yang diperoleh dari dokumen tertulis, seperti jurnal,
artikel, penelitian terkait, dan sumber daring lainnya.
## 2) Observasi
Observasi  dalam  penelitian  ini  dilaksanakan  melalui  kunjungan
langsung ke Pusat  Informasi dan Humas UIN Syarif Hidayatullah
Jakarta.   Pada   tahap    observasi   tersebut,   penulis   melakukan
pengamatan  secara  langsung  terhadap  alur  kerja  dalam  proses
produksi berita  yang  akan  dipublikasikan  melalui  situs  web  resmi
UIN Jakarta.
## 3) Wawancara
Penulis   melakukan   wawancara   terkait   proses   produksi   dan
penyuntingan  berita  di  Pusat  Informasi  dan  Humas  UIN  Syarif
Hidayatullah  Jakarta  bersama  Kepala  Pusat  Informasi  dan  Humas
UIN  Syarif  Hidayatullah  Jakarta,  tim  editor  Pusat  Informasi  dan
Humas, mahasiswa sebagai pembaca berita pada website resmi UIN
Jakarta, serta pakar jurnalistik sebagai narasumber ahli.
b. Metode Perancangan Sistem
Penulis menggunakan   pendekatan   Cross-Industry   Standard
Process  for  Data  Mining  (CRISP-DM) sebagai  metode perancangan
sistem dalam penelitian ini. Metode ini terdiri dari enam tahapan utama,
yaitu:
## 1) Business Understanding
Pada  tahap business  understanding,  penulis  berfokus
pada  identifikasi  permasalahan  utama  yang  melatarbelakangi
penelitian serta penentuan tujuan pengembangan model.
a) Mengidentifikasi Masalah

## 27

Penulis   mengidentifikasi   permasalahan   dalam
proses  penyuntingan  kata  pada  berita  universitas,
di  mana  proses  penyuntingan  masih  dilakukan
secara  manual  dan  bergantung  pada  ketelitian
editor.  Kondisi  tersebut  berpotensi  menimbulkan
kesalahan penulisan kata, seperti kesalahan ejaan,
penggunaan  kata  tidak  baku,  serta  penggunaan
kata  asing  dan  kata  serapan  yang  tidak  sesuai
dengan kaidah KBBI.
b) Menentukan Tujuan Penelitian
Berdasarkan permasalahan yang telah
diidentifikasi,    penelitian    ini    bertujuan    untuk
mengembangkan sistem rekomendasi
penyuntingan  kata  pada  berita  universitas  yang
dapat  membantu  editor  dalam  mendeteksi  dan
memberikan    rekomendasi    penyuntingan    kata
secara    lebih    efisien    dengan    memanfaatkan
algoritma    Jaro-Winkler    dan    model    bahasa
IndoBERT.
## 2) Data Understanding
Pada  tahap data  understanding,  penulis  berfokus  pada
pemahaman  terhadap  data  yang  digunakan  dalam  penelitian,
meliputi  sumber  data,  karakteristik  data,  serta  kondisi  awal
data sebelum dilakukan pemrosesan lebih lanjut.
a) Memahami Sumber Data
Data yang digunakan dalam penelitian ini berasal
dari beberapa sumber, yaitu berita universitas yang
dipublikasikan  oleh  Pusat  Informasi  dan  Humas
UIN     Jakarta,     kosakata     Bahasa     Indonesia
berdasarkan  KBBI versi  V,  daftar  kata  Bahasa
Inggris,   serta   korpus   Bahasa   Indonesia   dari

## 28

sumber   terbuka.   Data-data   tersebut   digunakan
untuk mendukung proses rekomendasi
penyuntingan kata pada berita universitas.
b) Menentukan Jumlah dan Karakteristik Data
Pada  tahap  ini,  penulis  menentukan  jumlah  data
berita   yang   digunakan   serta   mengidentifikasi
karakteristik  data  teks,  seperti  bentuk  penulisan
bahasa  formal,  penggunaan  istilah  institusional,
serta  keberadaan  kata  asing  dan  kata  serapan.
Penentuan jumlah dan karakteristik data dilakukan
agar    data    yang    digunakan    sesuai    dengan
kebutuhan  penelitian. Pada  penelitian  ini,  data
berita  universitas  yang  digunakan  direncanakan
berjumlah  sekitar  100  berita,  sedangkan  jumlah
data   pendukung   seperti   kosakata   dan   korpus
Bahasa  Indonesia  disesuaikan  dengan  kebutuhan
sistem pada tahap pemodelan.
c) Analisis Awal Data Teks
Setelah   data   dikumpulkan,   penulis   melakukan
analisis awal terhadap data teks untuk memahami
pola kesalahan penulisan kata yang sering muncul
pada berita universitas. Analisis awal ini bertujuan
untuk    memberikan    gambaran    kondisi    data
sebelum  dilakukan  tahap data preparation dan
pemodelan sistem.
## 3) Data Preparation
Pada tahap data preparation, penulis melakukan proses
persiapan  data  teks  agar  data  siap  digunakan  pada  tahap
pemodelan  sistem.  Tahap  ini  bertujuan  untuk  membersihkan
dan  menyesuaikan  data  teks  sehingga  dapat  diproses  oleh
algoritma yang digunakan.

## 29

a) Cleansing
Pada tahap cleansing, penulis membersihkan data
teks  dari  karakter  yang  tidak  diperlukan,  seperti
tanda baca, simbol, dan karakter khusus yang tidak
berpengaruh terhadap proses penyuntingan kata.
b) Case Folding
Tahap case  folding dilakukan  dengan  mengubah
seluruh huruf dalam data teks menjadi huruf kecil
(lowercase). Proses ini bertujuan untuk
menyeragamkan    bentuk    penulisan    kata    dan
menghindari  perbedaan  akibat  penggunaan  huruf
kapital.
c) Tokenization
Tahap tokenization dilakukan dengan memisahkan
teks   berita   menjadi   unit-unit   kata.   Tokenisasi
dilakukan  pada  tingkat  kata  karena  penelitian  ini
berfokus pada penyuntingan kata dalam teks berita
universitas.
d) Stopword Removal
Pada tahap stopword removal, penulis
menghilangkan    kata-kata    umum    yang    tidak
memiliki   pengaruh   signifikan   terhadap   proses
deteksi  kesalahan  kata,  seperti  kata  penghubung
dan  kata  depan,  agar  proses  pemodelan  menjadi
lebih efisien.
e) Stemming
Tahap stemming dilakukan  untuk  mengubah  kata
berimbuhan menjadi bentuk kata dasar. Proses ini
bertujuan  untuk  mempermudah  pencocokan  kata
dengan  kosakata  acuan  serta  mendukung  proses
deteksi kesalahan kata pada sistem.

## 30

## 4) Modeling
Pada  tahap modeling,  penulis  melakukan  perancangan
dan   penerapan   model   yang   digunakan   untuk   mendeteksi
kesalahan  kata  serta  memberikan  rekomendasi  penyuntingan
kata  pada  berita  universitas.  Tahap  ini  mencakup  penerapan
algoritma  pada  tingkat  kata  serta  pemanfaatan  model  bahasa
kontekstual untuk meningkatkan kualitas rekomendasi.
a) Jaro-Winkler
Pada    skenario    ini,    algoritma    Jaro-Winkler
digunakan   secara   mandiri   untuk   mendeteksi
kesalahan  penulisan  kata  pada  teks  berita.  Proses
deteksi    dilakukan    dengan    mengukur    tingkat
kemiripan  antara  kata  dalam  teks  berita  dengan
kosakata   acuan.   Kata   yang   memiliki   tingkat
kemiripan  di  bawah  ambang  batas  tertentu  akan
ditandai  sebagai  kata  bermasalah  dan  diberikan
rekomendasi   kata   berdasarkan   nilai   kemiripan
tertinggi.
b) IndoBERT
Pada   skenario   ini,   model   bahasa   IndoBERT
digunakan  secara  mandiri  untuk  mendeteksi  dan
memberikan    rekomendasi    penyuntingan    kata
dengan    mempertimbangkan    konteks    kalimat.
Model  digunakan  untuk  menganalisis  kesesuaian
kata   dalam   suatu   kalimat   dan   menghasilkan
rekomendasi  kata  yang  dianggap  paling  sesuai
berdasarkan pemahaman konteks kalimat.
c) Hybrid Jaro-Winkler dan IndoBERT
Pada   skenario   ini,   penulis   mengombinasikan
algoritma    Jaro-Winkler    dan    model    bahasa
IndoBERT  dalam  satu  sistem hybrid.  Algoritma

## 31

Jaro-Winkler  digunakan  pada  tahap  awal  untuk
mendeteksi  kata  bermasalah  dan  menghasilkan
kandidat    rekomendasi    berdasarkan    kemiripan
kata,   sedangkan   IndoBERT   digunakan   untuk
memvalidasi  kesesuaian  kandidat  tersebut  dalam
konteks kalimat.
## 5) Evaluation
Pada   tahap evaluation,   penulis   melakukan   evaluasi
terhadap  performa  sistem  rekomendasi  penyuntingan  kata
yang  telah  dibangun  untuk  mengetahui  tingkat  keberhasilan
masing-masing skenario pemodelan.
Evaluasi   dilakukan   menggunakan   confusion   matrix
untuk   mengukur   kemampuan   sistem   dalam   mendeteksi
kesalahan  kata  secara  tepat.  Confusion  matrix  terdiri  dari
empat  komponen,  yaitu True  Positive,  False  Positive,  False
Negative,  dan True  Negative. Berdasarkan  confusion  matrix
tersebut,   selanjutnya   dihitung   beberapa   metrik   evaluasi,
meliputi accuracy, precision, recall, dan F1-score.
Evaluasi dilakukan terhadap seluruh skenario
pemodelan,  yaitu  penggunaan  algoritma  Jaro-Winkler  secara
mandiri,  penggunaan  model  IndoBERT  secara  mandiri,  serta
pendekatan hybrid Jaro-Winkler dan IndoBERT.
## 6) Deployment
Pada   tahap deployment,   model   sistem   rekomendasi
penyuntingan   kata   yang   telah   dibangun   dan   dievaluasi
selanjutnya  diintegrasikan  ke  dalam  aplikasi  berbasis  web.
Model   Jaro-Winkler   diimplementasikan   langsung   dalam
bentuk  fungsi  pemrograman,  sedangkan  model  IndoBERT
digunakan  dalam  bentuk  model  pralatih  (pre-trained  model)
yang  dijalankan  menggunakan  bahasa  pemrograman  Python.
Proses  pengembangan  dan  pengujian  model  dilakukan  pada

## 32

lingkungan Google Colaboratory, kemudian model
diintegrasikan ke dalam aplikasi web menggunakan Streamlit
sebagai antarmuka pengguna. Aplikasi web yang
dikembangkan memungkinkan pengguna untuk memasukkan
teks berita dan menampilkan hasil rekomendasi penyuntingan
kata.


## 33

## DAFTAR PUSTAKA

Ahamed,  I.,  Jahan,  M.,  Tasnim,  Z.,  Karim,  T.,  Reza,  S.  M.  S.,  &  Hossain,  D.  A.
(2021). Spell corrector for bangla language using norvig’s algorithm and jaro-
winkler  distance. Bulletin  of  Electrical  Engineering  and  Informatics, 10(4),
1997–2005. https://doi.org/10.11591/EEI.V10I4.2410
Anadra, R., Wijayanto, H., & Sadik, K. (2025). Sentiment Analysis of Tokopedia
Customer   Reviews   Using   BiLSTM   and   IndoBERT   with   Comparative
Analysis  of  Preprocessing  and  Labeling  Methods. International  Journal  of
Advances in Data and Information Systems, 6(3), 773–788.
https://doi.org/10.59395/ijadis.v6i3.1458
Anggoro, D. A., & Nurfadilah, I. (2022). Active Verb Spell Checking Mem- + P in
Indonesian  Language  Using  the  Jaro-Winkler  Distance  Algorithm. Iraqi
Journal of Science, 63(4), 1811–1822.
https://doi.org/10.24996/ijs.2022.63.4.38
Banik, D., Das, S., Martha, S., & Shankar, A. (2024). BERT-Inspired Progressive
Stacking to Enhance Spelling Correction in Bengali Text. ACM Transactions
on   Asian   and   Low-Resource   Language   Information   Processing, 23(8).
https://doi.org/10.1145/3669941
Dan,  H.,  &  Yin,  X.  (2021).  Discourse  Analysis  on  Campus  News  in  University
Image Construction. Proceedings of the 6th Annual International Conference
on Social Science and Contemporary Humanity Development (SSCHD 2020).
https://doi.org/10.2991/assehr.k.210121.024
Fahma,  A.  I.,  Cholissodin,  I.,  &  Perdana,  R.  S.  (2018).  Identifikasi  Kesalahan
Penulisan  Kata  (Typographical  Error)  pada  Dokumen  Berbahasa  Indonesia
Menggunakan    Metode    N-gram    dan    Levenshtein    Distance. Jurnal
Pengembangan Teknologi Informasi Dan Ilmu Komputer, 2(1), 53–62. http://j-
ptiik.ub.ac.id
Feby  Rani  Sokawati,  Duwi  Rahayu  Ningsih,  &  Sri  Muryati.  (2025).  Kesalahan
Ejaan  dan  Tanda  Baca  pada  Berita  Online  Terbitan  Sukoharjonews  Edisi
## Oktober 2024. Perspektif : Jurnal Pendidikan Dan Ilmu Bahasa, 3(1), 62–71.
https://doi.org/10.59059/perspektif.v3i1.2071
## Halimardani, W., Rahman Syahputra, E., & Lubis, H. (2024). Deteksi Kata Serapan
## Terhadap   Dokumen   Menggunakan   Pendekatan   Deep   Learning. Syntax :
Journal   of   Software   Engineering,   Computer   Science   and   Information
Technology, 4(2), 359–362. https://doi.org/10.46576/syntax.v4i2.4164

## 34

Isa, S. M., Nico, G., & Permana, M. (2022). IndoBERT for Indonesian Fake News
Detection. ICIC Express Letters, 16(3), 289–297.
https://doi.org/10.24507/icicel.16.03.289
Jayadianti, H., Santosa, B., Cahyaning, J., Saifullah, S., & Drezewski, R. (2023).
Essay auto-scoring using N-Gram and Jaro Winkler based Indonesian Typos.
MATRIK : Jurnal Manajemen, Teknik Informatika Dan Rekayasa Komputer,
22(2), 325–338. https://doi.org/10.30812/matrik.v22i2.2473
Keil, J. M. (2019). Efficient bounded Jaro-winkler similarity based search. Lecture
Notes  in  Informatics  (LNI),  Proceedings - Series  of  the  Gesellschaft  Fur
Informatik (GI), P-289, 205–214. https://doi.org/10.18420/btw2019-13
Kustiawan,  W.,  Dwi  Kinanti,  A.,  Anggraini,  R.  T.,  Abrar,  M.,  Salam,  H.,
## Ramadhan, U. F., Negeri, U. I., & Utara, S. (2025). Mengelola Produksi Siaran
Berita Media Online dan Proses Penciptaan Media Online. LintekEdu: Jurnal
Literasi Dan Teknologi Pendidikan, 6. https://ejurnals.com/ojs/index.php/jltp
Landolt,  S.,  Wambsganss,  T.,  &  Söllner,  M.  (2021).  A  Taxonomy  for  Deep
Learning  in  Natural  Language  Processing. Hawaii  International  Conference
on System Sciences. https://doi.org/10.24251/HICSS.2021.129
Li, Y., Li, Z., Chen, Y., & Li, S. (2023). Word-level Prefix/Suffix Sense Detection:
A  Case  Study  on  Negation  Sense  with  Few-shot  Learning. Findings  of  the
Association    for    Computational    Linguistics:    ACL    2023,    7651–7658.
https://doi.org/10.18653/v1/2023.findings-acl.484
Lubis, F., Safitri, N., Gultom, M. P., Dwijaya, N., Sarwadin, M., Dalimunthe, A.,
Hia,  T.  B.,  Azhar,  F.,  Hutapea,  F.  P.,  Maria,  R.,  &  Sianipar,  M.  (2023).
Analysis of Methods to Correct Indonesian Language Spelling Errors in Thesis
Writing  Among  Students  of  State  University  of  Medan.  In EDUCTUM:
Journal Research (Vol. 2, Number 6).
Maghfira, T. N., Cholissodin, I., & Widodo, A. W. (2017). Deteksi Kesalahan Ejaan
dan Penentuan Rekomendasi Koreksi Kata yang Tepat Pada Dokumen Jurnal
JTIIK Menggunakan Dictionary Lookup dan Damerau-Levenshtein Distance.
## Jurnal  Pengembangan  Teknologi  Informasi  Dan  Ilmu  Komputer, 1(6),  498–
- http://j-ptiik.ub.ac.id
Mengxia  Wang.  (2020,  July  28).  On  the  Standards  and  Innovation  of  College
Campus   News   Writing. 2020   International   Conference   on   Educational
Training and Educational Phenomena (ICETEP2020).
https://doi.org/10.38007/Proceedings.0000957
Naziri,  A.,  &  Zeinali,  H.  (2024). A  Comprehensive  Approach  to  Misspelling
Correction with BERT and Levenshtein Distance.
http://arxiv.org/abs/2407.17383

## 35

Pal, A., & Mustafi, A. (2020). Vartani Spellcheck -- Automatic Context-Sensitive
Spelling   Correction   of   OCR-generated   Hindi   Text   Using   BERT   and
Levenshtein Distance. http://arxiv.org/abs/2012.07652
Parwati, N. (2021). Analisis Manajemen Redaksi Media Online di Masa Pandemi
Covid19 di Tirto.id Yogyakarta. Jurnal Komunika: Jurnal Komunikasi, Media
Dan Informatika, 10(2), 94. https://doi.org/10.31504/komunika.v10i2.3979
Pommé,  L.-E.,  Bourqui,  R.,  Giot,  R.,  &  Auber,  D.  (2022).  Relative  Confusion
Matrix:   Efficient   Comparison   of   Decision   Models. Proceedings   of   the
International Conference on Information Visualisation.
https://doi.org/10.1109/IV56949.2022.00025ï
Praneesh,  Mr.  D.  S.  D.  V.  Y.  Y.  S.  (2023).  The  Role  of  Natural  Language
Processing. International  Journal  of  Scientific  Research  in  Engineering  and
Management (IJSREM), 7. https://doi.org/10.55041/IJSREM27094
Prasetyo,  A.,  Baihaqi,  W.  M.,  &  Had,  I.  S.  (2018).  Algoritma  Jaro-Winkler
Distance:  Fitur Autocorrect dan Spelling Suggestion pada Penulisan Naskah
Bahasa   Indonesia   di   BMS   TV. Jurnal   Teknologi   Informasi   Dan   Ilmu
Komputer, 5(4), 435–444. https://doi.org/10.25126/jtiik.201854780
Rahman, C., Rahman, MD. H., Zakir, S., Rafsan, M., & Ali, M. E. (2023). BSpell:
A CNN-Blended BERT Based Bangla Spell Checker. Proceedings of the First
Workshop     on     Bangla     Language     Processing     (BLP-2023),     7–17.
https://doi.org/10.18653/v1/2023.banglalp-1.2
Retno, A., Ririd, T. H., Saputra, P. Y., Sastri, A. M., Informatika, T., Informasi, T.,
&  Malang,  P.  N.  (2019).  Sistem  Koreksi  Kesalahan  Pengetikan  Kata  Kunci
dalam Pencarian Artikel Menggunakan Algoritma Jaro-Winkler. JIP: Jurnal
## Informatika Polinema, 60–65.
## Risang Agung Samudero, F., Sasongko Wibowo, J., & Tri Lomba Juang Semarang,
## J.  (2024).  Aplikasi  Spelling  Correcting  Pada  Penulisan  Bahasa  Indonesia
## Dengan Metode Jaro Winkler. Jurnal Elektronika Dan Komputer, 17(1), 65–
- https://doi.org/10.51903/elkom.v17i1.1445
Rochmawati,  Y.,  &  Kusumaningrum,  R.  (2016).  Studi  Perbandingan  Algoritma
Pencarian   String   dalam   Metode   Approximate   String   Matching   untuk
## Identifikasi  Kesalahan  Pengetikan  Teks. Jurnal  Buana  Informatika, 7(2).
https://doi.org/10.24002/jbi.v7i2.491
Saikin,  S.,  Zaen,  M.  T.  A.,  Fadli,  S.,  &  Fahmi,  H.  (2025).  Penerapan  Algoritma
BERT  dalam  Analisis  Sentimen  Opini  Publik  terhadap  Destinasi  Wisata
dengan  Metode  CRISP-DM. RIGGS:  Journal  of  Artificial  Intelligence  and
Digital Business, 4(4), 5382–5392. https://doi.org/10.31004/riggs.v4i4.4373
Saoud, A., Alomeyr, M., Amasyali, M. F., & Kesgin, H. T. (2024). Scaling BERT
Models  for  Turkish  Automatic  Punctuation  and  Capitalization  Correction.

## 36

2024 Innovations in Intelligent Systems and Applications Conference (ASYU),
1–6. https://doi.org/10.1109/ASYU62119.2024.10757039
Tien, D. N., Minh, T. T. T., Vu, L. Le, & Minh, T. D. (2022). Vietnamese Spelling
Error Detection and Correction Using BERT and N-gram Language Model. In
Intelligent Systems and Networks (pp. 427–436). https://doi.org/10.1007/978-
## 981-19-3394-3_49
Tresna,  I.  M.  A.,  Dwiyansaputra,  R.,  &  Akhyar,  H.  (2025).  Perbaikan  Kesalahan
Kata  Menggunakan  Kombinasi  Jaro-Winkler  dan  Jaccard  Similarity. Jurnal
Teknologi  Informasi,  Komputer,  Dan  Aplikasinya  (JTIKA  ), 7(1),  25–36.
https://doi.org/10.29303/jtika.v7i1.435
## Tsaabitah, A., & Sjech Djamil Djambek, N. M. (2025). Strategi Branding Dalam
## Meningkatkan  Reputasi  Lembaga  Pendidikan  Islam. Cendikia  Pendidikan,
18(1), 2025. https://doi.org/10.9644/sindoro.v3i9.267
Wilti,  B.  K.,  &  Harmonis,  H.  (2024).  Editorial  Management  Sindonews.com  in
## Determining   News   Worth   Publishing. Journal   Transnational   Universal
Studies, 2(11), 598–616. https://doi.org/10.58631/jtus.v2i11.118
Yanfi,  Y.,  Setiawan,  R.,  Soeparno,  H.,  &  Budiharto,  W.  (2023a).  Comparison  of
Spelling Error Correction Algorithms for the Indonesian Language. 2023 11th
International  Conference  on  Information  and  Education  Technology,  ICIET
2023, 443–447. https://doi.org/10.1109/ICIET56899.2023.10111191
Yanfi,  Y.,  Setiawan,  R.,  Soeparno,  H.,  &  Budiharto,  W.  (2023b).  Comparison  of
Spelling Error Correction Algorithms for the Indonesian Language. 2023 11th
International  Conference  on  Information  and  Education  Technology,  ICIET
2023, 443–447. https://doi.org/10.1109/ICIET56899.2023.10111191
Yulianto, M. A., & Nurhasanah, N. (2021). The Hybrid of Jaro-Winkler and Rabin-
Karp  Algorithm  in  Detecting  Indonesian  Text  Similarity. Jurnal  Online
Informatika, 6(1), 88–95. https://doi.org/10.15575/join.v6i1.640
Zhou,  C.,  Dai,  Y.,  Tang,  D.,  Zhao,  E.,  Feng,  Z.,  Kuang,  L.,  &  Shi,  S.  (2022).
Pretraining Chinese BERT for Detecting Word Insertion and Deletion Errors.
http://arxiv.org/abs/2204.12052
