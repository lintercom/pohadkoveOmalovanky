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


## Aktuální prompt 1.6 a úklid — 8. 10. 2026

Nový dodaný dokument je jediný zdroj všech promptů. Test ověřuje přesnou shodu hlavního a obrazového promptu se zdrojem a shodu veřejného runtime. Ruční kopie má explicitní manual_preview, produkční režim nemůže zapnout zákaznický JSON. Nová pole jsou povinná a nezahazují se; testujeme chybějící pole, neplatné odkazy, opakované scény, jednu barevnou frázi a relevantní obrazové vstupy.

Serverové testy navíc ověřují zastavení bez vizuálního dokladu, zákaz jeho použití jako reference a zákaz doručení bez kontroly celé sady a PDF. Doklady jsou fixture; skutečný hodnotitel ani placená výroba nejsou připojené. 30 testů prošlo. Syntaxe, build Worker a kontrola odkazů, CSS, ID a existujícího PDF jsou ověřené; neproběhlo placené generování ani browser QA.

Odstraněny nahrazené tři promptové podklady, duplicitní sample-page, nepoužívaný globální katalog, staré neodkazované náhledy, místní QA rendery a logy. Zachované zdroje a používaná grafika umožňují reprodukovat aktuální web. Deployment archiv je dočasný a po úspěšném publikování se odstraňuje. Git historie, vnořený Git checkout exportu a uživatelské soubory mimo repo nejsou předmětem úklidu.

## Vyrovnaný katalog parťáků — 8. 10. 2026

Katalog rozšířen z osmi na sedmnáct originálních postav. Počty pro les, zvířata, obláček, moře, vesmír a dinosaury jsou 5, 4, 4, 4, 4, 4. Test ověřuje minimum čtyř v každém světě, platné a neopakující se identifikátory, jedinečná jména a zachování všech možností ve vlastním světě.

Všech devět nových ilustrací bylo vizuálně prohlédnuto, popisy vzhledu sjednoceny s výsledky. Oli má po jedné cílené opravě ověřených osm chapadel. WebP exporty mají 512 × 512 pixelů, dohromady přibližně 169 KiB. Originály zůstávají mimo checkout; skutečné prompty i oprava jsou v COMPANION_ART_V3.md. Společný sestavovač předává nové popisy do zákaznického promptu.

Všech 31 automatických testů prošlo. Build Workeru obsahuje 48 veřejných souborů; kontrola deseti HTML souborů ověřila odkazy, ID, CSS a PDF. Žádné zákaznické placené AI API nebylo spuštěno. Nová browser QA neproběhla; toto ověření nepotvrzuje skutečné produkční generování ani jeho vizuální konzistenci.

## Grafická sazba vzoru — 8. 10. 2026

Znovu vysázeno šest stran původního příběhu a vyrenderováno všech šest náhledů pro homepage. Přidáno typografické logo s vloženým Nunito Black, barvy webu, úvodní označení pouze na první straně, podpis a nenápadný ukazatel stránky v patičce. Všech šest renderů bylo vizuálně prohlédnuto; bez nových ořezů, překrytí nebo zmenšení původní kreslicí plochy. Text zůstává 15/21 bodů, barvy cílových frází zachovány, scény jsou původní černobílé ilustrace. Ověřeno šest A4 stran na šířku, jediný název a jediné úvodní označení, česká diakritika, značka na každé straně a shodná grafická instrukce v ručním i API sestavovači. Obsah příběhu, konfigurátor a webový layout se nemění.

## Přesun ukázky do modálu — 8. 10. 2026

Odstraněna samostatná ukázková sekce; všech šest stran a PDF jsou v existujícím nativním dialogu, otevřeném z hero obrázku i textového odkazu. Dva nové testy ověřují HTML umístění a logiku skutečných JS skriptů v DOM simulaci: oba spouštěče, listování, klávesové šipky, meze a focus při deaktivaci tlačítka, přímý výběr stran, návrat focusu na správný spouštěč, kliknutí na pozadí a starý hash odkaz. Celkem 33 testů, syntaktické a asset kontroly a build Workeru prošly. Nejde o browser QA; nativní focus trap, Escape a mobilní vykreslení nebyly nově ověřeny v prohlížeči. Obrázky, PDF a konfigurátor zůstávají beze změny.

## Logo v levém dolním rohu PDF — 8. 10. 2026

Logo přesunuto ze záhlaví první strany do levého dolního rohu všech šesti stran. Dvouřádkový slovní znak s tříbarevným podtržením nahrazuje původní jednořádkový podpis. Znovu vyrenderováno a vizuálně prohlédnuto všech šest stran bez překrytí kresby. Extrakce PDF ověřila právě jeden výskyt obou řádků loga na každé straně a jeho souřadnice vlevo dole. Velikost a umístění ilustrací, obsah textů a barevné fráze zachovány. Stejné umístění ukládá také společná grafická instrukce pro ruční/API sestavovač.

## Klikatelná cesta tvorbou s AI — 8. 10. 2026

Sekce postupu přepracována na čtyři přístupné záložky s číslovanou propojenou cestou, stručným přehledem všech kroků a návody/CTA pod zvoleným krokem. Značka, barvy, zaoblení a typografie navazují na web; mobilní pravidla používají mřížku 2 × 2 bez posouvání. Obsah odpovídá skutečnému ručnímu režimu: formulář → kopírování promptu → ChatGPT s dostupnými nástroji → PDF a tisk. Přiznává chybějící automatickou výrobu a platby, zmiňuje oddělené přiložení fotografie; nezavádí placené AI volání. Sjednocena pouze související odpověď FAQ o dostupnosti.

35 automatických testů prošlo. Nové testy ověřují všechny čtyři kroky, funkční cíle odkazů, vazby aria-selected/tabpanel, jediné aktivní pole, klikání, klávesové šipky, Home/End a roving tabindex. Syntaxe nového JS, odkazy, ID, CSS a PDF prošly; Worker má 49 veřejných souborů. Jde o kontrolu kódu a DOM simulaci, nikoli novou browser QA nebo měření reálné AI výroby. Konfigurátor, vzorové PDF a ilustrace se touto změnou nemění.


## Svislá cesta a rozbalovací bubliny — 8. 10. 2026
35 automatických testů prošlo. Testy nové sekce ověřují čtyři nativní rozbalovací kroky s vlastními odkazy a vysvětlením, pravdivý ruční postup, a v DOM simulaci přepočet křivky po rozbalení a při šířce 320 px. Interakce používá nativní summary (klávesnice i bez JS), respektuje reduced-motion. Obrázky vizuálně prohlédnuty a exportovány s průhledností. Jde o kontrolu kódu a simulaci, nikoli novou vizuální browser QA.
