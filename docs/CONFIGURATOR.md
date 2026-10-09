# Konfigurátor — 8. 10. 2026

Implementace v existujícím projektu, bez změny grafické identity. `/vytvorit/` je samostatná stránka s noindex v HTML i HTTP hlavičce a není v sitemap. Homepage ponechává produktovou ukázku; všechny tvorbové CTA jsou běžné odkazy do konfigurátoru. Výběrové ilustrace jsou jen tam.

## Chování

Pět sekcí pod sebou: dítě → svět → vhodní parťáci → přání → živé shrnutí. Žádný vícekrokový formulář. Věk i obě skupiny začínají bez výběru; vlastní možnost je první, bez parťáka je dostupná ve stejné skupině. Používáme nativní radio inputy ve fieldset/legend, focus rámeček, označení zaškrtnutím a okrajem. Mobilní mřížka má dva sloupce, žádný vodorovný posuvník.

Vlastní texty zůstávají v polích při přepnutí. `activeInput()` je vyřadí ze skutečného zadání, když nejsou aktivní. Fotografii lze odstranit; bez ní zůstává dřívější požadavek na krátký popis vzhledu. Údaje jsou v paměti stránky, ne v URL, localStorage či analytice.

Lokální validace označí pole a přesune na první chybu. Poté se otevře jediný kontrolní modál. Nejprve ověří nepřítomnost/dostupnost serverové kontroly bez odesílání osobních údajů. Aktuální server nemá poskytovatele zapojeného: zobrazuje výslovně jen lokální validaci, bez slibu přijetí. Připravené větve clear/clarify/unsupported/uncertain, návrat na pole, opakování, abort při zavření, invalidace po změně, focus návrat. Platební tlačítko je dostupné pouze s ověřeným serverovým schválením a výslovně zapnutým checkoutem; skutečný checkout nadále není připojený.

## Prompt

`shared/story-brief.mjs` je jediný sestavovač pro zobrazení, kopírování i budoucí API. Výrobní pravidla přebírá z aktuálních STORY_PROMPT / IMAGE_PROMPT. Pro ruční použití vynechá serverovou schvalovací bránu a JSON-only výstupní schéma, které by jinak bránily samostatnému použití; obsahová a obrazová pravidla zachová. Připojí kompletní sazbu PDF a aktivní zákaznická data v odděleném JSON. Serverový API adaptér zachovává schválení a ověřenou platbu jako podmínku.

Prompt obsahuje stabilní vizuální popis katalogového parťáka bez interních ID a odkazů na obrázky. Neobsahuje klíče, platební údaje, lokální cesty, blob URL ani obrazová data. Vybraná fotografie přidá referenční instrukci a v modálu upozornění na samostatné přiložení v ChatGPT. Preview textarea a clipboard používají stejný aktuální výsledek. Při nedostupné schránce lze označit celý text a kopírovat ručně. Samotné sestavení nebo kopírování nevolá AI API.

## Ověření a meze

Aktuální ověření a jeho omezení jsou v VALIDATION.md. Po výběru světa se zobrazí doporučení parťáci; každý připravený svět má alespoň čtyři originální možnosti.

Kontrolní stavy serveru jsou ověřené automaticky přes testovací adaptéry. Neproběhla plná interakční prohlížečová kontrola mobilu, klávesnice a schránky: místní browserová inspekce byla v tomto chatu dříve blokovaná. Responzivní CSS, nativní radio/dialog, focus a fallback jsou implementované a zkontrolované v kódu; neoznačujeme to za browserový nebo čtečkový test.

Skutečný poskytovatel kontroly, platba a placené generování stále nejsou připojené. Tato verze umožňuje kompletní zadání a ruční použití v ChatGPT. Hostovaný náhled zachovává stávající soukromé publikum.
