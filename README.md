# Moje pohádka

Český responzivní designový prototyp pro personalizované příběhy s omalovánkami.

## Místní spuštění

`node preview-server.cjs` a otevřít http://127.0.0.1:4173.

Web je statický: `dist/index.html`, `dist/editorial.css`, `dist/forms.css`, `dist/app.js` a `dist/assets/`. Nepotřebuje instalaci závislostí ani sestavení; publikovat lze celý obsah `dist/`.

## Design

Knižní sazba Lora / DM Sans, tmavě zelený tisk, cihlový akcent a světlý papír. Úvod ukazuje skutečnou omalovánku. Číslované kapitoly a jednoduché linky nahrazují pastelové karty, emoji a plovoucí dekorace. Formulář, ukázka i mobilní zobrazení používají stejný vizuální styl.

Písma se načítají přes Google Fonts. Ukázkové obrázky vznikly pomocí AI; změna designu nepředstavuje jejich označení za ručně kreslené.

## Kontrola

`npm run check` ověří syntaxi skriptů a lokální odkazy na soubory. `npm start` spustí náhled. Node.js 18 nebo novější, bez dalších balíčků.

## Hotové funkce

- Úvodní stránka, vlastní ilustrace, šest témat a vlastní téma.
- Tříkrokový formulář s validací a zachováním údajů při návratu.
- Lokální náhled JPG/PNG do 10 MB, kontrola načtení a odstranění fotografie.
- Zvětšení ukázky, veřejné jednostránkové PDF s českým textem a omalovánkou.
- Časté otázky a informační dialogy bez fiktivních kontaktních údajů.
- WebMCP nástroj `start_story_configuration` otevře formulář s tématem.

## Před prodejem

Tento prototyp nevytváří objednávky, neúčtuje platby a negeneruje personalizované pohádky. Závěrečné tlačítko je záměrně neaktivní. Osobní údaje existují pouze v paměti prohlížeče. Jednostránková tisková ukázka není osmistránkový zákaznický sešit.

Napojit serverovou validaci, platební bránu s ověřenými a idempotentními webhooky, frontu tvorby, generování osmi scén podle dodaného řídícího promptu, kontrolu konzistence a kvality obrázků, soukromé úložiště, doručování e-mailů, omezení nákladů, retenční mazání a administraci. Doplnit HEIC převod, identitu provozovatele, skutečné kontakty a schválené nákupní a soukromí informace. Ověřit prodej a reklamace před veřejným spuštěním.
