#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Membuat PPT Workflow Aplikasi WargaJagaWarga
Tema: gelap (slate) + aksen merah/emerald sesuai UI aplikasi
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

# ===== Palet warna (mengikuti UI aplikasi) =====
BG_DARK = RGBColor(0x0F, 0x17, 0x2A)      # slate-950
BG_CARD = RGBColor(0x1E, 0x29, 0x3B)      # slate-800
RED = RGBColor(0xDC, 0x26, 0x26)          # red-600
ROSE = RGBColor(0xE1, 0x1D, 0x48)
AMBER = RGBColor(0xF5, 0x9E, 0x0B)
EMERALD = RGBColor(0x10, 0xB9, 0x81)
INDIGO = RGBColor(0x63, 0x66, 0xF1)
PURPLE = RGBColor(0xA8, 0x55, 0xF7)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
SLATE_300 = RGBColor(0xCB, 0xD5, 0xE1)
SLATE_400 = RGBColor(0x94, 0xA3, 0xB8)
SLATE_600 = RGBColor(0x47, 0x55, 0x69)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H
BLANK = prs.slide_layouts[6]


def add_slide():
    slide = prs.slides.add_slide(BLANK)
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, SLIDE_H)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_DARK
    bg.line.fill.background()
    bg.shadow.inherit = False
    return slide


def set_text(tf, lines, align=PP_ALIGN.LEFT):
    """lines: list of (text, size, bold, color)"""
    tf.word_wrap = True
    for i, (text, size, bold, color) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        run = p.add_run()
        run.text = text
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = color
        run.font.name = 'Segoe UI'


def box(slide, x, y, w, h, fill, line_color=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE):
    s = slide.shapes.add_shape(shape, x, y, w, h)
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = fill
    if line_color is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line_color
        s.line.width = Pt(1.25)
    s.shadow.inherit = False
    s.text_frame.margin_left = Inches(0.08)
    s.text_frame.margin_right = Inches(0.08)
    s.text_frame.margin_top = Inches(0.04)
    s.text_frame.margin_bottom = Inches(0.04)
    s.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE
    return s


def flow_node(slide, x, y, w, h, title, subtitle, color, title_size=13, sub_size=9.5):
    s = box(slide, x, y, w, h, BG_CARD, line_color=color)
    lines = [(title, title_size, True, WHITE)]
    if subtitle:
        lines.append((subtitle, sub_size, False, SLATE_300))
    set_text(s.text_frame, lines, align=PP_ALIGN.CENTER)
    return s


def arrow_r(slide, x, y, w=Inches(0.42), h=Inches(0.26), color=SLATE_400):
    a = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, x, y, w, h)
    a.fill.solid()
    a.fill.fore_color.rgb = color
    a.line.fill.background()
    a.shadow.inherit = False
    return a


def arrow_d(slide, x, y, w=Inches(0.26), h=Inches(0.38), color=SLATE_400):
    a = slide.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, x, y, w, h)
    a.fill.solid()
    a.fill.fore_color.rgb = color
    a.line.fill.background()
    a.shadow.inherit = False
    return a


def header(slide, kicker, title, accent=RED):
    bar = box(slide, Inches(0.55), Inches(0.42), Inches(0.09), Inches(0.95), accent,
              shape=MSO_SHAPE.RECTANGLE)
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.32), Inches(12), Inches(1.15))
    set_text(tb.text_frame, [
        (kicker, 12, True, accent),
        (title, 30, True, WHITE),
    ])
    return tb


def footer(slide, num, total):
    tb = slide.shapes.add_textbox(Inches(0.55), Inches(7.05), Inches(12.2), Inches(0.35))
    p = tb.text_frame.paragraphs[0]
    r = p.add_run()
    r.text = f"WargaJagaWarga — Workflow Aplikasi   •   {num}/{total}"
    r.font.size = Pt(9)
    r.font.color.rgb = SLATE_600


TOTAL = 10

# =====================================================================
# SLIDE 1 — JUDUL
# =====================================================================
s = add_slide()
# aksen dekoratif
c1 = box(s, Inches(10.6), Inches(-1.4), Inches(4.6), Inches(4.6), RGBColor(0x7F, 0x1D, 0x1D), shape=MSO_SHAPE.OVAL)
c2 = box(s, Inches(-1.6), Inches(5.4), Inches(3.8), Inches(3.8), RGBColor(0x0B, 0x3B, 0x2E), shape=MSO_SHAPE.OVAL)

logo = box(s, Inches(0.9), Inches(1.0), Inches(0.85), Inches(0.85), RED)
set_text(logo.text_frame, [("W", 34, True, WHITE)], align=PP_ALIGN.CENTER)

tb = s.shapes.add_textbox(Inches(0.9), Inches(2.1), Inches(11.5), Inches(2.6))
set_text(tb.text_frame, [
    ("WORKFLOW APLIKASI", 14, True, RED),
    ("WargaJagaWarga", 54, True, WHITE),
    ("Satu sentuhan, Satpam dan tetanggamu datang.", 20, False, SLATE_300),
])

badges = [
    ("🇮🇩 Bahasa Indonesia Default + Opsi Bahasa", EMERALD),
    ("💳 Aplikasi Berbayar • Trial Gratis 14 Hari", AMBER),
    ("👑 Diawasi Superadmin: tarafk1972@gmail.com", INDIGO),
]
bx = Inches(0.9)
for text, color in badges:
    b = box(s, bx, Inches(5.1), Inches(3.85), Inches(0.55), BG_CARD, line_color=color)
    set_text(b.text_frame, [(text, 11.5, True, color)], align=PP_ALIGN.CENTER)
    bx += Inches(4.05)

tb2 = s.shapes.add_textbox(Inches(0.9), Inches(6.15), Inches(11.5), Inches(0.5))
set_text(tb2.text_frame, [
    ("Full-Stack Next.js 14 • Platform Tanggap Darurat Komunitas Perumahan", 12, False, SLATE_400),
])
footer(s, 1, TOTAL)

# =====================================================================
# SLIDE 2 — PERAN PENGGUNA
# =====================================================================
s = add_slide()
header(s, "GAMBARAN UMUM", "4 Peran Pengguna dalam Aplikasi")

roles = [
    ("👤 WARGA", EMERALD, [
        "Mendaftar & memilih bahasa",
        "Tekan tombol SOS darurat",
        "Merespons & berkomentar",
        "Melihat peta klaster",
    ]),
    ("🛡️ SATPAM", AMBER, [
        "Status: Siaga / Patroli /\nMerespons / Istirahat",
        "Merespons SOS warga",
        "Pantau peta kejadian",
        "Ditetapkan oleh Admin",
    ]),
    ("⭐ ADMIN", PURPLE, [
        "Pendaftar PERTAMA otomatis\nmenjadi Admin",
        "Accept / Reject anggota baru",
        "Tentukan peran: Warga /\nSatpam / Admin",
        "Kelola area pada peta",
    ]),
    ("👑 SUPERADMIN", INDIGO, [
        "Email tarafk1972@gmail.com",
        "Mengawasi semua Admin",
        "Customer Service resmi",
        "Awasi langganan berbayar\n(trial, tangguhkan, aktifkan)",
    ]),
]
x = Inches(0.55)
for title, color, items in roles:
    card = box(s, x, Inches(1.75), Inches(2.98), Inches(4.7), BG_CARD, line_color=color)
    lines = [(title, 17, True, color), ("", 6, False, SLATE_300)]
    for it in items:
        lines.append(("•  " + it, 11.5, False, SLATE_300))
        lines.append(("", 4, False, SLATE_300))
    set_text(card.text_frame, lines)
    card.text_frame.vertical_anchor = MSO_ANCHOR.TOP
    x += Inches(3.12)

note = box(s, Inches(0.55), Inches(6.6), Inches(12.25), Inches(0.42), None)
set_text(note.text_frame, [
    ("Alur peran: Warga pertama mendaftar → otomatis ADMIN → mengajak & menyetujui anggota lain → Superadmin mengawasi seluruh klaster.",
     11, False, SLATE_400)], align=PP_ALIGN.CENTER)
footer(s, 2, TOTAL)

# =====================================================================
# SLIDE 3 — WORKFLOW REGISTRASI & PILIHAN BAHASA
# =====================================================================
s = add_slide()
header(s, "WORKFLOW 1", "Registrasi Anggota & Pilihan Bahasa", accent=EMERALD)

y = Inches(2.0)
h = Inches(1.15)
w = Inches(2.35)
gap = Inches(0.5)
nodes = [
    ("📱 Buka Aplikasi", "Tombol \"Daftar — Gratis\n14 Hari\" di beranda", SLATE_400),
    ("📝 Isi Formulir", "Nama, email, HP, blok,\nklaster, peran diajukan", EMERALD),
    ("🌐 Pilih Bahasa", "🇮🇩 Indonesia (default)\natau 🇬🇧 English", EMERALD),
    ("💳 Trial Dimulai", "Gratis 14 hari otomatis\ntercatat di akun", AMBER),
    ("⏳ Menunggu", "Status: MENUNGGU\npersetujuan Admin", PURPLE),
]
x = Inches(0.55)
for i, (t, sub, c) in enumerate(nodes):
    flow_node(s, x, y, w, h, t, sub, c)
    if i < len(nodes) - 1:
        arrow_r(s, x + w + Inches(0.04), y + Inches(0.45))
    x += w + gap

# Info bawah
info1 = box(s, Inches(0.55), Inches(3.7), Inches(6.0), Inches(2.6), BG_CARD, line_color=EMERALD)
set_text(info1.text_frame, [
    ("🌐 Aturan Bahasa", 15, True, EMERALD),
    ("", 5, False, SLATE_300),
    ("•  Bahasa Indonesia adalah bahasa default aplikasi", 12, False, SLATE_300),
    ("•  Bahasa dipilih SAAT registrasi", 12, False, SLATE_300),
    ("•  Bahasa pilihan menjadi default seluruh teks aplikasi", 12, False, SLATE_300),
    ("   untuk akun tersebut (tersimpan di profil)", 12, False, SLATE_300),
    ("•  Diterapkan otomatis setiap kali pengguna aktif", 12, False, SLATE_300),
], )
info1.text_frame.vertical_anchor = MSO_ANCHOR.TOP

info2 = box(s, Inches(6.8), Inches(3.7), Inches(6.0), Inches(2.6), BG_CARD, line_color=INDIGO)
set_text(info2.text_frame, [
    ("⚡ Kasus Khusus Saat Registrasi", 15, True, INDIGO),
    ("", 5, False, SLATE_300),
    ("•  Email tarafk1972@gmail.com  →  langsung menjadi", 12, False, SLATE_300),
    ("   SUPERADMIN & Customer Service (tanpa antre)", 12, False, SLATE_300),
    ("•  Pendaftar PERTAMA di klaster  →  otomatis ADMIN", 12, False, SLATE_300),
    ("   & langsung DISETUJUI (lihat Workflow 2)", 12, False, SLATE_300),
    ("•  Pendaftar berikutnya  →  antre persetujuan Admin", 12, False, SLATE_300),
])
info2.text_frame.vertical_anchor = MSO_ANCHOR.TOP
footer(s, 3, TOTAL)

# =====================================================================
# SLIDE 4 — WORKFLOW ADMIN PERTAMA & PERSETUJUAN
# =====================================================================
s = add_slide()
header(s, "WORKFLOW 2", "Admin Pertama & Persetujuan Anggota Baru", accent=PURPLE)

# Baris 1: jalur pendaftar pertama
lbl = s.shapes.add_textbox(Inches(0.55), Inches(1.7), Inches(6), Inches(0.35))
set_text(lbl.text_frame, [("JALUR A — PENDAFTAR PERTAMA DI KLASTER", 12, True, PURPLE)])
y = Inches(2.1)
h = Inches(1.05)
w = Inches(2.7)
flow_node(s, Inches(0.55), y, w, h, "🏘️ Klaster Baru", "Belum ada Admin\ndi klaster tersebut", SLATE_400)
arrow_r(s, Inches(3.32), y + Inches(0.4))
flow_node(s, Inches(3.85), y, w, h, "⭐ Otomatis ADMIN", "Langsung DISETUJUI,\ntanpa menunggu", PURPLE)
arrow_r(s, Inches(6.62), y + Inches(0.4))
flow_node(s, Inches(7.15), y, w, h, "📣 Mengajak Warga", "Sebarkan aplikasi &\najak anggota lain", PURPLE)
arrow_r(s, Inches(9.92), y + Inches(0.4))
flow_node(s, Inches(10.45), y, Inches(2.35), h, "⭐ Promosi Admin", "Bisa jadikan anggota\nlain sebagai Admin", PURPLE)

# Baris 2: jalur approval
lbl2 = s.shapes.add_textbox(Inches(0.55), Inches(3.5), Inches(8), Inches(0.35))
set_text(lbl2.text_frame, [("JALUR B — ANGGOTA BERIKUTNYA (ANTREAN PERSETUJUAN ADMIN)", 12, True, AMBER)])
y2 = Inches(3.9)
flow_node(s, Inches(0.55), y2, w, h, "⏳ MENUNGGU", "Anggota baru masuk\nantrean persetujuan", AMBER)
arrow_r(s, Inches(3.32), y2 + Inches(0.4))
dec = box(s, Inches(3.85), y2 - Inches(0.12), Inches(2.7), Inches(1.3), BG_CARD, line_color=WHITE,
          shape=MSO_SHAPE.DIAMOND)
set_text(dec.text_frame, [("Keputusan", 13, True, WHITE), ("Admin", 13, True, WHITE)], align=PP_ALIGN.CENTER)

# cabang accept
arrow_r(s, Inches(6.62), y2 + Inches(0.05), color=EMERALD)
acc = flow_node(s, Inches(7.15), y2 - Inches(0.55), Inches(2.7), Inches(0.95),
                "✅ ACCEPT + Tentukan Peran", "Warga / Satpam / Admin", EMERALD, title_size=12)
arrow_r(s, Inches(9.92), y2 - Inches(0.25), color=EMERALD)
flow_node(s, Inches(10.45), y2 - Inches(0.55), Inches(2.35), Inches(0.95),
          "🎉 DISETUJUI", "Anggota aktif &\nterhubung klaster", EMERALD, title_size=12)

# cabang reject
rej = flow_node(s, Inches(7.15), y2 + Inches(0.55), Inches(2.7), Inches(0.95),
                "❌ REJECT", "Status DITOLAK — tidak\nterhubung ke klaster", RED, title_size=12)

note = box(s, Inches(0.55), Inches(5.75), Inches(12.25), Inches(0.95), BG_CARD, line_color=SLATE_600)
set_text(note.text_frame, [
    ("💡 Hak Admin: menyetujui/menolak anggota baru sekaligus menentukan perannya (Warga, Satpam, atau Admin). "
     "Superadmin dapat melakukan hal yang sama di semua klaster sekaligus mengawasi kinerja para Admin.",
     12, False, SLATE_300)])
footer(s, 4, TOTAL)

# =====================================================================
# SLIDE 5 — SETELAH DISETUJUI: SAPAAN
# =====================================================================
s = add_slide()
header(s, "WORKFLOW 3", "Pengalaman Setelah HP Terdaftar & Disetujui", accent=EMERALD)

# Before / After
before = box(s, Inches(0.55), Inches(1.9), Inches(5.9), Inches(3.4), BG_CARD, line_color=SLATE_600)
set_text(before.text_frame, [
    ("SEBELUM DISETUJUI", 13, True, SLATE_400),
    ("", 6, False, SLATE_300),
    ("Beranda menampilkan:", 12, False, SLATE_300),
    ("", 4, False, SLATE_300),
    ("🔴  Tombol \"Buka Aplikasi Darurat\"", 13, False, WHITE),
    ("🔘  Tombol \"Daftar — Gratis 14 Hari\"", 13, True, WHITE),
    ("", 6, False, SLATE_300),
    ("Pengguna masih calon anggota /", 11.5, False, SLATE_400),
    ("menunggu persetujuan Admin.", 11.5, False, SLATE_400),
])
before.text_frame.vertical_anchor = MSO_ANCHOR.TOP

ar = slide_arrow = arrow_r(s, Inches(6.55), Inches(3.4), w=Inches(0.75), h=Inches(0.45), color=EMERALD)

after = box(s, Inches(7.4), Inches(1.9), Inches(5.4), Inches(3.4), BG_CARD, line_color=EMERALD)
set_text(after.text_frame, [
    ("SETELAH DISETUJUI ADMIN ✅", 13, True, EMERALD),
    ("", 6, False, SLATE_300),
    ("Tombol pendaftaran HILANG,", 12, False, SLATE_300),
    ("diganti sapaan hangat:", 12, False, SLATE_300),
    ("", 6, False, SLATE_300),
    ("\"Apa kabar hari ini,", 19, True, WHITE),
    ("<nama anggota>?\"", 19, True, EMERALD),
    ("", 6, False, SLATE_300),
    ("+ info klaster & peran anggota saat ini", 11.5, False, SLATE_400),
])
after.text_frame.vertical_anchor = MSO_ANCHOR.TOP

steps = box(s, Inches(0.55), Inches(5.6), Inches(12.25), Inches(1.1), BG_CARD, line_color=EMERALD)
set_text(steps.text_frame, [
    ("Alur: HP terdaftar → Admin ACCEPT → beranda otomatis berubah → sapaan personal + badge \"ANGGOTA TERDAFTAR "
     "& DISETUJUI ADMIN\" → anggota dapat memakai seluruh fitur (SOS, peta, direktori) sesuai perannya.",
     12.5, False, SLATE_300)])
footer(s, 5, TOTAL)

# =====================================================================
# SLIDE 6 — WORKFLOW SOS DARURAT
# =====================================================================
s = add_slide()
header(s, "WORKFLOW 4", "Alur Darurat SOS — Inti Aplikasi", accent=RED)

y = Inches(2.0)
h = Inches(1.2)
w = Inches(2.35)
nodes = [
    ("🆘 Tekan Tombol SOS", "Pilih jenis: Keamanan /\nMedis / Kebakaran / Listrik", RED),
    ("📢 Notifikasi Massal", "Sirine + banner darurat ke\nSatpam & semua tetangga", AMBER),
    ("🗺️ Peta Menyala", "Blok kejadian berkedip\nmerah di peta klaster", AMBER),
    ("🏃 \"Saya Meluncur!\"", "Satpam/tetangga merespons:\nMeluncur → Tiba → Memeriksa", INDIGO),
    ("✅ Situasi Aman", "Insiden SELESAI + konfeti\n+ siaran audio \"aman\"", EMERALD),
]
x = Inches(0.55)
for i, (t, sub, c) in enumerate(nodes):
    flow_node(s, x, y, w, h, t, sub, c, title_size=12.5)
    if i < len(nodes) - 1:
        arrow_r(s, x + w + Inches(0.04), y + Inches(0.47))
    x += w + Inches(0.5)

info = box(s, Inches(0.55), Inches(3.75), Inches(12.25), Inches(2.55), BG_CARD, line_color=SLATE_600)
set_text(info.text_frame, [
    ("Selama insiden berlangsung:", 14, True, WHITE),
    ("", 5, False, SLATE_300),
    ("•  Thread komentar real-time — warga & satpam berdiskusi memantau perkembangan situasi", 12.5, False, SLATE_300),
    ("•  Daftar responden tampil lengkap dengan status (Meluncur / Tiba di Lokasi / Memeriksa)", 12.5, False, SLATE_300),
    ("•  Banner sirine tetap tampil di semua halaman sampai insiden dinyatakan selesai", 12.5, False, SLATE_300),
    ("•  Statistik keamanan (jumlah insiden, rata-rata waktu tanggap ± 2,4 menit) diperbarui otomatis", 12.5, False, SLATE_300),
])
info.text_frame.vertical_anchor = MSO_ANCHOR.TOP
footer(s, 6, TOTAL)

# =====================================================================
# SLIDE 7 — WORKFLOW PETA KLASTER (ADMIN)
# =====================================================================
s = add_slide()
header(s, "WORKFLOW 5", "Admin Menentukan Area pada Peta Klaster", accent=AMBER)

y = Inches(2.0)
h = Inches(1.15)
w = Inches(2.85)
nodes = [
    ("🗺️ Buka Peta Klaster", "Admin membuka tab\n\"Peta Klaster\"", AMBER),
    ("📍 Tambah Area", "Tentukan posisi (x, y), nama\nblok, dan deskripsi area", AMBER),
    ("🏷️ Pilih Tipe Area", "Rumah • Pos Satpam •\nCCTV • Taman", AMBER),
    ("📲 Terpasang di Semua", "Area tampil di aplikasi\nSEMUA anggota klaster", EMERALD),
]
x = Inches(0.55)
for i, (t, sub, c) in enumerate(nodes):
    flow_node(s, x, y, w, h, t, sub, c)
    if i < len(nodes) - 1:
        arrow_r(s, x + w + Inches(0.03), y + Inches(0.45))
    x += w + Inches(0.32)

info = box(s, Inches(0.55), Inches(3.7), Inches(12.25), Inches(2.6), BG_CARD, line_color=SLATE_600)
set_text(info.text_frame, [
    ("Fungsi peta bagi seluruh anggota:", 14, True, WHITE),
    ("", 5, False, SLATE_300),
    ("•  Melihat tata letak klaster: gerbang utama, pos satpam 24 jam, blok rumah A/B/C, CCTV, taman", 12.5, False, SLATE_300),
    ("•  Blok yang mengalami darurat menyala dengan animasi sirene merah", 12.5, False, SLATE_300),
    ("•  Klik ikon rumah untuk memantau status atau melaporkan SOS di blok tersebut", 12.5, False, SLATE_300),
    ("•  Hanya ADMIN (dan Superadmin) yang dapat menambah / menghapus area — warga hanya melihat", 12.5, False, SLATE_300),
])
info.text_frame.vertical_anchor = MSO_ANCHOR.TOP
footer(s, 7, TOTAL)

# =====================================================================
# SLIDE 8 — WORKFLOW LANGGANAN BERBAYAR
# =====================================================================
s = add_slide()
header(s, "WORKFLOW 6", "Aplikasi Berbayar — Trial Gratis 14 Hari", accent=AMBER)

y = Inches(1.95)
h = Inches(1.15)
w = Inches(2.5)
flow_node(s, Inches(0.55), y, w, h, "📝 Registrasi", "Trial GRATIS 14 hari\ndimulai otomatis", EMERALD)
arrow_r(s, Inches(3.12), y + Inches(0.45))
flow_node(s, Inches(3.6), y, w, h, "⏳ Masa Trial", "Semua fitur terbuka;\nsisa hari tampil di tab\nLangganan", AMBER, sub_size=9)
arrow_r(s, Inches(6.17), y + Inches(0.45))
dec = box(s, Inches(6.65), y - Inches(0.1), Inches(2.5), Inches(1.35), BG_CARD, line_color=WHITE,
          shape=MSO_SHAPE.DIAMOND)
set_text(dec.text_frame, [("Hari ke-14:", 12, True, WHITE), ("bayar?", 12, True, WHITE)], align=PP_ALIGN.CENTER)

arrow_r(s, Inches(9.22), y + Inches(0.02), color=EMERALD)
flow_node(s, Inches(9.7), y - Inches(0.6), Inches(3.1), Inches(1.0),
          "💳 BAYAR → AKTIF", "Bulanan Rp 25.000 atau\nTahunan Rp 250.000 (hemat 2 bln)", EMERALD, title_size=12, sub_size=9)
flow_node(s, Inches(9.7), y + Inches(0.6), Inches(3.1), Inches(1.0),
          "⛔ TIDAK → KEDALUWARSA", "Akses dibatasi; hubungi CS /\npilih paket untuk lanjut", RED, title_size=11.5, sub_size=9)

panel = box(s, Inches(0.55), Inches(3.85), Inches(12.25), Inches(2.5), BG_CARD, line_color=INDIGO)
set_text(panel.text_frame, [
    ("👑 Pengawasan Superadmin (tarafk1972@gmail.com)", 14.5, True, INDIGO),
    ("", 5, False, SLATE_300),
    ("•  Memantau status langganan SEMUA anggota (Trial / Aktif / Kedaluwarsa / Ditangguhkan)", 12.5, False, SLATE_300),
    ("•  Perpanjang Trial +14 Hari  •  Tangguhkan akun  •  Aktifkan kembali akun", 12.5, False, SLATE_300),
    ("•  Semua transaksi & perubahan langganan tercatat dan hanya bisa dikelola oleh Superadmin (dilindungi API)", 12.5, False, SLATE_300),
    ("•  Superadmin sendiri berstatus GRATIS SELAMANYA sebagai pengawas platform & Customer Service", 12.5, False, SLATE_300),
])
panel.text_frame.vertical_anchor = MSO_ANCHOR.TOP
footer(s, 8, TOTAL)

# =====================================================================
# SLIDE 9 — WORKFLOW SUPERADMIN & CS
# =====================================================================
s = add_slide()
header(s, "WORKFLOW 7", "Superadmin & Customer Service", accent=INDIGO)

y = Inches(2.0)
h = Inches(1.15)
w = Inches(2.85)
nodes = [
    ("📨 Pesan Masuk", "Warga/calon komunitas kirim\nformulir \"Hubungi Kami\"", SLATE_400),
    ("👑 CS Menerima", "Superadmin melihat antrean\npesan (status: BARU)", INDIGO),
    ("💬 Balas & Proses", "Tulis respons CS; status\nmenjadi DIPROSES", INDIGO),
    ("✅ Selesai", "Pertanyaan terjawab /\nkomunitas baru terdaftar", EMERALD),
]
x = Inches(0.55)
for i, (t, sub, c) in enumerate(nodes):
    flow_node(s, x, y, w, h, t, sub, c)
    if i < len(nodes) - 1:
        arrow_r(s, x + w + Inches(0.03), y + Inches(0.45))
    x += w + Inches(0.32)

col1 = box(s, Inches(0.55), Inches(3.7), Inches(6.0), Inches(2.6), BG_CARD, line_color=INDIGO)
set_text(col1.text_frame, [
    ("Tugas pengawasan Superadmin", 14, True, INDIGO),
    ("", 5, False, SLATE_300),
    ("•  Mengawasi kinerja semua Admin klaster", 12, False, SLATE_300),
    ("•  Memantau seluruh insiden & statistik keamanan", 12, False, SLATE_300),
    ("•  Mengelola langganan berbayar semua anggota", 12, False, SLATE_300),
    ("•  Dapat menyetujui/menolak anggota di klaster mana pun", 12, False, SLATE_300),
])
col1.text_frame.vertical_anchor = MSO_ANCHOR.TOP

col2 = box(s, Inches(6.8), Inches(3.7), Inches(6.0), Inches(2.6), BG_CARD, line_color=EMERALD)
set_text(col2.text_frame, [
    ("Identitas Superadmin", 14, True, EMERALD),
    ("", 5, False, SLATE_300),
    ("•  Ditentukan oleh email khusus: tarafk1972@gmail.com", 12, False, SLATE_300),
    ("•  Registrasi dengan email tsb → otomatis SUPERADMIN", 12, False, SLATE_300),
    ("•  Berperan ganda: pengawas platform + Customer Service", 12, False, SLATE_300),
    ("•  Kontak CS tercantum di footer aplikasi", 12, False, SLATE_300),
])
col2.text_frame.vertical_anchor = MSO_ANCHOR.TOP
footer(s, 9, TOTAL)

# =====================================================================
# SLIDE 10 — ARSITEKTUR & PENUTUP
# =====================================================================
s = add_slide()
header(s, "TEKNIS & RINGKASAN", "Arsitektur Aplikasi & Alur Data")

y = Inches(1.95)
h = Inches(1.1)
flow_node(s, Inches(0.55), y, Inches(2.9), h, "🖥️ Frontend", "Next.js 14 + React 18\nTailwind CSS • i18n ID/EN", INDIGO)
arrow_r(s, Inches(3.52), y + Inches(0.42))
flow_node(s, Inches(4.0), y, Inches(3.4), h, "🔌 REST API", "/api/users • /api/incidents\n/api/map-areas • /api/subscriptions\n/api/contacts • /api/state", AMBER, sub_size=9)
arrow_r(s, Inches(7.47), y + Inches(0.42))
flow_node(s, Inches(7.95), y, Inches(2.9), h, "🗄️ Database", "Penyimpanan persisten\ndata/wargajagawarga.json", EMERALD)
arrow_r(s, Inches(10.92), y + Inches(0.42))
flow_node(s, Inches(11.4), y, Inches(1.45), h, "🔁 Sinkron", "Semua\nanggota", SLATE_400, title_size=12)

rk = box(s, Inches(0.55), Inches(3.55), Inches(12.25), Inches(2.75), BG_CARD, line_color=RED)
set_text(rk.text_frame, [
    ("Rangkuman alur lengkap aplikasi", 15, True, RED),
    ("", 5, False, SLATE_300),
    ("1.  Registrasi (pilih bahasa 🇮🇩/🇬🇧) → trial gratis 14 hari dimulai → antre persetujuan", 12.5, False, SLATE_300),
    ("2.  Pendaftar pertama klaster = ADMIN otomatis; Admin meng-accept/reject & menetapkan peran anggota", 12.5, False, SLATE_300),
    ("3.  Disetujui → sapaan \"Apa kabar hari ini, <nama>?\" menggantikan tombol pendaftaran", 12.5, False, SLATE_300),
    ("4.  Anggota memakai SOS darurat, peta klaster (area diatur Admin), direktori & statistik", 12.5, False, SLATE_300),
    ("5.  Hari ke-14: pilih paket Bulanan/Tahunan; Superadmin (tarafk1972@gmail.com) mengawasi semuanya + CS", 12.5, False, SLATE_300),
])
rk.text_frame.vertical_anchor = MSO_ANCHOR.TOP

thanks = s.shapes.add_textbox(Inches(0.55), Inches(6.45), Inches(12.25), Inches(0.5))
set_text(thanks.text_frame, [
    ("Terima kasih — WargaJagaWarga: Tanggap Darurat untuk Komunitas yang Lebih Aman 🛡️", 14, True, WHITE),
], align=PP_ALIGN.CENTER)
footer(s, 10, TOTAL)

OUT = 'docs/Workflow-Aplikasi-WargaJagaWarga.pptx'
import os
os.makedirs('docs', exist_ok=True)
prs.save(OUT)
print('Saved:', OUT)
