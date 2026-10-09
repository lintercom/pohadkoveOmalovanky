# Supabase — první propojení, 9. 10. 2026

Projekt pohadkoveOmalovanky: dboxrlvmgxfuzllhrcwe, organizace printcore, Frankfurt, Free.

Vzdálená migrace story_backend_foundation zakládá story_checks (audit bez osobních údajů), story_approvals (dočasné schválení a zadání), story_orders (objednávky) a story_attempts (jednotlivé výrobní pokusy a náklady). Její SQL je zachováno v spec/supabase-foundation.sql; nespouštět znovu bez kontroly historie migrací.

Všechny tabulky mají RLS, anon/authenticated nemají oprávnění. Přístup má pouze serverový service_role. Tři privátní buckety: child-photos (JPEG/PNG, 10 MB), story-images (PNG/JPEG/WebP, 10 MB), story-pdfs (PDF, 50 MB). Zákaznická oprávnění zatím nejsou zapojená. Správce má pouze ověřený serverový přístup; samotné přihlášení soubory nezpřístupňuje.

server/supabase-backend.mjs poskytuje recordCheck/saveApproval/loadApproval pro současný preflight a putPrivate/getPrivate pro soukromé soubory. Server při inicializaci vytvoří createSupabaseBackend z SUPABASE_URL a SUPABASE_SECRET_KEY. Persistence se doplní do skutečně nakonfigurovaných preflight services, storage do order services. Vzor .env.example neobsahuje klíč; skutečné .env je ignorované Gitem. Klíč nikdy nepředávat do dist, klienta, analytiky ani URL.

Lokální web a GitHub Pages volají společné API https://dboxrlvmgxfuzllhrcwe.supabase.co/functions/v1/story-api. V dist/api-client.mjs je jen veřejný publishable klíč; serverové klíče čte funkce z prostředí Supabase. Není potřeba Hostinger ani VPS. Funkce je nasazená přes MCP; její zdroj je supabase/functions/story-api/index.ts a server/edge-api.mjs. Při změně těchto souborů je nutné funkci znovu nasadit se všemi relativními závislostmi. Funkce ověřuje publishable klíč sama (verify_jwt=false); jde o veřejný formulář, nikoli přihlášení zákazníka či administrátora. CORS dovoluje přesně localhost/127.0.0.1:4173, lintercom.github.io a současnou adresu Sites. Sdílený rozpočet omezuje kontroly na 30/minutu a 300/den (UTC v databázi). Veřejný klíč ani CORS nejsou soukromá autorizace; endpoint nesmí vydávat soukromé soubory nebo spouštět placené služby. Produkční ochrana proti zneužití může vyžadovat další opatření.

GET readiness ověřuje přístup k databázi. POST preflight skutečně validuje formulář a formát fotografie a zapisuje audit bez osobních údajů. Neukládá zadání ani fotografii, nespouští AI, nevydává approval a neumožňuje checkout. Neověřená AI dostupnost zůstává uncertain. GitHub Pages export už nevkládá staticPreview, které dříve celé API vypínalo.

Order engine má nyní synchronní transakční rozhraní SQLite; pro Postgres je nutná asynchronní transakční implementace a atomicita rezervací/fronty. Tabulky objednávek nejsou vydávány za hotový adaptér engine. Administrace a přihlášení správce jsou připojené přes Supabase Auth. Mazání souborů, produkční fronta, platby a AI zatím připojené nejsou.

Ověření: vzdálené tabulky/buckety, oprávnění a RLS; lokální testy adaptéru a Edge API; živý readiness a preflight s výhradně fiktivním zadáním a následné ověření skutečně zapsaného auditního záznamu SQL. Neproběhl upload skutečné fotografie ani placené generování. Kontrola databáze sama nepotvrzuje přijatelnost u AI poskytovatele.

Migrace restrict_rls_trigger_execution odebrala veřejné EXECUTE automaticky vytvořené SECURITY DEFINER funkci rls_auto_enable; SQL v spec/supabase-restrict-trigger.sql. Informativní nález „RLS Enabled No Policy“ je záměrný: tabulky jsou nyní pouze pro server a nemají zákaznické/admin politiky. Nesprávně široká politika se kvůli odstranění tohoto upozornění nezakládá.

## Administrace

Cesta /administrace/ (na Pages /pohadkoveOmalovanky/administrace/) má noindex a odkaz zámečkem v patičce. Přihlášení admin mapuje na provozní e-mail; heslo není součástí zdrojů. Session existuje jen v paměti prohlížeče, po obnovení stránky je nutné přihlášení. Auth ověřuje token, server následně ověřuje zapnuté členství v story_admins i existenci auth.sessions. Globální odhlášení tedy zneplatní i stále časově platný JWT pro naše admin API.

Migrace jsou v spec/supabase-administration.sql a spec/supabase-admin-session.sql. Přehled, filtrování a stránkování objednávek a kontrol, interní poznámky a privátní PDF používají serverové API. Nastavení ukládá skutečné globální limity kontrol. Cena a obsah se zobrazují ze společných zdrojů; jejich editace z administrace není zapojená. Přihlášený uživatel bez role nemá přímý přístup k tabulkám ani bucketům. Administrace nevytváří objednávky nebo platby a nespouští AI. Prázdné objednávky odpovídají současnému stavu služby.

