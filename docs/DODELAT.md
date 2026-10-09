# Co zbývá dokončit — 9. 10. 2026

Aktuální revize po připojení databáze a administrace: [REVIZE-2026-10-09.md](REVIZE-2026-10-09.md). Supabase, privátní buckety a základní administrace již existují; zbývá napojení výrobního procesu a objednávek.

Vzhled a zadávání jsou připravené. Hlavní mezera je mezi kontrolou zadání a skutečně doručeným zákaznickým PDF. Veřejné texty popisují cílovou službu, ale samy tyto integrace nezajišťují. Níže je pořadí práce; nejde o požadavek na další redesign.

## 1. Skutečná kontrola a poskytovatel AI
Připojit serverový adaptér, tajné klíče, ověřené parametry modelu a verzovaná pravidla poskytovatele. Oddělit technickou podporu, přijatelnost a komerční oprávnění. Nezakazovat známé postavy podle jména a negenerovat placený testovací obrázek před platbou. Hotovo: všechny čtyři kontrolní výsledky fungují se skutečnou službou a změna zadání zneplatní schválení.

## 2. Produkční ukládání a fronta
Zapojit transakční databázi místo lokálního SQLite, dispatcher fronty/outbox a neveřejné úložiště referencí a PDF. Ověřit restart, souběh a duplicity práce. Hotovo: jedna objednávka se nezpracuje nebo neúčtuje dvakrát a zákaznické soubory nejsou veřejné assety.

## 3. Platba a vrácení peněz
Serverově vytvořit checkout až po platné kontrole, napojit vybranou bránu a ověřený webhook, přesnou částku a měnu. Dokončit postup při odmítnutí po platbě: změna zadání nebo skutečný refund. Hotovo: testovací platba i refund odpovídají záznamu brány a platbu nelze potvrdit klientským přepínačem.

## 4. Výroba příběhu, šesti obrázků a PDF
Připojit skutečné textové a obrazové volání k řídícímu promptu 1.6. Doplnit přípravu referencí, kontrolu logiky, návaznosti scén a vizuální kontrolu identity, vybavení a rozmanitosti. Sestavit zákaznické PDF se šesti stranami, českým písmem, barevnými nápovědami, začátkem na první straně a logem vlevo dole na všech stranách. Hotovo: ověřený celý sešit, skutečné náklady a žádné automatické opakování nejistého placeného pokusu.

## 5. Dokončení zákaznické cesty
Napojit pokračování z kontrolního modálu k platbě, průběh objednávky, chybové stavy, obnovení a soukromé stažení PDF. Vývojové kopírování promptu oddělit od produkční zákaznické cesty až při jejím zprovoznění. Hotovo: rodič dokončí vše na webu bez další aplikace a neztratí zadání při opravě chyby.

## 6. Provozní a informační dokončení
Provozovatel, podmínky současného provozu, ochrana osobních údajů a technická cookie lišta jsou doplněny. Před spuštěním prodeje doplnit konkrétní platební a dodací proces a aktualizovat skutečné zpracovatele a dobu uchování. Nastavit mazání schválení, výsledků, osiřelých souborů a záloh. Přidat limity požadavků, rozpočty a monitoring bez osobních údajů dítěte. Hotovo: retenční úlohy skutečně běží, obnova a podpora jsou ověřené. Kontaktní e-mail je již nastavený.

## 7. Finální kontrola a nasazení
Ověřit celý nákup a doručení s řízeným rozpočtem. Udělat skutečnou kontrolu mobilu, klávesnice, dialogů, schránky a čtečky; zde proběhly automatické kontroly, nikoli nové browserové QA. Změřit výkon a zvolit způsob obsluhy veřejných assetů místo vkládání všech souborů do Workeru. Sjednotit produkční doménu, canonical a sitemap; konfigurátor a soukromé výsledky zůstanou noindex. GitHub Pages je statický export a sám serverové generování nespustí. Měření návštěvnosti je volitelné a nesmí obsahovat zákaznické zadání.

