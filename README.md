# Zehner-City

Ein Rechenspiel für Kinder in der 1. und 2. Klasse, gemacht für das iPad (läuft aber in jedem Browser).

**Spielen:** https://temmuz.github.io/zehner-city/

Kurze Missionen in einer Spielstadt üben das Rechnen über die 10, so wie es in der Schule gelernt wird. Jede Aufgabe spielt in einer kleinen 3D-Welt: Eine Kiste ist 1, ein voller Laster ist 10 (zwei Reihen mit je fünf Kisten, wie im Zehnerfeld). Mit den verdienten Münzen kauft man Fahrzeuge für die eigene Garage.

## Was geübt wird

- **Verliebte Zahlen (Herzhafen):** Zahlenpaare, die zusammen 10 ergeben (3 + 7, 4 + 6 …)
- **Plus über die 10 (Zehnerbrücke):** erst bis zur 10, dann weiter: 8 + 9 = 8 + 2 + 7 = 17
- **Minus über die 10 (Zehnertunnel):** erst zurück bis zur 10, dann weiter: 13 − 8 = 13 − 3 − 5 = 5
- **Aufgabenfamilien (Lieferviertel):** Tausch- und Umkehraufgaben (5 + 2 = 7, 2 + 5 = 7, 7 − 2 = 5, 7 − 5 = 2)
- **Analogieaufgaben (Hochhausviertel):** 4 + 5 = 9, also 14 + 5 = 19: ein voller Laster mehr
- **Zahlenraum bis 100 (Güterbahnhof 100):** volle Laster als Zehner, 30 + 40 = 70, 38 + 5 = 38 + 2 + 3 = 43

## So wird gespielt

1. **Kisten laden (Mission 1):** Das Kind lädt die Kisten selbst auf zwei Laster mit je 10 Plätzen (Zwanzigerfeld). Laster 1 muss erst voll sein, dann kommt der Rest auf Laster 2. So entdeckt es die Zerlegung selbst. Danach wird der Rechenweg aufgeschrieben: 8 + 5 = 8 + 2 + 3 = 13. Bei Minus wird abgeladen: erst Laster 2 leer machen.
2. **Rechenweg selbst (Mission 2):** Der Rechenweg wird wie in der Schule eingetragen.
3. **Profi (Mission 3):** Im Kopf rechnen, der Tipp zeigt den Rechenweg.

Hinweise führen Schritt für Schritt durch den Rechenweg. Es gibt keine Zeitlimits.

## Für Eltern

- Beim ersten Start fragt das Spiel nach dem Vornamen des Kindes. Der Name lässt sich im Eltern-Bereich (Schloss-Symbol oben rechts) ändern.
- Im Eltern-Bereich stehen die Übungszeit der letzten 7 Tage und die Aufgaben, die noch schwerfallen. Diese Aufgaben kommen in den Missionen öfter dran.
- **Tipp fürs iPad:** In Safari auf „Teilen“ und dann „Zum Home-Bildschirm“ tippen. Dann öffnet sich das Spiel wie eine App und der Spielstand bleibt zuverlässig erhalten.

## Datenschutz

Alles bleibt auf dem Gerät: Name, Münzen und Fortschritt werden nur im Browser des Geräts gespeichert. Es gibt kein Konto, keine Werbung und kein Tracking. Nur die Schriftarten (Oswald, Lexend) werden von Google Fonts geladen.

## Technik

- `index.html`, `css/app.css`, `js/app.js`: das Spiel
- `js/world3d.js`: die 3D-Welten (Three.js r160, wird nur bei Bedarf geladen)
- `assets/models/`: 3D-Modelle von [Kenney](https://kenney.nl) (CC0, gemeinfrei), siehe `assets/models/LICENSE-Kenney.txt`

Ohne 3D (z. B. offline oder ohne WebGL) zeigt das Spiel die Laster als 2D-Bilder.
