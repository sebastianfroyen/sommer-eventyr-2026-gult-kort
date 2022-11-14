# Frontend Eventyr Template React (Vercel)

Dette prosjektet inneholder en React-template for å enkelt kunne generere nye Frontend Eventyr apper som kan kjøre på plattformen [Vercel](https://vercel.com/).

## Hva inneholder prosjektet?

Selve appen er forsøkt konfigurert med et minimums av oppsett uten for mange opinionerte valg.

Prosjektet inneholder:

- Enkel løsning for sjekk av brukernavn (auth) med Vercel API-funksjoner.
- Grunnleggende outing med `react-router-dom`.
- Noen default-sider for loading og feilsituasjon ved brukernavnsjekk.

Prosjektet benytter seg av følgende biblioteker/teknologier:

- Typescript
- Vite
- React 18
- React Router
- React Query
- Axios

## Kom i gang

**MERK: Kommandoene under benytter NPM, men vil også fungere med Yarn og PNPM**

For å kunne kjøre opp en generert app på Vercel med all funksjonalitet må du sørge for å ha et par ting på plass.

- Du behøver en konto på Vercel.
- Appens prosjekt på Vercel må ha konfigurert miljøvariablene `APP_NUMBER` og `SHARED_API_KEY`.

Klon ned repoet og følg oppskriften under for å starte applikasjonen og verifisere at alt fungerer:

1. Installer avhengigheter med `npm install`.
2. Logg inn på Vercel med kommandoen `npm run vercel:login`.
3. Kjør kommandoen `npm run vercel:dev` i rotkatalogen for å starte appen med Vercel.
4. Gå gjennom flyten i CLI-et for å konfigurere prosjektet på din Vercel konto. Når du har vært gjennom vil dev-serveren i Vite starte opp. Den vil nå antakelig kaste en feilmelding om manglende miljøvariabler.
5. For at autentisering skal fungere må du sette opp noen miljøvariabler for prosjektet. Det kan du gjøre på denne måten:
   - Åpne det aktuelle prosjektet på [Vercel](https://vercel.com/dashboard)
   - Trykk på "Settings" på menyen øverst.
   - Trykk på "Environment Variables" i menyen til venstre.
   - Legg til miljøvariablene `SHARED_API_KEY` og `APP_NUMBER`. Du finner API-nøkkelen og ditt app-nummer i kanalen på Teams.
     <img src="https://user-images.githubusercontent.com/44908461/198880121-8f654164-93f3-46d1-b34c-644cc73ecbee.png" alt="Miljøvariabler" width="700"/>
6. Kjør opp applikasjonen igjen med kommandoen `yarn vercel:dev`. Nå bør applikasjonen starte uten feilmeldinger.

Du skal nå ha appen kjørende på http://localhost:3000.

Opprett en bruker med API-et og angi brukernavnet i URL-en for å bekrefte at innlogging fungerer, eks http://localhost:3000?username=adrian

### ⚠️ Viktig info angående `config/vercel.json`.

I katalogen `config` ligger filen `vercel.json`.

Denne sørger for at den typiske SPA-routingen fungerer som den skal i applikasjonen ved deploy til Vercel. Den vil route alle requests (utenom de som går til API-et) til `index.html` slik at routeren i React kan gjøre det den skal, og sende brukeren til riktig sted. Uten denne vil du oppleve 404-feil ved direktelinking til undersider i applikasjonen din når den kjører på Vercel.

Samtidig kan denne filen skape trøbbel dersom den finnes på rotnivå under utvikling med vercel sin dev-server (bruk av `vercel:dev` kommandoen). Den vil overstyre forespørsler etter ressurser under utvikling, og lede til frustrasjon når man brått får 404-feil på requests mot dev-serveren.

**I prosjektet her er dette løst ved hjelp av pre- og post-hooks på de ulike scriptene, som vil legge til og fjerne filen fra rotkatalogen når de kjøres. Mer spesifikt vil `predeploy` og `prebuild` kopiere den ut i rotkatalogen for bruk på Vercel, mens kommandoen `prevercel:dev` vil slette den fra rot. Dette er gjort for å minske mengden manuelt arbeid underveis, og for å minske sjansen for at man glemmer å kopiere den ut når man raskt må ninjadeploye en siste endring før eventyrstart.**

Den vedlagte `vercel.json` filen skal ellers fungere fint ut av boksen, men det er kjekt å være klar over virkemåten som beskrevet over under utvikling og deploy.

## Start lokal utvikling uten brukernavnsjekk

Dersom du ønsker å omgå brukernavnsjekk ved lokal utvikling kan du starte applikasjonen med kommandoen `dev:noauth` for å deaktivere sjekk.
