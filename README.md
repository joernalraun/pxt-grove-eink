# Grove Triple Color E-Ink Display 1.54" für Calliope mini

MakeCode-Erweiterung für das **Seeed Grove – Triple Color E-Ink Display 1.54"**
(152 × 152 Pixel, schwarz / weiß / rot, Panel GDEW0154Z17).

Das Grove-Modul hat einen eigenen Controller. Der Calliope mini schickt ihm das
fertige Bild über die serielle Schnittstelle (UART, 230400 Baud). Die
Erweiterung basiert auf dem Arduino-Beispiel von Seeed Studio.

## Anschluss

Das Display am **Grove-Anschluss A1** des Calliope mini 3 einstecken
(Pins C16 = RX, C17 = TX). Bleibt das Display leer, im Block
„E-Ink Display verbinden“ TX und RX tauschen.

> Hinweis: Durch das Verbinden wird die serielle Schnittstelle vom USB auf
> das Display umgeleitet. `serial`-Ausgaben am PC gehen dann nicht mehr.

## So funktioniert es

1. **verbinden** – einmal beim Start.
2. **zeichnen** – Text, Linien, Rechtecke, Kreise, LED-Bilder.
   Das passiert nur im Speicher des Calliope mini, auf dem Display ändert sich noch nichts.
3. **Anzeige aktualisieren** – überträgt das Bild. Das dauert ca. 8 s,
   danach flackert das Display ein paar Sekunden, bis das Bild steht.

⚠️ Laut Hersteller sollten zwischen zwei Aktualisierungen **mindestens 180 Sekunden**
liegen, sonst können Geisterbilder zurückbleiben. Das Bild bleibt auch ohne Strom stehen.

## Beispiel

```blocks
eInk.init(SerialPin.C17, SerialPin.C16)
eInk.clear(EInkColor.White)
eInk.drawRect(0, 0, 152, 28, EInkColor.Red, true)
eInk.showText("Calliope", 28, 7, 2, EInkColor.White)
eInk.showText("Temperatur:", 8, 50, 1, EInkColor.Black)
eInk.showNumber(input.temperature(), 8, 65, 4, EInkColor.Black)
eInk.showText("°C", 70, 65, 4, EInkColor.Red)
eInk.update()
```

## Blöcke

| Block | Beschreibung |
|---|---|
| E-Ink Display verbinden TX … RX … | serielle Verbindung herstellen |
| Anzeige aktualisieren | Bildspeicher zum Display schicken |
| fülle Bildschirm mit … | alles weiß, schwarz oder rot |
| zeichne Pixel / Linie / Rechteck / Kreis | Grafik, Koordinaten 0…151 |
| zeichne Bild … Größe … | 5×5-LED-Bild vergrößert zeichnen |
| setze Schrift auf … | Standard 5×7, Roboto 12/16/24/32 px oder Roboto Mono 12/16/24 px |
| schreibe Text / Zahl … Größe … | Text in der gewählten Schrift, Umbruch am Wortende, `\n` = neue Zeile, Umlaute und ° werden unterstützt |
| Breite von Text | Textbreite in Pixeln, z. B. zum Zentrieren |
| Zeilenhöhe | Höhe einer Textzeile in der aktuellen Schrift |
| zeichne Grafik … Größe … | eigenes Bild (Logo, Foto …) aus dem Bild-Konverter |
| *Mehr:* letzte Aktualisierung erfolgreich | `wahr`, wenn das Display geantwortet hat |
| *Mehr:* Farbe von Pixel | Farbe im Bildspeicher abfragen |

## Schriften

| Schrift | Zeilenhöhe | Hinweis |
|---|---|---|
| Standard 5×7 | 8 px | Voreinstellung, lässt sich gut mit „Größe“ vergrößern |
| Roboto 12 / 16 / 24 / 32 px | 16 / 20 / 27 / 37 px | proportional, am besten mit Größe 1 |
| Roboto Mono 12 / 16 / 24 px | 16 / 19 / 28 px | alle Zeichen gleich breit, gut für Zahlen und Tabellen |

```typescript
eInk.setFont(EInkFont.Roboto24)
eInk.showText("Hallo!", 10, 10, 1, EInkColor.Black)
```

Die Roboto-Schriften belegen zusammen ca. 25 KB und werden nur eingebunden,
wenn „setze Schrift“ benutzt wird. Sie brauchen den **Calliope mini 3** –
für Calliope mini 1/2 ist das Programm damit zu groß; dort nur die Standardschrift nutzen.

## Eigene Bilder

Mit dem Bild-Konverter [`tools/bildkonverter.html`](tools/bildkonverter.html)
(im Browser öffnen) lässt sich jedes PNG/JPG – z. B. ein Logo – in eine
Grafik für das Display umwandeln. Rote Bildbereiche werden rot, dunkle schwarz,
helle weiß (wahlweise durchsichtig). Der Konverter erzeugt direkt den Code:

```typescript
eInk.drawBitmap("AQoD/8AAAFVAAAD/wFVA", 8, 140, 2)
```

Der Grafik-Code ist Base64: Byte 0 = Version (1), Byte 1 = Breite, Byte 2 = Höhe,
danach Schwarz-Ebene und Rot-Ebene (Bit gesetzt = Farbe, beide gesetzt = weiß,
keins = durchsichtig; jede Zeile auf volle Bytes aufgefüllt, MSB zuerst).
Tipp: Große Grafiken (z. B. 152 × 152) belegen etwa 7,7 KB Text im Programm.


## Lizenz

MIT – basiert auf
[Seeed-Studio/Grove_Triple_Color_E-lnk_1.54](https://github.com/Seeed-Studio/Grove_Triple_Color_E-lnk_1.54) (MIT).
Roboto und Roboto Mono: © The Roboto Project Authors, SIL Open Font License 1.1 (siehe `OFL-Roboto.txt`).

#### Metadaten

* for PXT/calliopemini
