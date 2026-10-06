from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader
import subprocess

root = Path(__file__).parent
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold', 'C:/Windows/Fonts/arialbd.ttf'))
pdf = root / 'dist/assets/ukazka-pohadky.pdf'
c = canvas.Canvas(str(pdf), pagesize=landscape(A4))
c.setTitle('Eliška a kouzelný les - ukázková stránka')
c.setAuthor('Moje pohádka')
w, h = landscape(A4)
c.setFont('Arial', 9)
c.drawString(36,h-27,'ELIŠKA A KOUZELNÝ LES')
c.drawRightString(w-36,h-27,'UKÁZKA PRO 4 ROKY · 1')
c.setFont('ArialBold', 23)
c.drawString(36,h-61,'Nečekané setkání')
story = 'Eliška se vydala na procházku do lesa. U velikého stromu potkala malou lišku. „Pojď se podívat,“ zašeptala liška. Mezi listy se schovávala květina s velikými okvětními lístky. Eliška si k ní zvědavě dřepla.'
p=Paragraph(story,ParagraphStyle('story',fontName='Arial',fontSize=12,leading=17))
pw, ph=p.wrap(w-72,80)
p.drawOn(c,36,h-77-ph)
c.drawImage(str(root/'dist/assets/coloring.png'),36,24,width=w-72,height=h-150,preserveAspectRatio=True,anchor='c')
c.showPage(); c.save()
doc=PdfReader(pdf)
assert len(doc.pages)==1
assert 'Eliška' in doc.pages[0].extract_text()
(root/'qa').mkdir(exist_ok=True)
subprocess.run(['C:/Users/573/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe','-scale-to','1200','-singlefile','-png',str(pdf),str(root/'qa/sample-pdf')],check=True)
print('Created and checked sample PDF; one landscape A4 page.')
