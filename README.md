# Arbetsförmedlaren

GitHub repository:

[github.com/Organisk/arbetsformedlaren](https://github.com/Organisk/arbetsformedlaren?utm_source=chatgpt.com)

## Uppdrag

Bygg projektet **Arbetsförmedlaren** från grunden i detta repository.

Repot är i nuläget ett greenfield-projekt utan befintlig implementation. Designa därför arkitekturen, teknikstacken, datamodellen, API-integrationen, frontend och backend utifrån projektmålen nedan.

Det här är ett open-source proof-of-concept, inte en kommersiell produkt.

## Produktidé

Bygg en modern alternativ upplevelse för svenska arbetssökande.

Grundidén är enkel:

> **Sluta be människor leta efter jobb. Låt systemet leta efter jobben åt dem.**

Arbetsförmedlingen publicerar öppna data och API:er som får användas för att bygga digitala tjänster. Platsannonser, yrken och kompetenser finns bland annat tillgängliga som öppna data. Använd därför Arbetsförmedlingens officiella API:er där det är möjligt istället för scraping.

## Viktigt

Innan implementation:

1. Inspektera det befintliga GitHub-repot.
2. Kontrollera om det finns någon befintlig kod, branches, issues eller konfiguration.
3. Om repot är tomt, skapa projektstrukturen från grunden.
4. Undersök aktuella Arbetsförmedlingen-API:er och deras dokumentation.
5. Välj en enkel, modern och kostnadseffektiv teknikstack.
6. Dokumentera arkitekturvalen.
7. Bygg MVP först. Undvik overengineering.

## MVP

Första fungerande versionen ska kunna:

1. Ta emot ett CV.
2. Extrahera kompetenser, erfarenhet, utbildning och yrkesroller.
3. Låta användaren ange sin geografiska position.
4. Låta användaren välja maximal radie.
5. Hämta relevanta platsannonser från Arbetsförmedlingens öppna API.
6. Matcha annonser mot användarens profil.
7. Rangordna annonser efter relevans.
8. Visa varför varje jobb matchar.
9. Spara/ignorera jobb.
10. Visa nya relevanta jobb på dashboarden.

## AI-matchning

Matchningen ska inte baseras enbart på exakta sökord.

Exempel:

En användare med:

`IT Project Manager`

ska kunna matchas mot:

* IT Project Manager
* Technical Project Manager
* Digital Project Manager
* IT-projektledare
* Program Manager
* Delivery Manager
* Product Owner

Matchningen ska väga samman:

* kompetenser
* erfarenhet
* yrkesroll
* senioritet
* utbildning
* språk
* geografiskt avstånd
* arbetsform
* bransch
* krav i jobbannonsen

Visa alltid en begriplig förklaring till matchningen.

Exempel:

> **92 % match**
>
> 8/10 efterfrågade kompetenser matchar.
>
> Relevant projektledningserfarenhet.
>
> Rätt senioritetsnivå.
>
> 14 km från angiven position.
>
> Saknad kompetens: Azure.

Undvik att presentera AI:s matchningsprocent som absolut sanning. Det ska vara ett beslutsstöd.

## Automatisering

Systemet ska kunna köras schemalagt.

Exempel:

```text
07:00
↓
Hämta nya annonser
↓
Deduplicera
↓
Geografiskt filter
↓
Matcha mot användarprofiler
↓
Rangordna
↓
Spara nya matcher
↓
Visa "Nya jobb för dig"
```

Implementera scheduler på ett sätt som enkelt kan bytas mellan exempelvis cron, GitHub Actions eller en extern scheduler.

## CV + AI

Implementera stöd för att användaren frivilligt kan använda en egen OpenAI API-nyckel.

AI-funktionerna ska exempelvis kunna:

* analysera CV
* förbättra formuleringar
* identifiera saknade eller svaga delar
* jämföra CV mot en specifik jobbannons
* föreslå CV-anpassningar
* generera utkast till personligt brev

**AI:n får aldrig hitta på erfarenhet, utbildning, certifieringar eller kompetenser som användaren inte har.**

## Integritet

CV:n innehåller personuppgifter.

Designa därför systemet med privacy-by-design:

* minimera lagring
* undvik onödiga personuppgifter
* kryptera känslig data där det behövs
* lägg aldrig API-nycklar i git
* lägg aldrig API-nycklar i frontend
* logga inte CV-innehåll
* dokumentera hur användardata behandlas

BankID ska inte implementeras i MVP om det inte finns ett konkret tekniskt behov.

## UX

Inspireras av svenska myndigheters tydlighet och igenkänning, men skapa **inte en falsk kopia av Arbetsförmedlingens webbplats**.

Målet är:

> "Så här hade en modern jobbförmedling kunnat fungera."

Dashboarden ska vara extremt enkel.

Exempel:

```text
Nya jobb för dig

12 nya matcher idag

94%  Senior IT Project Manager
     Västerås · 12 km

91%  Technical Project Manager
     Stockholm · Hybrid

87%  Digital Project Manager
     Eskilstuna · 28 km
```

## Arkitektur

Föreslå och dokumentera en lämplig arkitektur innan större implementation.

Separera åtminstone:

* frontend
* backend
* authentication
* user profiles
* CV parsing
* Arbetsförmedlingen API integration
* job normalization
* matching engine
* AI integration
* scheduler
* persistence

Använd tydliga interfaces så att Arbetsförmedlingen-integrationen och AI-leverantören kan bytas ut senare.

## Development approach

Arbeta iterativt:

### Phase 1

Projektstruktur + lokal development environment.

### Phase 2

Arbetsförmedlingen API integration.

### Phase 3

Job model + database.

### Phase 4

CV upload + parsing.

### Phase 5

Basic matching engine.

### Phase 6

Dashboard.

### Phase 7

Scheduled job ingestion.

### Phase 8

AI-enhanced matching.

### Phase 9

CV optimization.

### Phase 10

Testing, security, documentation och deployment.

Efter varje fas ska projektet fortfarande vara körbart.

## Definition of Done – MVP

MVP är klar när en ny användare kan:

1. Öppna webbappen.
2. Ladda upp sitt CV.
3. Ange sin plats.
4. Välja exempelvis 40 km radie.
5. Trycka på "Hitta jobb".
6. Få relevanta jobb från Arbetsförmedlingens API.
7. Se varför varje jobb matchar.
8. Spara eller ignorera jobb.
9. Komma tillbaka nästa dag och se nya relevanta jobb.

## Projektets ton

Projektet får gärna ha humor och en lätt satirisk underton.

Men produkten ska vara genuint användbar.

Poängen är inte att skriva:

> "Arbetsförmedlingen är dålig."

Poängen är att bygga något så pass enkelt och användbart att användaren själv drar slutsatsen:

> **"Varför fungerar inte Arbetsförmedlingen så här?"**
