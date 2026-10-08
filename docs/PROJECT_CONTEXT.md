# Kontext a plán revize — 7. 10. 2026

Výchozí commit: 7c6c353. Existující Sites web a GitHub lintercom/pohadkoveOmalovanky. Tato revize je pouze místní: poslední zadání výslovně zakazuje produkční publikování, reklamu a placenou produkční tvorbu. Nevolat deployment ani push, který by mohl spustit automatické nasazení.

Produkt: 6 českých stran, 6 černobílých scén, věk 3–9, 80 Kč pro rodiče, volitelná fotografie, původní PDF sazba. Zachovat jemné barvy a zaoblení. Školní cena ani licence nejsou schválené. Poptávkový e-mail: petrlavikweb@gmail.com; identita provozovatele dosud chybí.

## Priority a pořadí

1. Podklady a primární zdroje: dokončeno. Původní SEO PDF je doporučení, ne měřená hledanost. Rešerši a hypotézy evidovat samostatně.
2. Parťák: originální katalog s verzemi a obrázky, vlastní vstup, stejně dostupná volba bez parťáka; samostatný volitelný krok.
3. Kontrola: technika / pravidla poskytovatele / komerční oprávnění odděleně. Čtyři uživatelské stavy. Odstranit historický blacklist. Neověřené oprávnění není technický zákaz. Žádné placené zkušební obrázky.
4. SEO/UX: předrenderovaný hlavní obsah, užitečné rozdílné stránky, canonicals, sitemap, skutečná 404, pilot školek, návod na tisk. Nepřidávat prázdné tematické a věkové stránky bez vlastních ukázek.
5. Provozní základ: ověřený webhook, idempotence, trvalá fronta/outbox, uložení postupu a pokusů, stop při odmítnutí, rozpočet, soukromé přístupy a expirace, metriky bez osobních údajů. Externí adaptéry oddělit a bez konfigurace uzavřít.
6. Kontroly: syntaxe/build, integrační scénáře, SEO HTML/HTTP, bezpečnost přístupu, formulář. Zaznamenat neprovedené kontroly i chybějící integrace.

## Rozhodnutí

- Zachovat HTML/CSS/JS + Worker; přidat malý sestavovací krok obsahu, bez zbytečné migrace a instalace frameworku.
- Výchozí soukromý Site není veřejně indexovatelný; SEO připravenost neznamená indexaci. Před veřejným prodejem je nutné samostatné rozhodnutí o zveřejnění.
- Nové zadání kontroly má přednost před odlišnými pasážemi původního promptu 1.5. Zákaznický text zůstává daty.
- Neexistují provozní konverze, náklady, rozhovory ani CWV terénní data. Nic z toho nevymýšlet.
- Prohlížečová kontrola místního webu byla v tomto chatu dříve blokována bezpečnostní politikou. Neobcházet ji alternativním prohlížečem; nepředstírat pořízené screenshoty nebo změřené Lighthouse skóre.
- Jedna sada katalogových ilustrací; opakované generování variant neobjednávat.

Aktuální výsledky a zbývající kroky: viz VALIDATION.md po dokončení revize.

## Dokončená místní implementace

Revize designu podle 14 inspirací, zkrácení obsahu, 6 stran vzoru a PDF, pohyb obrázků přes CSS, katalog parťáků, čtyřkrokový formulář, oddělená kontrola a obsahové SEO stránky jsou vytvořené. Školní poptávka míří přes poštovní aplikaci na zadaný e-mail. Serverový základ je otestovaný s lokálními adaptéry; skutečné externí integrace popisuje INTEGRATIONS.md. Produkce a GitHub nebyly změněny. Neopakovat generování hotových ilustrací ani rešerši bez nového důvodu.

## Změna autorizace — GitHub Pages

Uživatel následně výslovně požádal o změnu značky na Pohádková omalovánka, nahrání projektu na GitHub a publikování na GitHub Pages. Tento nový pokyn nahrazuje dřívější zákaz publikování pro toto nasazení. Hlavní zdroje budou v main, veřejný statický export v gh-pages. Produkční server, platby a generování se tím nepřipojují.

## Aktuální změna 8. 10. 2026

Uživatel požádal o samostatný konfigurátor /vytvorit/, všechna pole na jedné stránce, kontrolní modal až po validaci, kopírování kompletního promptu a spuštění přes Sites. Implementováno bez redesignu, podle aktuálního GitHub main 4d1b290 včetně delfína a ptáčka. Stav a kontrolní meze: CONFIGURATOR.md. Nepřepisovat zpět starý wizard. Nová revize se publikuje přes stávající Sites projekt s původním publikem; není tím vyžádáno nové nasazení GitHub Pages.
