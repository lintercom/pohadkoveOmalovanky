# Aktuální kontext projektu — 8. 10. 2026

Český web Pohádkové omalovánky, existující Sites projekt appgprj_6ac4da78b5e881919f56ce3684a83c9f. Aktualizace se zveřejňují přes Sites se stávajícím soukromým publikem. Repo GitHub: lintercom/pohadkoveOmalovanky. GitHub Pages má samostatný statický export; aktualizace Sites sama neznamená nové nasazení GitHub Pages.

## Produkt a současný web

Šest českých stran, šest černobílých ilustrací, věk 3–9, 80 Kč z centrální konfigurace, volitelná fotografie. Zachovat současný grafický styl, rozestupy, barvy, zaoblení a typografii. Hlavní stránka obsahuje kompletní šestistránkový vzor s PDF a listováním. Používané ilustrace a podklady vzoru zůstávají zachované.

Vzor se nyní prohlíží výhradně v modálním okně otevřeném kliknutím na hero obrázek nebo odkaz Vzor pohádkové omalovánky. Původní samostatná ukázková sekce pod kroky je odstraněna. Modal obsahuje šest stran, šipky, přímý výběr stránky a PDF; staré odkazy /#ukazka jej také otevřou. Nativní dialog drží focus, zavírá se Escape, tlačítkem či kliknutím na pozadí a vrací focus na skutečný spouštěč. Bez JavaScriptu zůstává u hero obrázku přímý PDF odkaz.

Sekce #jak-to-funguje nahrazuje staré tři stručné kroky čtyřmi klikacími záložkami: zadání u nás → kopírování promptu → AI tvorba v ChatGPT → tisk doma. Pod zvoleným krokem je krátký návod a funkční odkaz; ukázka otevírá stávající modal. Výslovně odlišuje bezplatnou přípravu zadání od externí tvorby a nepřipojené automatické výroby/plateb. Nenaznačovat, že tento web už sám generuje. journey.js obsluhuje přístupné záložky a klávesnici; bez JS jsou návody všechny viditelné. FAQ o dostupnosti odpovídá ručnímu režimu.

Konfigurátor je na /vytvorit/, všechna pole na jedné stránce, nic předvybraného. Vlastní parťák a svět jsou první volby; parťák může také chybět. Formulář není v modálu. Modál následuje po validaci, drží zadání a umožňuje zobrazit a kopírovat samostatný prompt pro ChatGPT. Fotografie se přikládá zvlášť. Konfigurátor je noindex. Nevracet starý průvodce ani výběrové karty na homepage.

Katalog má sedmnáct originálních parťáků ve verzi 2026-10-v3. Každý připravený svět nabízí nejméně čtyři vhodné postavy; kouzelný les zachovává pět. Pořadí je svět → parťák a parťáci se zobrazí až po výběru světa. Kontrola rozlišuje technickou podporu, pravidla poskytovatele a komerční oprávnění. Bez blacklistu jmen, tiché náhrady postav či placených zkušebních obrázků. Změna parametrů ruší předchozí schválení. Revize pravidel 1.6-prompt-20261008 zneplatňuje starší tokeny. Pouhá neověřená oprávnění sama schválení neblokují a schválení je nepotvrzuje. Pouze přesné opakovaně odmítnuté zadání se shodným otiskem, poskytovatelem, modelem a verzí pravidel se znovu nespouští; nikdy nevzniká zákaz jména.

## Jediný aktuální zdroj promptu

spec/Ridici_prompt_6_omalovanek_v1_6.md je úplný nový dokument dodaný uživatelem, beze změny jeho obsahu. Nahrazuje původní verzi i samostatné dodatky dramaturgie a rozmanitosti. scripts/build-prompts.mjs z něj při build-pages odvozuje server/prompts.mjs; nic neupravovat ručně v generovaných kopiích. shared/story-brief.mjs je jediný sestavovač pro náhled, kopírování a API.

Novější požadavek na vzhled sešitu doplňuje spec/pdf-design.json: dvouřádkové logo Pohádkové omalovánky v Nunito Black s barevným podtržením je právě jednou v levém dolním rohu každé ze šesti stran. V záhlaví první strany logo není; zůstává vlevo zarovnaný název s označením Tady začíná pohádka. Číslování je vpravo dole. make-sample.py z něj sází šestistránkový vzor a skutečné náhledy PDF; build-prompts.mjs ze stejných dat vytváří samostatný PDF_DESIGN_PROMPT pro společný ruční/API sestavovač. Původní dokument 1.6 i obrazové instrukce zůstávají beze změny, barevná značka je mimo černobílé ilustrace. Písmo a jeho OFL licence jsou v spec/fonts/.

API dostává celý přesný hlavní prompt a produkční režim. Ruční kopie má výslovný EXECUTION_MODE=manual_preview, nezaměňuje ho za schválení nebo platbu, před obrázky ověřuje dostupné nástroje a přesné nastavení. Zákaznický JSON produkční výjimku nemůže aktivovat. Neobvyklé kombinace se smysluplně interpretují, identita zůstává stejná.

Výstup 1.6 zahrnuje world_rules_cs, invariant_features_en, allowed_state_changes_cs, scene_plan, character_states a object_states. server/story-schema.mjs je JSON Schema a strukturální validátor; product.mjs kontroluje odkazy, délky, barvy a základní rozmanitost. Kontrola řetězců nepotvrzuje skutečnou vizuální odlišnost. Obrazové vstupy obsahují pravidla světa a pouze přítomné postavy, předměty a stavy. Model/medium/1536x1024/n=1 jsou stále pevné parametry, nejvýše jeden pokus na scénu.

## Stav integrací a ověření

Skutečný poskytovatel, platby a automatický vizuální hodnotitel nejsou připojeni. Web to přiznává; produkční akce jsou bez konfigurace zavřené. order-engine vyžaduje důvěryhodné doklady kontroly každého skutečného obrázku, celé sady a vyrenderovaného PDF. Bez nich nenabídne stažení a vadný obrázek nepředá jako ověřenou referenci. Kontrolu a všechny její případné náklady musí skutečně zajistit produkční adaptér; testy používají fixture doklady, žádné placené API.

31 testů pokrývá propagaci přesného promptu, ruční/produkční režim, novou strukturu a obrazové vstupy, kontroly a zastavení bez dalšího pokusu i nabídku alespoň čtyř parťáků v každém světě. Nejde o měření kvality obrázků ani nákladů reálné výroby. Browser QA byla dříve blokována politikou; neobcházet a nepředstírat ji.

Nepoužívané staré šablony, duplicitní sample-page, globální catalog-data, neodkazované staré náhledy a místní QA/log artefakty byly odstraněny. Zachovat zdroje, testy, používané ilustrace, PDF a Git historii. Neuklízet cizí projekt ani vnořené .git exportu pages-dist.

Kontakt je petrlavikweb@gmail.com. Identita provozovatele a obchodní podmínky stále chybí. Nejsou naměřené konverze, hledanost, CWV ani skutečné výrobní náklady. Podrobnosti integrací: INTEGRATIONS.md, historie ověření: VALIDATION.md.


## Svislá pohádková cesta — 8. 10. 2026
Aktuální sekce Jak to funguje nahrazuje záložky čtyřmi nativními details/summary bublinami podél jemně klikaté linky. Vysvětlení a CTA jsou uvnitř konkrétního kroku; více kroků lze otevřít současně i bez JS. journey.js pouze přizpůsobuje dekorativní křivku změnám velikosti, fontů a rozbalení. Mobil používá jeden sloupec s malým střídavým odsazením. Dvě nové transparentní ilustrace v assets/journey; záznam generování v docs/JOURNEY_ART.md. Skutečný ruční postup i ostatní části webu zachovány.


## Výzva před otázkami — 8. 10. 2026
Homepage nyní řadí výzvu Další hrdina? Ten váš. mezi svislou cestu a časté otázky. CTA odkazuje na /vytvorit/. Karta používá původní teplou žlutou, zaoblení a typografii; nová omalovánková scéna chlapečka s liškou Lisou je v assets/invitation/boy-and-lisa.webp. Dva sloupce na desktopu a tabletu, jeden pod 520 px. Podklady ilustrace v docs/INVITATION_ART.md.


## Zkrácení homepage — 8. 10. 2026
Na přání uživatele odstraněny hero štítky věku/PDF, hero textový odkaz na vzor, eyebrow a nápověda cesty, čtyři štítky místa u kroků a odstavec pod cestou o ruční tvorbě. Funkční náhled z hero obrázku a odkaz pod cestou zachovány. FAQ eyebrow nyní CO BY VÁS JEŠTĚ MOHLO ZAJÍMAT ..... .


## Jemné čmáranicové pozadí — 8. 10. 2026
Sdílené béžové pozadí všech stránek doplňuje transparentní vzor assets/background/story-doodles-v1.webp inspirovaný referencí uživatele. Dekorativní body::before je za obsahem, nebere vstup a neovlivňuje rozměry. Dvě měkké opakované radiální masky nechávají motivy lokálně vystupovat u okrajů a mizet směrem do stránky. Na mobilu menší a slabší, v tisku vypnuté. Karty a dialogy zachovávají neprůhledný podklad. Záznam obrázku v docs/BACKGROUND_ART.md.
