# Moje pohádka

Český responzivní designový prototyp pro personalizované příběhy s omalovánkami.

## Místní spuštění

`node preview-server.cjs` a otevřít http://127.0.0.1:4173.

Web je statický: `dist/index.html`, `dist/style.css`, `dist/app.js` a `dist/assets/`.

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
