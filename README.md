# Moje pohádka — revize 1.6

Existující český web pro šestistránkový příběh s omalovánkami. Revize je místní, bez nasazení nebo push. Platby a personalizovaná výroba nejsou připojené a nelze je spustit z klienta.

## Spuštění

Node 22+, bez instalace balíčků:

```sh
npm run build
npm run check
npm start
```

Náhled: http://127.0.0.1:4173. Při nefunkčním globálním npm lze spustit přímo `node scripts/build-pages.mjs`, `node scripts/build-worker.cjs`, `node --test tests/*.test.mjs`, `node check-assets.cjs`, `node preview-server.cjs`.

## Hotová místní revize

- Nový jednoduchý dětský vzhled podle dodaných inspirací: Nunito / DM Sans, krémový podklad, zelená, meruňková, modrá, zaoblení, jemné barevné přechody. Stručná hlavní stránka, informace dále podle potřeby.
- Kompletní originální ukázka Eliška a kouzelný les: šest navazujících ilustrací, listování, dostupný text a šestistránkové PDF. Ilustrace jsou vytvořené AI, dítě je fiktivní.
- Lehké CSS animace skutečných obrázků a přechodu stránky, tlačítko pozastavení, reduced-motion. Nejde o video; inspirace obsahovaly obrázky.
- Čtyřkrokový formulář: dítě, prostředí, parťák, kontrola. Fotografie volitelná. Vyplněné údaje zůstávají při návratu mezi kroky v paměti; obnovení stránky je vymaže.
- Šest vlastních verzovaných postav s obrázky; vlastní nebo známý parťák; stejně dostupná volba bez parťáka.
- Čtyři výsledky kontroly a oddělené technické, poskytovatelské a právní hledisko. Žádný historický blacklist jmen ani placené zkušební obrázky.
- Jedenáct obsahových stránek v počátečním HTML, canonical, sitemap, strukturovaná data WebPage/Breadcrumb, skutečná 404 a přesměrování variant URL.
- Školní pilot a poptávka přes poštovní aplikaci na petrlavikweb@gmail.com. Web sám e-mail neodesílá; školní cena a licence nejsou schválené.
- Testovaný serverový základ pro objednávky, idempotentní platby, outbox, jednotlivé pokusy a náklady, zastavení při odmítnutí, soukromé tokeny, expiraci a refundaci. Jde o integrační základ, nikoli živý prodej.

## Struktura

`content/site.mjs` + `scripts/build-pages.mjs`: zdroje veřejných stránek. `content/dialogs.html`: dialogy. `dist/app.js`, `companion-ui.js`, `preflight.js`, `site.js`, `design.css`: klient. `server/`: soukromá logika. `spec/sample-story.json`, `spec/sample-images/`, `make-sample.py`: šestistránkový vzor. PDF generátor vyžaduje reportlab, pypdf, pypdfium2 a Arial; vloží font a ověří šest stran, jediný název a barevné fráze.

Nastavení ilustrací z dodaného promptu je pevné: gpt-image-2, medium, 1536×1024, n=1, nejvýše jeden pokus na scénu. Dostupnost těchto parametrů musí ověřit skutečný poskytovatel před zapnutím prodeje. Automatický dražší fallback není implementovaný.

Podrobnosti: [kontext](docs/PROJECT_CONTEXT.md), [výzkum a rozhodnutí](docs/RESEARCH.md), [ověření](docs/VALIDATION.md), [integrace](docs/INTEGRATIONS.md).

## GitHub Pages — nové zadání

Značka webu je Pohádková omalovánka. Uživatel následně autorizoval zveřejnění na GitHub Pages. `node scripts/build-github-pages.mjs` vytvoří samostatný veřejný export v ignorované složce `pages-dist/`, s cestami pod `/pohadkoveOmalovanky/`, odpovídajícími canonical odkazy a explicitním statickým režimem bez odesílání zákaznického zadání. Publikovat obsah exportu do větve gh-pages, kořen větve. Zdrojový projekt zůstává v main. Adresa: https://lintercom.github.io/pohadkoveOmalovanky/.
