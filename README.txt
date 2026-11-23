DOOMSDAY VAULT
==============

How to open
-----------
Double-click index.html, or drag it into Chrome, Edge, Firefox or Safari.
No server, install or build step is needed.

Files
-----
index.html       Page structure: sign-in vault, archive, detail view
css/styles.css   All colors, fonts, layout and comic styling
js/data.js       Film list (plus the Loki series), cover titles, franchise colors,
                 chapters. SERIES marks Disney+ shows and the Essential badge
assets/          Cursor images (Doom gauntlet, Iron Man glove) and the Doom mask
                 used in the finale and over posters of watched films
                 (replace doom-mask.png to change it)
js/app.js        Interaction: sign-in vault, green smoke, order toggle, filters,
                 detail view, watched list, countdown
js/posters.js    Shows each film's poster from the posters folder
js/cursor.js     Custom cursor: Iron Man glove on sign-in that turns into Doom's
                 gauntlet (RDJ plays both); the glove returns over RDJ's films

Notes
-----
- Posters: posters/ holds one poster per film, named by poster id (see POSTERS
  in js/data.js), e.g. posters/iron-man-2008.jpg. To swap one, replace the file
  with the same name. A missing image falls back to the designed comic cover.
  Poster images were sourced via TMDB (themoviedb.org).
- An internet connection loads the comic fonts (Bangers and Barlow) from
  Google Fonts. Offline, the page still works with fallback fonts.
- Your codename and watched list are saved in the browser (localStorage).
- The sign-in is for show only. Passcodes are never saved or checked.
  "Lock the vault" in the header takes you back to the vault.
- Movie posters are copyrighted by their studios. Credit them in your project.
- Unofficial fan-made project, not affiliated with Marvel, Disney or
  20th Century Studios.
