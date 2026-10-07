# Moje pohádka

Český responzivní web pro příběh se šesti omalovánkami podle specifikace 1.5. Cena produktu je 80 Kč. Výroba a platby dosud nejsou připojené; web tuto skutečnost uvádí a nedovolí zahájit placenou výrobu.

## Spuštění a ověření

Node.js 22 nebo novější, bez instalace balíčků:

```sh
npm run check
npm run build
npm start
```

Náhled běží na http://127.0.0.1:4173. Build vytvoří Workers kompatibilní `dist/server/index.js` s veřejnými soubory; soukromé prompty, specifikace a testy nejsou veřejnými URL. Manifest zachovává původní Sites projekt. Vygenerovaný server se neukládá do Gitu, vzniká před publikováním.

## Chování webu

- Formulář pro věk 3–9 let, šest témat a vlastní téma, fotografii nebo popis vzhledu, vlastní či známou postavu nebo osobnost. Jméno kamaráda má limit 60 znaků, vlastní zadání 120.
- Třetí krok odesílá přesné parametry a případnou fotografii na `POST /api/preflight`. Fotografie se v současné verzi neukládá ani neposílá generativní AI. E-mail se při kontrole neposílá.
- Server vrací `approved`, `blocked` nebo `needs_review`. Bez skutečných adaptérů poskytovatele, moderace, rozpočtu a úložiště schválení vrátí `needs_review`. Údaje zákazníka nemohou schválit vlastní požadavek.
- Schválení má 15minutovou platnost a otisk údajů, skutečného souboru, poskytovatele, pravidel a nastavení. Změna zadání schválení zneplatní. Známé jméno samo o sobě není blokováno; opakované odmítnutí se vztahuje jen na konkrétní otisk, poskytovatele a model.
- `/api/checkout` a `/api/generate` vracejí 503 s vysvětlením chybějícího připojení. Nikdy neúčtují ani negenerují.
- Ukázka má jeden název příběhu a barevnou frázi v textu, kresba zůstává černobílá. Veřejné PDF je pouze první ukázková strana, nikoli zákaznický sešit.

## Výrobní pravidla připravená v kódu

`server/prompts.mjs` obsahuje přesný hlavní a obrazový prompt ze souboru `spec/Ridici_prompt_6_omalovanek.md`. Zákaznický JSON je oddělen od důvěryhodné developer instrukce. `generation-contract.mjs` připraví zprávy pouze s platným serverovým schválením a ověřenou platbou. Jde o integrační kontrakt, který sám žádnou službu nevolá.

Validátor vyžaduje přesně šest navazujících stran 1–6, jediný kořenový název, délku textu podle věku, platné odkazy na postavy a barevnou frázi z pevné tiskové palety. Blokované výstupy nepředává tvorbě obrázků. Obrazové úlohy mají pevné `model=gpt-image-2`, `quality=medium`, `size=1536x1024`, `n=1`, jeden pokus a skutečné soubory referencí pro edits. Zákaznický text nemění technické parametry; nejsou automatické přechody na high, auto ani jiný model.

Serverové adaptéry jsou důvěryhodné funkce; kontrola dostupnosti nesmí volat generativní AI a odhad nákladů musí zahrnovat celý sešit i reference ve stejné měně jako limit. Při dodatečném připojení je nutné znovu ověřit podporu přesného modelu a parametrů u poskytovatele.

`make-sample.py` sestaví tiskovou ukázku z `spec/sample-page.json`: A4 na šířku, vložený český font, 15bodový text, řádkování 21, jemný panel s odsazením 18 bodů, pevná barva fráze, celý obraz 3:2 bez ořezu. Vyžaduje Python, reportlab, pypdf, Arial a Poppler pro ověřovací náhled.

## Před spuštěním prodeje

Připojit skutečné adaptéry poskytovatele a moderace, soukromé úložiště schválení a fotografií, platební bránu s ověřenými idempotentními webhooky, frontu šesti ilustrací, kontrolu obrazových promptů a výsledků, sestavení celého PDF a e-mailové doručení. Evidovat požadavky, usage a skutečné náklady každého pokusu. Při nedoručení řešit vrácení platby. Doplnit retenční mazání, identitu provozovatele, kontakty a obchodní i soukromí informace. Bez těchto integrací nejde o provozuschopný prodejní systém.

Design používá knižní sazbu Lora / DM Sans, zelený tisk, meruňkový akcent a jemné přechody žluté, modré a zelené. Ovládací prvky, karty a dialogy mají zaoblené rohy. Úvodní náhled i zvětšená ukázka používají skutečnou stránku PDF v `dist/assets/ukazka-stranky.png`, aby sazba a rozložení odpovídaly staženému dokumentu; `make-sample.py` aktualizuje PDF i tento obrázek současně. Písma se načítají přes Google Fonts. Ukázkové ilustrace vznikly pomocí AI.
