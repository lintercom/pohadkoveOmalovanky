# Pohádkové omalovánky

Český web pro personalizovaný příběh se šesti omalovánkami. Běží jako Sites web; platby a placená AI výroba zatím nejsou připojené. Konfigurátor na `/vytvorit/` umožňuje bez platby sestavit a zkopírovat úplné zadání pro ruční vytvoření sešitu v ChatGPT.

## Spuštění a ověření

Node 22+, bez instalace balíčků:

```sh
npm run build
npm run check
npm start
```

Lokální náhled: http://127.0.0.1:4173. Build sestaví aktuální prompty, HTML stránky a Worker. Kontroly ověřují odkazy, assety a 30 scénářů bez placených API.

## Zdroj řídícího promptu

Jediný aktuální dokument je [Ridici_prompt_6_omalovanek_v1_6.md](spec/Ridici_prompt_6_omalovanek_v1_6.md), přesná kopie dodaná uživatelem. `scripts/build-prompts.mjs` z něj sestaví `server/prompts.mjs`; generované kopie neupravovat ručně. `shared/story-brief.mjs` vytváří zadání pro náhled, schránku i budoucí API. Kopírovaný prompt obsahuje výslovný ruční režim, produkce zachovává serverové schválení a ověření platby. Fotografie se v ChatGPT přikládá samostatně.

Verze 1.6 obsahuje pravidla světa, plán šesti odlišných scén, invarianty konstrukce a stavy postav a vybavení. JSON Schema a serverová validace jsou v `server/story-schema.mjs` a `server/product.mjs`. Obrazové vstupy předávají relevantní pravidla a stavy bez celého zákaznického formuláře. Pevné požadované nastavení: gpt-image-2, medium, 1536×1024, n=1, jeden pokus na scénu. Jeho dostupnost musí ověřit skutečný poskytovatel; úprava promptu sama nic negeneruje.

## Struktura a provoz

- `content/`, `scripts/build-pages.mjs`: zdroje stránek, metadata a konfigurátor.
- `dist/configurator.mjs`, `dist/app.js`, `dist/site.js`, CSS a assety: klient; `dist/runtime/` je generovaný veřejný runtime.
- `server/`, `shared/`: validace, předběžná kontrola, zadání, připravený objednávkový proces a Worker.
- `spec/sample-story.json`, `spec/sample-images/`, `make-sample.py`: zdroje kompletního veřejného vzoru. Je to hotová statická ukázka, nikoli automatický generátor zákaznických objednávek.
- `tests/`: testy a explicitní syntetické fixture adaptéry, bez placených API.

Serverový základ zaznamenává pokusy a náklady, zastaví chybu bez automatického opakování a vyžaduje doklady skutečné vizuální kontroly obrázků, celé sady i PDF před doručením. Samotný textový plán ready není hotový produkt. Vizuální kontrolu musí zajistit připojený adaptér nebo obsluha; dosud nejde o běžící automatický hodnotitel.

Existující soukromý web se aktualizuje přes Sites. `scripts/build-github-pages.mjs` připraví samostatný statický export pro `/pohadkoveOmalovanky/`; nasazení GitHub Pages je oddělený krok. Git metadata tohoto exportu se při úklidu nemažou.

Zachovaný vzhled: Nunito / DM Sans, jemné dětské barvy, zaoblené karty a decentní animace s reduced-motion. Homepage nabízí všech šest stran vzoru a PDF. Sedmnáct originálních parťáků, vlastní parťák i svět a varianta bez parťáka jsou v samostatném konfigurátoru. Předběžná kontrola neslibuje úspěch generování ani komerční oprávnění.

Podrobnosti: [kontext](docs/PROJECT_CONTEXT.md), [konfigurátor](docs/CONFIGURATOR.md), [integrace](docs/INTEGRATIONS.md), [ověření](docs/VALIDATION.md), [výzkum](docs/RESEARCH.md). Provozovatel a obchodní podmínky před prodejem stále potřebují doplnění. Kontakt: petrlavikweb@gmail.com.
