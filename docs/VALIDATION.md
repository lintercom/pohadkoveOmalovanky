# Revize a ověření — 9. 10. 2026

Rozsah: zdroje stránek, klientské skripty a styly, serverový základ, prompty, testy, sestavovací skripty, dokumentace a reference veřejných assetů. Odvozené runtime soubory a statický export se znovu sestavují; Git metadata se nemažou.

Odstraněno 377 nepoužívaných CSS selektorů z předchozích sekcí a modálního průvodce. Tři CSS soubory zmenšeny celkem o 23 084 bajtů. Aktivní selektory, dynamické třídy klienta a globální styly zachovány. Odstraněna nepoužívaná šablona veřejného katalogu a neúčinné historické přepisy exportu. Název značky v článcích sjednocen.

Odstraněno devět neodkazovaných okrajových scén a čtyři související dokumenty. Aktuální HTML, CSS ani klient tyto soubory nepoužívaly již před úklidem. Používané čmáranicové pozadí, ilustrace cesty, výzvy, světy, všech 17 parťáků, šest náhledů PDF a tiskové zdroje jsou zachovány. Dokumentace nahrazuje rozporuplnou historii aktuálním stavem a prioritami.

Ověření: build, kontrola odkazů a ID všech 10 HTML stránek, existence assetů v CSS, syntaxe klientských i serverových modulů; všech 35 testů prošlo. Pokrývají konfigurátor, prompt, dramaturgii, kontroly, objednávky, platební webhooky, úložiště, veřejný vzor a cestu. Testy používají explicitní adaptéry, žádné placené API.

Nejde o novou vizuální kontrolu v prohlížeči, měření výkonu ani test skutečné platby či generátoru. Prohlížečová inspekce byla v této konverzaci dříve blokována; omezení nebylo obcházeno. Produkční integrace zůstávají odpojené a jejich dokončení je popsáno v DODELAT.md.
