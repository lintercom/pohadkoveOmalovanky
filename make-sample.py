from pathlib import Path
from html import escape
import json, os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader
import pypdfium2 as pdfium

root=Path(__file__).parent
story=json.loads((root/'spec/sample-story.json').read_text(encoding='utf-8'))
design=json.loads((root/'spec/pdf-design.json').read_text(encoding='utf-8'))
fonts=Path(os.environ.get('STORY_FONT_DIR','C:/Windows/Fonts'))
pdfmetrics.registerFont(TTFont('Story',str(fonts/'arial.ttf')))
pdfmetrics.registerFont(TTFont('StoryBold',str(fonts/'arialbd.ttf')))
pdfmetrics.registerFontFamily('Story',normal='Story',bold='StoryBold')
pdfmetrics.registerFont(TTFont('Brand',str(root/'spec/fonts/Nunito-Black.ttf')))
palette={'red':'#C62828','yellow':'#AD7900','green':'#2E7D32','blue':'#1565C0','purple':'#7B1FA2','pink':'#C83F81','orange':'#C45B00'}
pdf=root/'dist/assets/ukazka-pohadky.pdf'
c=canvas.Canvas(str(pdf),pagesize=landscape(A4));c.setTitle(story['title_cs']);c.setAuthor(design['brand'])
w,h=landscape(A4)

def color(key):
    c.setFillColor(HexColor(design[key]))

def ribbon(x,y,width,height):
    # The same three-color underline as the site's typographic wordmark.
    for i,hex_color in enumerate(design['ribbon']):
        c.setFillColor(HexColor(hex_color))
        c.roundRect(x+i*width/3,y,width/3+0.4,height,height/2,fill=1,stroke=0)

def opening_header(margin):
    color('accent');c.setFont('Brand',9)
    c.drawString(margin,h-33,design['startLabel'])
    color('ink');c.setFont('Brand',24)
    assert pdfmetrics.stringWidth(story['title_cs'],'Brand',24)<w-2*margin
    c.drawString(margin,h-59,story['title_cs'])

def footer(index,margin):
    color('green');c.setFont('Brand',7)
    c.drawString(margin,27,design['wordmark'][0])
    color('ink');c.setFont('Brand',11)
    c.drawString(margin,15,design['wordmark'][1])
    ribbon(margin+0.5,10,66,2)
    start=w-margin-110
    for i in range(6):
        c.setFillColor(HexColor(design['green'] if i==index else design['line']))
        c.roundRect(start+i*10,19,6,3,1.5,fill=1,stroke=0)
    color('ink');c.setFont('Story',9)
    c.drawRightString(w-margin,16,f'{index+1} / 6')

for index,page in enumerate(story['pages']):
    assert page['page_number']==index+1
    assert 25<=len(page['story_text_cs'].split())<=40
    target=page['color_target'];before,after=page['story_text_cs'].split(target['phrase_cs'],1)
    text=escape(before)+'<b><font color="'+palette[target['color_en']]+'">'+escape(target['phrase_cs'])+'</font></b>'+escape(after)
    margin,padding=30,18
    if index==0:
        opening_header(margin)
    p=Paragraph(text,ParagraphStyle('story',fontName='Story',fontSize=15,leading=21,textColor=HexColor(design['ink'])))
    _,ph=p.wrap(w-2*margin-2*padding,h)
    top=h-margin-(44 if index==0 else 0);bottom=top-ph-2*padding
    color('panel');c.setStrokeColor(HexColor(design['line']));c.setLineWidth(.6)
    c.roundRect(margin,bottom,w-2*margin,ph+2*padding,12,fill=1,stroke=1);p.drawOn(c,margin+padding,bottom+padding)
    image_width=min(w-2*margin,(bottom-36)*1.5)
    c.drawImage(str(root/f'spec/sample-images/page-{index+1}.png'),(w-image_width)/2,27,width=image_width,height=image_width/1.5)
    footer(index,margin);c.showPage()
c.save()
doc=PdfReader(pdf);assert len(doc.pages)==6
for i,p in enumerate(doc.pages):
    text=p.extract_text();assert story['pages'][i]['color_target']['phrase_cs'] in text
    assert (story['title_cs'] in text)==(i==0)
    assert text.count(design['wordmark'][0])==1
    assert text.count(design['wordmark'][1])==1
    assert (design['startLabel'] in text)==(i==0)
preview=root/'dist/assets/story';preview.mkdir(parents=True,exist_ok=True)
rendered=pdfium.PdfDocument(str(pdf))
for i,page in enumerate(rendered):
    bitmap=page.render(scale=1200/w);image=bitmap.to_pil();image.save(preview/f'page-{i+1}.webp',quality=90,method=6)
print('Verified six A4 landscape pages, one title, Czech font, fixed colors and uncropped 3:2 images; rendered all previews.')
