# Současný projekt — 9. 10. 2026

Rozhodující je sestavený web z aktuálního zdroje. Značka: Pohádkové omalovánky. Typografie Nunito / DM Sans, béžové pozadí s jemnými čmáranicemi, zelený text, meruňková tlačítka a zaoblené karty. Úklid nemění rozložení, ilustrace používané stránkami ani grafickou identitu.

Homepage: hero s odkazem do konfigurátoru a klikacím náhledem → čtyři rozbalovací bubliny na svislé pastelkové cestě → výzva s chlapečkem a liškou → otázky → patička. Celý šestistránkový vzor je v modálu; PDF je ke stažení. Pastelky jsou vlevo od druhého kroku, knížka vpravo od třetího. Veřejný text popisuje cílovou výrobu přímo na webu.

Konfigurátor /vytvorit/ je noindex: dítě → svět → vhodní parťáci → přání → shrnutí. Výběr světa teprve zpřístupní parťáky. Vlastní volby jsou první, nic není předvybrané a existuje varianta bez parťáka. Katalog má 17 originálních postav a každý připravený svět alespoň čtyři. Kontrolní modál následuje po lokální validaci, zachovává údaje a obsahuje vývojové kopírování úplného promptu. Toto funkční ovládání zůstává zachováno.

Řídící dokument spec/Ridici_prompt_6_omalovanek_v1_6.md je jediný zdroj instrukcí. Build odvozuje server/prompts.mjs a dist/runtime/. shared/story-brief.mjs sestavuje náhled, kopírovaný prompt a API variantu. Údaje dítěte se nevkládají do URL ani analytiky. PDF má logo vlevo dole na každé straně a označení začátku pouze na první.

Statické HTML vzniká scripts/build-pages.mjs. Autorované klientské CSS/JS a veřejné assety jsou v dist/, serverový zdroj v server/. Ukázkové PDF vzniká make-sample.py ze spec/. Nezaměňovat hotovou ukázku za běžící zákaznický generátor. Poskytovatel, platba, produkční úložiště a doručení nejsou připojeny; API se bez nich bezpečně zastaví. Backend a jeho testy jsou platná příprava služby.

Sites je hostovaný náhled. pages-dist je odvozený statický export pro GitHub Pages; jeho Git metadata musí zůstat zachována. Kontaktní e-mail: petrlavikweb@gmail.com. Další práce a podmínky dokončení: DODELAT.md. Provedený úklid a ověření: VALIDATION.md.

Informační stránky a technická cookie lišta: LEGAL_COOKIES.md. Provozovatel je uveden pouze na informačních stránkách; patička obsahuje odkazy, nikoli jeho identifikační údaje.
