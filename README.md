# Grove Triple Color E-Ink Display 1.54" für Calliope mini

MakeCode-Erweiterung für das **Seeed Grove – Triple Color E-Ink Display 1.54"**
(152 × 152 Pixel, schwarz / weiß / rot, Panel GDEW0154Z17).

Das Grove-Modul hat einen eigenen Controller. Der Calliope schickt ihm das
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
   Das passiert nur im Speicher des Calliope, auf dem Display ändert sich noch nichts.
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
| schreibe Text / Zahl … Größe … | 5×7-Schrift, Größe 1 = 6×8 Pixel pro Zeichen, `\n` = neue Zeile, Umlaute und ° werden unterstützt |
| Breite von Text | Textbreite in Pixeln, z. B. zum Zentrieren |
| *Mehr:* letzte Aktualisierung erfolgreich | `wahr`, wenn das Display geantwortet hat |
| *Mehr:* Farbe von Pixel | Farbe im Bildspeicher abfragen |

## Als Erweiterung laden

Dieses Verzeichnis in ein GitHub-Repository hochladen und in MakeCode
(makecode.calliope.cc) unter *Erweiterungen* die Repository-URL eingeben.

## Lizenz

MIT – basiert auf
[Seeed-Studio/Grove_Triple_Color_E-lnk_1.54](https://github.com/Seeed-Studio/Grove_Triple_Color_E-lnk_1.54) (MIT).

#### Metadaten (für Suche, Rendering)

* for PXT/calliopemini
