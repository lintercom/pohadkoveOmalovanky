from pathlib import Path
from html import escape
import json, os, subprocess, shutil
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

root = Path(__file__).parent
page = json.loads((root/'spec/sample-page.json').read_text(encoding='utf-8'))
fonts = Path(os.environ.get('STORY_FONT_DIR', 'C:/Windows/Fonts'))
pdfmetrics.registerFont(TTFont('Story', str(fonts/'arial.ttf')))
pdfmetrics.registerFont(TTFont('StoryBold', str(fonts/'arialbd.ttf')))
pdfmetrics.registerFontFamily('Story', normal='Story', bold='StoryBold')
palette = {'red':'#C62828','yellow':'#AD7900','green':'#2E7D32','blue':'#1565C0','purple':'#7B1FA2','pink':'#C83F81','orange':'#C45B00'}
target = page['color_target']
before, after = page['story_text_cs'].split(target['phrase_cs'], 1)
story = escape(before)+'<b><font color="'+palette[target['color_en']]+'">'+escape(target['phrase_cs'])+'</font></b>'+escape(after)
pdf = root/'dist/assets/ukazka-pohadky.pdf'
c = canvas.Canvas(str(pdf), pagesize=landscape(A4))
c.setTitle(page['title_cs']+' – ukázka první strany')
c.setAuthor('Moje pohádka')
w,h = landscape(A4)
margin,padding = 30,18
c.setFont('StoryBold',22)
c.drawString(margin,h-margin-22,page['title_cs'])
p = Paragraph(story, ParagraphStyle('story',fontName='Story',fontSize=15,leading=21))
pw,ph = p.wrap(w-2*margin-2*padding,h)
panel_top = h-margin-44
panel_bottom = panel_top-ph-2*padding
c.setFillColorRGB(253/255,253/255,250/255)
c.setStrokeColorRGB(227/255,229/255,220/255)
c.setLineWidth(.6)
c.roundRect(margin,panel_bottom,w-2*margin,ph+2*padding,8,fill=1,stroke=1)
p.drawOn(c,margin+padding,panel_bottom+padding)
image_height = panel_bottom-36
image_width = min(w-2*margin,image_height*1.5)
c.drawImage(str(root/'dist/assets/coloring.png'),(w-image_width)/2,27,width=image_width,height=image_width/1.5)
c.setFillColorRGB(.25,.3,.25)
c.setFont('Story',9)
c.drawRightString(w-margin,16,'1 / 6 · ukázka první strany')
c.showPage()
c.save()
doc = PdfReader(pdf)
assert len(doc.pages)==1
assert page['title_cs'] in doc.pages[0].extract_text()
assert target['phrase_cs'] in doc.pages[0].extract_text()
(root/'qa').mkdir(exist_ok=True)
poppler = shutil.which('pdftoppm') or 'C:/Users/573/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
subprocess.run([poppler,'-scale-to','1600','-singlefile','-png',str(pdf),str(root/'qa/sample-pdf')],check=True)
shutil.copyfile(root/'qa/sample-pdf.png',root/'dist/assets/ukazka-stranky.png')
print('Verified: landscape A4, one sample page, Czech title and color phrase.')
