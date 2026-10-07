# Ověření revize — 7. 10. 2026

## Provedeno

- Generování 11 obsahových HTML stránek + skutečné chybové stránky, build Workeru s 32 veřejnými soubory.
- 18 automatických testů prošlo. Pokrývají vstupy, fotku, vazbu/expiraci schválení, původní/vlastní/známou postavu, nejednoznačnost, oddělení právní nejistoty, odmítnutí před platbou i po platbě, zastavení dalších pokusů, změnu nákladů, špatné PDF, cizí token, expiraci, duplicitní platbu, přesnou částku, webhook podpis a časové okno, restart a obnovu lokální databáze ze zálohy, HTTP přesměrování a 404.
- Testy používají označené testovací adaptéry; neověřují skutečné přijetí známé postavy obrazovým poskytovatelem ani komerční oprávnění.
- Syntaxe všech veřejných JS a serverových MJS souborů prošla. Projekt nemá samostatně instalovaný ESLint; nepředstíráme jeho spuštění.
- Kontrola všech 12 HTML souborů: lokální odkazy, zdroje, kotvy a jedinečná ID; vyvážené CSS bloky; soubor PDF.
- PDF generátor ověřil šest A4 stran na šířku, jediný název na první straně, fráze a délku textu. Všechny stránky vykreslil. Vizuálně zkontrolované finální strany 1, 3 a 6, ilustrace katalogu a scény byly zkontrolované při přípravě. Náhledy používají skutečné rendery PDF, nikoli reklamní makety.
- Náhledy stran mají přibližně 75–92 kB, pevné rozměry 1200×849; PDF přibližně 8,2 MB se stahuje až na vyžádání. Katalogový PNG atlas přibližně 1,6 MB; před nasazením je vhodná další optimalizace statických souborů a způsobu jejich hostování.

## Neprovedeno / omezení

- Browserová kontrola localhostu byla dříve v tomto chatu odmítnuta bezpečnostní politikou. Omezení nebylo obcházeno. Nejsou nové screenshoty desktopu/mobilu, Lighthouse skóre ani potvrzený vizuální test v prohlížeči. Responzivní breakpointy, focus styly, native dialog/radio/details, popisky, reduced-motion a pause jsou v kódu; kompletní klávesnicovou a čtečkovou cestu je nutné ověřit v povoleném prohlížeči.
- Nejsou terénní Core Web Vitals ani uživatelské rozhovory. Cíle nejsou naměřené výsledky.
- Žádná skutečná platba, produkční generování, odeslání e-mailu, nasazení či GitHub push. Externí API, transakční produkční úložiště/fronta, skutečné PDF zakázky, doručení a refundace čekají na připojení; přesný seznam v INTEGRATIONS.md.
- Animace jsou vytvořené pomocí CSS nad ilustracemi, nikoli z videa. Dodaná inspirace obsahovala 14 statických obrázků.

## Ruční kontrola při nejbližší dostupné prohlížečové relaci

Šířky 360/390/768/1440 px; bez horizontálního přetékání. Listovat všech šest stran, číst text, stáhnout PDF. Otevřít formulář ze všech CTA, projít tři volby parťáka, vracet se zpět, měnit fotografii, spustit nepřipojenou kontrolu. Tab/Shift+Tab/Escape a vrácení focusu. Zkontrolovat školní mailto a pravdivý stav neodesláno. Zapnout systémový reduced-motion a pozastavit animace. Vyzkoušet navigaci a vzor i bez JavaScriptu.
