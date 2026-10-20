# BigMat Catalogo

Catalogo prodotti con frontend React e backend PHP per creare, modificare ed eliminare prodotti. L'upload foto resta predisposto lato API, ma al momento e nascosto dall'interfaccia.

## Avvio locale

```bash
php -S localhost:8000 -t public router.php
```

Apri `http://localhost:8000`.

- Catalogo pubblico: `http://localhost:8000/`
- Backend temporaneo: `http://localhost:8000/admin`

## Struttura

- `public/index.html`: pagina principale React.
- `public/app.jsx`: composizione principale dell'applicazione e stato condiviso.
- `public/components/`: componenti React riutilizzabili.
- `public/pages/`: pagine React standalone.
- `public/hooks/`: hook per logica browser e preview immagini.
- `public/data/`: configurazione frontend e valori iniziali.
- `public/services/`: helper per API e routing frontend.
- `public/styles.css`: stile responsive.
- `public/uploads/`: foto caricate.
- `api/products.php`: API PHP CRUD e upload immagini.
- `data/products.json`: archivio prodotti.

## Note

Il frontend chiama `/api/products.php`; il router incluso inoltra le API PHP e lascia servire gli asset dalla cartella `public`.

## Recensioni Google

La home legge le recensioni da `/api/google-reviews.php`. Configura queste variabili d'ambiente sul server:

- `BIGMAT_GOOGLE_PLACES_API_KEY`: API key Google Maps Platform con Places API abilitata.
- `BIGMAT_GOOGLE_PLACE_ID`: Place ID dell'attivita.
- `BIGMAT_GOOGLE_REVIEWS_CACHE_TTL`: durata cache in secondi, opzionale. Default: `21600`.

L'endpoint salva una cache in `data/google-reviews.json` e mostra solo recensioni a 5 stelle.




INFO SVILUPPO

*TESTO*
 
- Grande: 74 pt // int. 76 pt
- Medio: 40 pt // int. 42 pt
- Piccolo (elenco): 20 pt // int. 30 pt
- Piccolo (brand): 20 pt // int. 24 pt
- Copyright e crediti: 12 pt // int. 14,4
- Minuscolo recensioni: 10 pt




*COLORI*

- Scuro: #58575c
- Chiaro: #f5f2f0
- Blu: #054287
- Rosso: #de1f1f
- Verde: #91c221




*ALTEZZA TESTI*

- Home head: 295,25 px
- Edilizia / Showroom / Noleggio head: 295,774 px
- Chi siamo head: 203,385 px

1 modulo = 15 px

- Altezza inizio “pagina”: 90 px = 6 moduli (gap tra colonne)
- Spazio tra testi medi: 6 moduli
- Spazio tra testi piccoli: 60 px = 4 moduli

Tendenzialmente sono queste le distanze, se in qualche circostanza variano sono riconducibili sempre all’unità di misura. (Es. 1 modulo, 3 moduli, ecc…)




*GRANDEZZA LOGHI*

- Ingombro rettangolo BigMat:  L 88 px / A 51,155 px
- Ingombro rettangolo HabiMat: L 110 px / A 39 px
- Ingombro rettangolo BigRent: L 87,547 px / 50, 987 px

I loghi sono rimpiccioliti equidistantemente di 7,6 px per lato
