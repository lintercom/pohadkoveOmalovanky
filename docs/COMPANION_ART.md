# New companion illustrations

Generated with the built-in image generator, using `dist/assets/companions-v1.png` as a style reference. White backgrounds, matching the existing coloring-page characters.

- Bublík: `dist/assets/companions/bublik-dolphin.png`
- Pírko: `dist/assets/companions/pirko-bird.png`

## Shared prompt

Use case: illustration-story. Asset type: standalone companion character for a children's coloring website. Input image 1 is a STYLE REFERENCE ONLY: match its exact cute rounded character proportions, clean black/charcoal outlines, friendly large black eyes with white highlights, white unfilled shapes, sparse interior detail, crisp coloring-page illustration. Create ONE new character only, not a sheet and do not reproduce reference characters. Pure white background; no color, gray shading, texture, shadows, text, watermark, ground, scenery, border. Whole body centered with generous white margins, square canvas.

## Bublík prompt suffix

Subject: Bublík, a cheerful small dolphin with rounded fins and a plain little neckerchief. Gently curved body in a playful floating pose, anatomically recognizable dolphin tail and short rounded snout, sweet smiling face and friendly eyes. No other animals, no water or bubbles.

## Pírko prompt suffix

Subject: Pírko, a curious little bird with a rounded body, short beak, friendly eyes, wings slightly spread, and a plain tiny cross-body satchel like the reference fox's simple satchel. Small feet visible, sweet friendly smile. No other animals or scenery.


## Rozšíření katalogu v3 — 8. 10. 2026

Devět nových originálních postav doplňuje počet na sedmnáct. Každý připravený svět má alespoň čtyři vhodné parťáky; kouzelný les zachovává původních pět. Vlastní svět nabízí celý katalog, vlastní zadání a volba bez parťáka se nemění.

- Podmořský svět: Bublík, Kori (želvička), Oli (chobotnička), Vlnka (mořský koník).
- Vesmír: Blik, Lumi (hvězdička), Míra (mimozemšťánek), Rony (měsíční vozítko).
- Dinosauři: Bronťa, Tonda (triceratops), Riki (tyranosaurus), Fíla (pterosaurus).
- Zatoulaný obláček: Bořek, Pírko, Lumi, Fíla.
- Kouzelný les: Pip, Lisa, Bořek, Jiskra, Pírko.
- Zvířecí kamarádi: Pip, Lisa, Bublík, Pírko.

Nové ilustrace vytvořil vestavěný imagegen: devět původních generací bez alternativních variant a jedna cílená anatomická oprava Oliho nadbytečného devátého chapadla. Schválený výsledek má osm chapadel; původní obrázek je zachován mimo checkout. Úplné skutečné prompty: [COMPANION_ART_V3.md](COMPANION_ART_V3.md). Bílé pozadí a černé obrysy navazují na stávající styl. Webové exporty jsou 512 × 512 WebP v dist/assets/companions/. Původní nezměněné PNG jsou uchované mimo checkout v ../generated-companions-v3/.

Trvalé webové soubory a zároveň verzované obrazové reference:

- dist/assets/companions/kori-turtle.webp
- dist/assets/companions/oli-octopus.webp
- dist/assets/companions/vlnka-seahorse.webp
- dist/assets/companions/lumi-star.webp
- dist/assets/companions/mira-alien.webp
- dist/assets/companions/rony-rover.webp
- dist/assets/companions/tonda-triceratops.webp
- dist/assets/companions/riki-tyrannosaur.webp
- dist/assets/companions/fila-pterosaur.webp

Pevné popisy vzhledu, proporcí, počtu částí a charakteru jsou v server/companions.mjs; společný sestavovač je předává do zadání pro ChatGPT i API. Nové obrázky jsou samostatné reference, nikoli výřezy ze společného katalogového listu.
