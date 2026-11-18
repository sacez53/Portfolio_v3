"""Export du CV éditorial. Exécuter avec Python et ReportLab."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)
for name, file in [
    ("Body", "Special_Gothic/static/SpecialGothic-Regular.ttf"),
    ("Medium", "Special_Gothic/static/SpecialGothic-Medium.ttf"),
    ("Bold", "Special_Gothic/static/SpecialGothic-Bold.ttf"),
    ("Display", "Special_Gothic/static/SpecialGothic_Expanded-Bold.ttf"),
]:
    pdfmetrics.registerFont(TTFont(name, str(ROOT / "src" / "fonts" / file)))

pdfmetrics.registerFontFamily("Body", normal="Body", bold="Bold")
W, H = A4
DEST = OUT / "CV-Sacha-Guitter-DA-stage-2027-final.pdf"
c = canvas.Canvas(str(DEST), pagesize=A4, pageCompression=1)
c.setTitle("Sacha Guitter - Curriculum vitæ")
c.setAuthor("Sacha Guitter")
c.setSubject("Photographie, direction artistique et développement web")
c.setCreator("Portfolio Sacha Guitter")


def line(x1, y, x2, weight=.6):
    c.setStrokeColor(colors.black)
    c.setLineWidth(weight)
    c.line(x1, H-y, x2, H-y)


def label(text, x, top, size=8, font="Medium", color=colors.black):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, H-top-size, text)


def para(text, x, top, width, size=10, leading=14, font="Body", color=colors.black):
    style = ParagraphStyle("text", fontName=font, fontSize=size, leading=leading,
                           textColor=color, alignment=TA_LEFT)
    p = Paragraph(text, style)
    _, height = p.wrap(width, H)
    assert top + height < 790, (text, top, height)
    p.drawOn(c, x, H-top-height)
    return top+height


def section(number, title, x, top, width):
    label(number, x, top+1, 8, "Medium", colors.HexColor("#707070"))
    label(title, x+25, top, 11, "Display")
    line(x, top+24, x+width, .7)
    return top+36


M = 35
R = W-M
gray = colors.HexColor("#404040")
label("CURRICULUM VITÆ", M, 29, 8.5)
c.setFont("Body", 8.5)
c.drawRightString(R, H-37.5, "BUT MMI / IUT DE LAVAL")
line(M, 51, R, .8)

# Mise en page de la première version : grand nom et deux colonnes.
label("SACHA", M-2, 63, 61, "Display")
label("GUITTER", M-2, 124, 61, "Display")
line(M, 204, R, 1.8)
para("RECHERCHE D’UN STAGE<br/>DU 22 FÉVRIER AU 30 AVRIL 2027", M, 216, 290, 11, 16, "Bold")
para("PHOTOGRAPHIE<br/>DIRECTION ARTISTIQUE<br/>DÉVELOPPEMENT WEB", 365, 215, R-365, 8.5, 12, "Medium")
line(M, 263, R, .7)

left, lw = M, 151
right = 218
rw = R-right

y = section("01", "Contact", left, 285, lw)
for heading, text in [
    ("E-MAIL", '<link href="mailto:sachaguitterphoto@gmail.com">sachaguitterphoto@gmail.com</link>'),
    ("TÉLÉPHONE", '<link href="tel:+33749610990">+33 7 49 61 09 90</link>'),
    ("LOCALISATION", "Laval (53)<br/>Sablé-sur-Sarthe (72)"),
    ("MOBILITÉ", "Permis B et véhicule"),
    ("PORTFOLIO", '<link href="https://sachaguitter.fr">sachaguitter.fr</link>'),
    ("INSTAGRAM", '<link href="https://www.instagram.com/sacha.guitter.photo/">@sacha.guitter.photo</link>'),
]:
    label(heading, left, y, 7.5, "Medium", gray)
    y = para(text, left, y+15, lw, 9.4, 13) + 20

y = section("02", "Intérêts", left, y+7, lw)
para("• Photographie<br/>• Nature<br/>• Faune sauvage<br/>• Concerts<br/>• Festivals", left, y, lw, 10, 19)

y = section("03", "Expériences professionnelles", right, 285, rw)
label("2024 - 2025", right, y, 8, "Medium", gray)
y = para("Photographe et créateur de contenu", right, y+14, rw, 11, 14, "Bold")
y = para("BDE MMI Laval · Engagement associatif<br/>Création de contenu officiel et couverture événementielle.", right, y+3, rw, 9.6, 13) + 9

for title, description in [
    ("Assistant photographe", "Studio Exemple (fictif) · Prises de vue et retouche."),
    ("Assistant communication", "Agence Exemple (fictive) · Visuels et réseaux sociaux."),
]:
    label("DATES À COMPLÉTER / EXEMPLE FICTIF", right, y, 7.5, "Medium", gray)
    y = para(title, right, y+12, rw, 10.5, 14, "Bold")
    y = para(description, right, y+2, rw, 9.6, 13) + 8

y = section("04", "Compétences", right, y, rw)
for title, detail in [
    ("Direction artistique et design", "UI/UX design, Figma, typographie éditoriale et ergonomie."),
    ("Photographie et création visuelle", "Terrain et studio : animalier, portrait, événementiel. Lightroom, Photoshop, Affinity Publisher, InDesign, Illustrator, Premiere Pro et Blender 3D."),
    ("Développement web", "HTML5, CSS3, JavaScript ES6+, Vite, API, Leaflet OSM. Responsive design, accessibilité RGAA et optimisation WebP."),
]:
    y = para(title, right, y, rw, 10.5, 14, "Bold")
    y = para(detail, right, y+4, rw, 9.6, 13) + 5

y = section("05", "Éducation", right, y+1, rw)
label("2024 - 2027", right, y, 8, "Medium", gray)
y = para("BUT Métiers du multimédia et de l’Internet", right, y+14, rw, 10.5, 14, "Bold")
y = para("IUT de Laval · Le Mans Université", right, y+3, rw, 9.6, 13)
label("JUIN 2025", right, y+10, 8, "Medium", gray)
y = para("Baccalauréat STI2D", right, y+22, rw, 10.5, 14, "Bold")
y = para("Sciences et technologies de l’industrie et du développement durable", right, y+3, rw, 9.6, 13)

assert y < 790, y
line(M, 804, R, .8)
label("SACHA GUITTER", M, 815, 7, "Bold")
c.setFillColor(gray)
c.setFont("Body", 7)
c.drawRightString(R, H-822, "CV / 01")
c.showPage()
c.save()
print(DEST)
