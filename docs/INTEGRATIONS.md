# Integrace a skutečný stav — 7. 10. 2026

Web není aktivní prodejní systém. Všechny nákladné služby zůstávají odpojené. V testech používáme výslovné fixture adaptéry, žádné placené API ani platby.

## Důvěryhodné hranice

- `preflight.mjs`: lokální validace, kontrola podpisu PNG/JPEG, ověřená technická podpora a rozpočet, oddělené `moderate` a `assessRights`. Vyžaduje záznam kontroly a soukromé uložení schválení. Token je vázaný na přesné údaje, hash fotografie, poskytovatele, pravidla 1.6-prompt-20261008 a model; platnost 15 minut. Žádné testovací obrázky ani blacklisty jmen. Opakované odmítnutí zastaví pouze přesně shodné zadání u stejného poskytovatele, modelu a verze pravidel. Pouhá neověřená oprávnění neblokují schválení; samostatné právní potvrzení tím nevzniká.
- `generation-contract.mjs`: technické parametry z promptu, validace šesti scén, zákaznické vstupy oddělené od instrukcí. Katalog má pevné profily a verzi 2026-10-v3. Produkční reference musí obsahovat pouze buňku zvoleného parťáka; zpracování reference a skutečná vizuální kontrola konzistence patří do adaptéru.
- `order-engine.mjs`: trvalé objednávky, deduplikace schválení/platby/událostí, fronta outbox, omezení souběhu, pětiminutové rezervace práce. Postup story → šest obrázků → PDF. Pokus se zapíše před API voláním. Nejistý, odmítnutý či časově překročený pokus se automaticky neopakuje. Skutečné náklady se zachovají i při překročení rozpočtu. Potvrzení PDF vyžaduje šest ověřených stran. Odhad není záruka ceny poskytovatele.
- `local-store.mjs`: transakční SQLite adaptér pro lokální vývoj, restart a zálohu. Node 22 jej označuje experimental. Není součástí Cloudflare Worker buildu. Pro produkci nahradit podporovaným transakčním adaptérem a otestovat více pracovníků.
- `payment-webhook.mjs`: původní tělo, HMAC SHA-256, časové okno 300 sekund, režim test/live, deduplikace v engine a přesná částka/měna. `resolvePayment` musí ověřit vazbu brány na serverově vytvořenou objednávku, ne důvěřovat zákaznickým parametrům. `confirmRefund` lze volat pouze po skutečně ověřeném vrácení bránou.
- Soukromý výsledek: přístupový token uložen jen jako SHA-256; odmítnutí cizího tokenu, no-store/noindex. Token se předává Authorization Bearer, ne v URL. `GET /api/orders/:id` a `/pdf` mají injektovatelné adaptéry. Bez konfigurace 503. Soukromé soubory nesmějí do `dist/`.

## Konkrétní zbývající připojení

1. Ověřit přesný model gpt-image-2 / medium / 1536×1024 u skutečného poskytovatele, doplnit serverové klíče, pravidla a rozpočet. Neukládat klíče do zdrojů nebo klienta. Soukromé úložiště schválení a referencí; prompt a fotku nesmí obsahovat analytika.
2. Připojit produkční transakční databázi, frontu/outbox dispatcher a privátní objektové úložiště. `execute` musí vracet ověřené náklady, requestId, výstupní klíč a číselné usage; poskytovatelské ceny převádět konzistentně do Kč. Implementovat skutečnou textovou a obrazovou kontrolu a sestavení zákaznického PDF. Lokální ukázkové PDF není generátor zákaznických objednávek.
3. Platební checkout vytvořit serverově až po platné kontrole. Připojit Stripe nebo zvolenou bránu; pro jinou bránu je nutný její podpisový adaptér. Poté napojit skutečné sledování objednávky a doručení výsledku v UI. Aktuální checkout/generate zůstávají 503.
4. Nastavit mazání fotografií a schválení, doručení, výmaz po chybě, periodický job a zálohy. Engine má konfigurovatelnou 30denní expiraci zaznamenaných výstupů; úklid fotografií, osiřelých objektů, záznamů objednávek a retenční cyklus záloh ještě vyžadují produkční implementaci. Jako návrh ověřit odstranění fotografií do 24 hodin od dokončení; dosud to není běžící služba ani zákaznický slib.
5. Zajistit skutečný refund a podporu při odmítnutí, monitoring bez volného zákaznického textu, rate-limit veřejných endpointů, ochranu proti zneužití a obnovu ze zálohy v cílové infrastruktuře. Nejisté placené pokusy řešit podle evidence poskytovatele před jakýmkoli opakováním.
6. Doplnit identitu provozovatele, obchodní podmínky a informace o údajích. Kontakt je petrlavikweb@gmail.com.
7. Připojit měření s odpovídajícím nastavením soukromí. Lokální klientské eventy nic neodesílají. Server má deduplikované purchase/generation_ready/failed/refund. Vyhodnocení skutečného stažení soukromého PDF doplnit s doručením.
8. Před publikováním zkontrolovat limity aktuálního Sites hostingu: současný build stále vkládá statické soubory včetně přibližně 8MB PDF do Worker manifestu. Pro produkci rozhodnout o samostatném veřejném úložišti statických souborů podle možností hostingu. PDF se na hlavní stránce nenačítá, používají se malé WebP náhledy.

Žádný z výše uvedených zbývajících kroků není vydávaný za hotovou produkční integraci. Aktuální náhled je publikován přes Sites se stávajícím publikem; tím se placené služby nepřipojují.

## Prompt 1.6 a doklady vizuální kontroly — 8. 10. 2026

Aktuální celý dokument je spec/Ridici_prompt_6_omalovanek_v1_6.md. Prompty jsou automaticky odvozené při sestavení webu. JSON Schema a validace zachovávají nová pole a ověřují jejich strukturu, odkazy, jednu barevnou frázi, základní odlišnost akcí a kompozic a tři typy záběru. Nejde o sémantické nebo vizuální potvrzení kvality.

Produkční `execute` musí kromě samotného výstupu zajistit skutečnou kontrolu dle sekce 5.1 dokumentu. Doklady jsou důvěryhodné serverové výsledky, nikdy zákaznické checkboxy:

- Obrázek: `visualReview` s odpovídajícím `outputKey`, `passed=true` a pravdivými `matchesText`, `consistentIdentity`, `consistentEquipment`, `worldRules`, `coloringStyle`.
- Celá sada před sazbou PDF: `illustrationsReview` s šesti přesnými jedinečnými `outputKeys`, `passed`, `distinctScenes` a `consistentIdentityAndEquipment`.
- Vyrenderované PDF: `pdfReview` s jeho `outputKey`, `passed`, `sixPages`, `singleTitle`, `visibleContent`, `correctColorPhrases`, `embeddedCzechFont`, `noUnintendedCropping`.

Engine bez dokladů zastaví běh a nepovolí stažení. `verifiedImages` předané dalšímu `execute` obsahují pouze dříve vyhovující obrázky. Adaptér z nich vybere skutečně potřebné reference identity a první vyhovující zobrazení opakované konstrukce. Engine dokládá kontrolu před referencí a doručením; konkrétní vizuální hodnotitel ani zpracování referencí dosud připojené nejsou.

Kontrola musí být provedena nad skutečnými soubory; nesmí se odhadnout z promptu ani nahradit hodnotami true bez kontroly. Nákladové potvrzení a odhad `execute` musí zahrnout veškerá volání a kontroly v dané fázi; produkční adaptér zachová i podrobné doklady jednotlivých účtovaných volání. Výchozí počet oprav je nula. Testy používají výslovné syntetické doklady, neověřují skutečné obrázky.
