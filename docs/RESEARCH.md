# Výzkum a rozhodnutí — 7. 10. 2026

Rešerše veřejných stránek a oficiální dokumentace, nikoli rozhovory se zákazníky. SEO analýza je vstupní doporučení, ne doložená hledanost. Bez provozních dat neuvádíme CPC, konverze ani očekávané výnosy.

## Pozorované nabídky

- [Moje Hravotéka](https://www.mojehravoteka.cz/): veřejná nabídka omalovánek z fotografie a personalizovaných příběhů. Starší tvrzení v podkladu o teprve připravovaných příbězích nepřebíráme.
- [Petra Art](https://www.petra-art.cz/omalovanky/): tematické personalizované materiály se jménem a dalšími aktivitami; rozsah není přímo shodný s naším produktem.
- [Hrdina knížky](https://hrdinaknizky.cz/): jméno a fotografie; fiktivní děti v ukázkách jsou označené. Důsledek: vlastní skutečná ukázka PDF s označením fiktivního dítěte.
- [Příběhovo](https://pribehovo.cz/): opakované příběhy v češtině/slovenštině. Naše jednorázová nabídka musí jasně uvést šest stran a cenu.
- [Wonderbly](https://www.wonderbly.com/personalized-products/where-are-you-book): produktové náhledy personalizované knihy. Důsledek: prolistovat celý náš vzor před vyplňováním.
- [UčiteléUčitelům](https://uciteleucitelum.cz/?page=0): orientace podle vzdělávacího kontextu a tématu. Školkám nabízíme samostatnou cestu s věkem, tiskem a rozsahem licence.

Nejde o systematické cenové srovnání ani doklad úspěšnosti těchto webů.

## Primární a odborné podklady

| Zdroj | Důsledek pro implementaci |
|---|---|
| [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) a [vývojářské základy](https://developers.google.com/search/docs/fundamentals/get-started-developers) | Obsah v počátečním HTML, normální odkazy, canonical, sitemap, skutečné stavové kódy. |
| [Baymard: checkout UX](https://baymard.com/learn/checkout-flow-ux-optimization) a [stav checkout UX](https://baymard.com/research-articles/current-state-of-checkout-ux) | Minimum povinných polí, bez povinného účtu, souhrn a zachování vstupů při návratu. Článek aktualizovaný 25. 11. 2025 není novou studií 2026. |
| [WCAG 2.2: velikost cíle](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Viditelné zaměření klávesnice, popisky a nativní ovládání. Projekt míří na 44px hlavní cíle; malé číselné přepínače mají alespoň 27px a mezery. Nejde o certifikaci přístupnosti. |
| [Core Web Vitals prahy](https://web.dev/articles/defining-core-web-vitals-thresholds) | Cíle LCP 2,5 s, INP 200 ms, CLS 0,1 na p75. WebP náhledy, známé rozměry, odložené ostatní obrázky. Skutečné výsledky zatím nemáme. |
| [ICO: minimalizace dětských údajů](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/8-data-minimisation/) | Návrhový princip: volitelná fotografie, bez dětských údajů v analytice, školní pilot bez fotografií a seznamů dětí. Nejde o právní posudek pro ČR. |
| [Stripe webhooky](https://docs.stripe.com/webhooks) | Ověření podpisu nad původním tělem, časové okno, duplicity událostí a plateb. |
| [Cloudflare Queues](https://developers.cloudflare.com/queues/reference/delivery-guarantees/) | Doručení může nastat vícekrát; trvalý záznam pokusu a idempotence před placeným voláním. |

## Pracovní hypotézy, nikoli persony odvozené z demografie

Rodič nebo pečující hledá aktivitu na odpoledne či malý osobní dárek. Očekává rychle pochopitelný výsledek, dobrý tisk a přiměřenou obtížnost. Možné překážky: nejistý vzhled výsledku, nutnost fotografie, skryté náklady. Proto nejdřív plná ukázka, 80 Kč / šest stran, možnost bez fotky a krátký formulář. Ověřit rozhovory a testem úlohy: rozumí produktu, dokáže prolistovat, zvolit věk a dokončit zadání? Mateřství samo neurčuje věk, rozpočet ani technickou zdatnost.

Učitelka nebo vedení školky může hledat materiál k tématu týdne. Očekává použití ve třídě, srozumitelnou licenci, snadný tisk a doklad. Překážkou je nejasná cena za třídu versus za každé dítě a práce s fotografiemi. Proto oddělený pilot: společný příběh / individuální sešity, bez slibu ceny nebo neomezené licence. Ověřit zájem, požadovaný počet tisků, schvalování a rozpočet skutečnými rozhovory.

Předpoklad pro rok 2027: může růst význam důvěry, jasného původu ukázky a kontroly nákladů AI produktů. Jde o hypotézu, ne prokázaný trend nebo prognózu prodeje. Ověřovat vlastním doručením, refundacemi a příspěvkem po nákladech.

## Vizuální a technická rozhodnutí

Čtrnáct dodaných referencí dětských webů inspirovalo kulatou typografii, klidné světlé plochy, velké ukázky a přehlednou hierarchii. Nekopírujeme jejich značky ani reference. Nunito podporuje českou diakritiku, DM Sans slouží textu. Zelený inkoust a meruňková CTA odlišují hlavní akci; světlá modrá, žlutá a zelená dodávají dětský charakter bez hromady dekorací. Hlavní stránka vysvětluje produkt stručně, podrobnosti jsou dále. Pohyb je pouze jemný CSS pohyb existujících obrázků; nejsou přidaná těžká videa.

Porovnána současná HTML/JS + Worker sestava s [Astro na Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) a [oficiálním průvodcem Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/). Astro nabízí SSG/SSR a komponenty, ale malý web nepotřebuje migraci a nové závislosti jen pro předrenderování. Zachováváme stack, přidáváme jednoduchý generátor stránek. Nevýhoda: komponenty a serverové adaptéry udržujeme sami. Node SQLite je lokální testovací adaptér, nikoli produkční Cloudflare databáze.

## Měření a obchodní další kroky

Události klienta jsou zatím lokální hook bez sítě. Nákup se má měřit pouze po ověřeném webhooku, deduplikovaně; dokončení pouze po šesti ověřených stranách. Oddělit rodiče/školky a zdroje direct/organic/paid_search/social/partner/other bez volného zákaznického textu.

`server/metrics.mjs`: příspěvek = čistý výnos − API − platební poplatky − refundace − podpora; po akvizici odečíst skutečné náklady získání. Příspěvek na návštěvníka a CAC se při nulovém jmenovateli neodhadují. Nezaměňovat cenu 80 Kč za čistý výnos. Další pořadí: připojit a ověřit jednu doručenou objednávku, změřit náklad celého sešitu, ověřit mobilní cestu se skutečnými lidmi, dokončit školní licenci a pilot; až poté vyhodnotit akvizici.
