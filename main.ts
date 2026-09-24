/**
 * Grove – Triple Color E-Ink Display 1.54" (152 x 152, Schwarz/Weiß/Rot)
 *
 * Das Grove-Modul besitzt einen eigenen Mikrocontroller, der das Panel
 * (GDEW0154Z17) ansteuert. Das Bild wird per UART (230400 Baud) übertragen:
 *   1. Calliope sendet 'a', Modul antwortet mit 'b'
 *   2. 2888 Byte Schwarz-Ebene (38 Pakete à 76 Byte)
 *   3. 2888 Byte Rot-Ebene    (38 Pakete à 76 Byte)
 * Ein Bit = 1 Pixel, MSB zuerst, 19 Byte pro Zeile. 0 = Farbe, 1 = Weiß.
 *
 * Gezeichnet wird zunächst in einen Bildspeicher im Calliope.
 * Erst "Anzeige aktualisieren" überträgt das Bild zum Display.
 */

enum EInkColor {
    //% block="weiß"
    White = 0,
    //% block="schwarz"
    Black = 1,
    //% block="rot"
    Red = 2
}

//% color="#3a3a3a" weight=90 icon="" block="E-Ink"
//% groups='["Start", "Zeichnen", "Text"]'
namespace eInk {
    export const WIDTH = 152
    export const HEIGHT = 152
    const BYTES_PER_ROW = 19          // 152 / 8
    const BUFFER_SIZE = 2888          // 19 * 152
    const PACKET_SIZE = 76
    const PACKET_DELAY = 70           // ms, wie im Seeed-Beispiel
    const BAUD = 230400

    let blackPlane: Buffer = null
    let redPlane: Buffer = null
    let initialized = false
    let lastUpdateOk = false

    function ensureBuffers() {
        if (!blackPlane) {
            blackPlane = pins.createBuffer(BUFFER_SIZE)
            redPlane = pins.createBuffer(BUFFER_SIZE)
            blackPlane.fill(0xFF)
            redPlane.fill(0xFF)
        }
    }

    /**
     * Verbindet das E-Ink Display über die serielle Schnittstelle.
     * Am Calliope mini 3 steckt das Modul am Grove-Anschluss A1 (C16/C17).
     * Funktioniert es nicht, TX und RX tauschen.
     * @param tx Sende-Pin des Calliope, z.B. SerialPin.C17
     * @param rx Empfangs-Pin des Calliope, z.B. SerialPin.C16
     */
    //% blockId=eink_init
    //% block="E-Ink Display verbinden TX %tx RX %rx"
    //% tx.defl=SerialPin.C17 rx.defl=SerialPin.C16
    //% group="Start" weight=100
    export function init(tx: SerialPin, rx: SerialPin): void {
        ensureBuffers()
        serial.setRxBufferSize(32)
        serial.setTxBufferSize(PACKET_SIZE + 4)
        serial.redirect(tx, rx, BAUD as BaudRate)
        initialized = true
    }

    /**
     * Überträgt den Bildspeicher zum Display (dauert ca. 8 Sekunden plus
     * Bildaufbau). Laut Hersteller sollten zwischen zwei Aktualisierungen
     * mindestens 180 Sekunden liegen, sonst können Geisterbilder bleiben.
     */
    //% blockId=eink_update
    //% block="Anzeige aktualisieren"
    //% group="Start" weight=90
    export function update(): void {
        ensureBuffers()
        lastUpdateOk = false
        if (!initialized) return
        if (!handshake()) return
        basic.pause(2000)
        sendPlane(blackPlane)
        basic.pause(PACKET_DELAY)
        sendPlane(redPlane)
        lastUpdateOk = true
    }

    /**
     * Gibt an, ob das Display bei der letzten Aktualisierung geantwortet hat.
     */
    //% blockId=eink_last_ok
    //% block="letzte Aktualisierung erfolgreich"
    //% group="Start" weight=80 advanced=true
    export function lastUpdateSuccessful(): boolean {
        return lastUpdateOk
    }

    function handshake(): boolean {
        serial.readString() // alten Empfangspuffer leeren
        for (let attempt = 0; attempt < 10; attempt++) {
            serial.writeString("a")
            const deadline = control.millis() + 500
            while (control.millis() < deadline) {
                if (serial.readString().indexOf("b") >= 0) return true
                basic.pause(10)
            }
        }
        return false
    }

    function sendPlane(plane: Buffer) {
        for (let i = 0; i < BUFFER_SIZE / PACKET_SIZE; i++) {
            serial.writeBuffer(plane.slice(i * PACKET_SIZE, PACKET_SIZE))
            basic.pause(PACKET_DELAY)
        }
    }

    /**
     * Füllt den ganzen Bildspeicher mit einer Farbe.
     */
    //% blockId=eink_clear
    //% block="fülle Bildschirm mit %color"
    //% group="Zeichnen" weight=100
    export function clear(color: EInkColor = EInkColor.White): void {
        ensureBuffers()
        blackPlane.fill(color == EInkColor.Black ? 0x00 : 0xFF)
        redPlane.fill(color == EInkColor.Red ? 0x00 : 0xFF)
    }

    /**
     * Setzt einen einzelnen Pixel.
     * @param x Spalte 0..151
     * @param y Zeile 0..151
     */
    //% blockId=eink_pixel
    //% block="zeichne Pixel x %x y %y Farbe %color"
    //% x.min=0 x.max=151 y.min=0 y.max=151
    //% color.defl=EInkColor.Black
    //% group="Zeichnen" weight=90 inlineInputMode=inline
    export function setPixel(x: number, y: number, color: EInkColor): void {
        x |= 0
        y |= 0
        if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return
        ensureBuffers()
        const i = y * BYTES_PER_ROW + (x >> 3)
        const mask = 0x80 >> (x & 7)
        if (color == EInkColor.Black) blackPlane[i] &= ~mask
        else blackPlane[i] |= mask
        if (color == EInkColor.Red) redPlane[i] &= ~mask
        else redPlane[i] |= mask
    }

    /**
     * Liefert die Farbe eines Pixels im Bildspeicher.
     */
    //% blockId=eink_get_pixel
    //% block="Farbe von Pixel x %x y %y"
    //% x.min=0 x.max=151 y.min=0 y.max=151
    //% group="Zeichnen" weight=10 advanced=true
    export function getPixel(x: number, y: number): EInkColor {
        x |= 0
        y |= 0
        if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return EInkColor.White
        ensureBuffers()
        const i = y * BYTES_PER_ROW + (x >> 3)
        const mask = 0x80 >> (x & 7)
        if (!(redPlane[i] & mask)) return EInkColor.Red
        if (!(blackPlane[i] & mask)) return EInkColor.Black
        return EInkColor.White
    }

    /**
     * Zeichnet eine Linie.
     */
    //% blockId=eink_line
    //% block="zeichne Linie von x %x0 y %y0 bis x %x1 y %y1 Farbe %color"
    //% x0.min=0 x0.max=151 y0.min=0 y0.max=151
    //% x1.min=0 x1.max=151 y1.min=0 y1.max=151 x1.defl=151 y1.defl=151
    //% color.defl=EInkColor.Black
    //% group="Zeichnen" weight=80 inlineInputMode=inline
    export function drawLine(x0: number, y0: number, x1: number, y1: number, color: EInkColor): void {
        x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0
        const dx = Math.abs(x1 - x0)
        const dy = -Math.abs(y1 - y0)
        const sx = x0 < x1 ? 1 : -1
        const sy = y0 < y1 ? 1 : -1
        let err = dx + dy
        while (true) {
            setPixel(x0, y0, color)
            if (x0 == x1 && y0 == y1) break
            const e2 = 2 * err
            if (e2 >= dy) { err += dy; x0 += sx }
            if (e2 <= dx) { err += dx; y0 += sy }
        }
    }

    /**
     * Zeichnet ein Rechteck (Rahmen oder gefüllt).
     */
    //% blockId=eink_rect
    //% block="zeichne Rechteck x %x y %y Breite %w Höhe %h Farbe %color gefüllt %filled"
    //% x.min=0 x.max=151 y.min=0 y.max=151
    //% w.min=1 w.max=152 h.min=1 h.max=152 w.defl=40 h.defl=30
    //% color.defl=EInkColor.Black
    //% group="Zeichnen" weight=70 inlineInputMode=inline
    export function drawRect(x: number, y: number, w: number, h: number, color: EInkColor, filled: boolean = false): void {
        x |= 0; y |= 0; w |= 0; h |= 0
        if (w <= 0 || h <= 0) return
        if (filled) {
            fillRect(x, y, w, h, color)
        } else {
            fillRect(x, y, w, 1, color)
            fillRect(x, y + h - 1, w, 1, color)
            fillRect(x, y, 1, h, color)
            fillRect(x + w - 1, y, 1, h, color)
        }
    }

    function fillRect(x: number, y: number, w: number, h: number, color: EInkColor) {
        const x0 = Math.max(0, x)
        const y0 = Math.max(0, y)
        const x1 = Math.min(WIDTH, x + w)
        const y1 = Math.min(HEIGHT, y + h)
        for (let yy = y0; yy < y1; yy++)
            for (let xx = x0; xx < x1; xx++)
                setPixel(xx, yy, color)
    }

    /**
     * Zeichnet einen Kreis (Rahmen oder gefüllt).
     */
    //% blockId=eink_circle
    //% block="zeichne Kreis Mitte x %cx y %cy Radius %r Farbe %color gefüllt %filled"
    //% cx.min=0 cx.max=151 cy.min=0 cy.max=151 cx.defl=76 cy.defl=76
    //% r.min=1 r.max=76 r.defl=20
    //% color.defl=EInkColor.Black
    //% group="Zeichnen" weight=60 inlineInputMode=inline
    export function drawCircle(cx: number, cy: number, r: number, color: EInkColor, filled: boolean = false): void {
        cx |= 0; cy |= 0; r |= 0
        if (r < 0) return
        let x = r
        let y = 0
        let err = 1 - r
        while (x >= y) {
            if (filled) {
                fillRect(cx - x, cy + y, 2 * x + 1, 1, color)
                fillRect(cx - x, cy - y, 2 * x + 1, 1, color)
                fillRect(cx - y, cy + x, 2 * y + 1, 1, color)
                fillRect(cx - y, cy - x, 2 * y + 1, 1, color)
            } else {
                setPixel(cx + x, cy + y, color); setPixel(cx - x, cy + y, color)
                setPixel(cx + x, cy - y, color); setPixel(cx - x, cy - y, color)
                setPixel(cx + y, cy + x, color); setPixel(cx - y, cy + x, color)
                setPixel(cx + y, cy - x, color); setPixel(cx - y, cy - x, color)
            }
            y++
            if (err < 0) {
                err += 2 * y + 1
            } else {
                x--
                err += 2 * (y - x) + 1
            }
        }
    }

    /**
     * Zeichnet ein 5x5-LED-Bild vergrößert auf das Display.
     * @param size Größe eines LED-Pixels in Display-Pixeln
     */
    //% blockId=eink_image
    //% block="zeichne Bild %img x %x y %y Größe %size Farbe %color"
    //% img.shadow=builtin_image
    //% x.min=0 x.max=151 y.min=0 y.max=151
    //% size.min=1 size.max=30 size.defl=10
    //% color.defl=EInkColor.Black
    //% group="Zeichnen" weight=50 inlineInputMode=inline
    export function drawImage(img: Image, x: number, y: number, size: number, color: EInkColor): void {
        size = Math.max(1, size | 0)
        for (let iy = 0; iy < img.height(); iy++)
            for (let ix = 0; ix < img.width(); ix++)
                if (img.pixel(ix, iy))
                    fillRect(x + ix * size, y + iy * size, size, size, color)
    }

    function glyphIndex(code: number): number {
        if (code >= 32 && code <= 126) return code - 32
        switch (code) {
            case 0xC4: return 95  // Ä
            case 0xD6: return 96  // Ö
            case 0xDC: return 97  // Ü
            case 0xE4: return 98  // ä
            case 0xF6: return 99  // ö
            case 0xFC: return 100 // ü
            case 0xDF: return 101 // ß
            case 0xB0: return 102 // °
        }
        return 31 // '?'
    }

    /**
     * Schreibt Text in den Bildspeicher. Ein Zeichen ist 6 x 8 Pixel groß
     * (mal Größe). Zu lange Texte werden in die nächste Zeile umgebrochen.
     * @param text der Text
     * @param size Vergrößerungsfaktor 1..10
     */
    //% blockId=eink_text
    //% block="schreibe Text %text x %x y %y Größe %size Farbe %color"
    //% text.defl="Hallo!"
    //% x.min=0 x.max=151 y.min=0 y.max=151
    //% size.min=1 size.max=10 size.defl=2
    //% color.defl=EInkColor.Black
    //% group="Text" weight=100 inlineInputMode=inline
    export function showText(text: string, x: number, y: number, size: number, color: EInkColor): void {
        size = Math.max(1, size | 0)
        const startX = x | 0
        let cx = startX
        let cy = y | 0
        const charW = 6 * size
        const charH = 8 * size
        for (let n = 0; n < text.length; n++) {
            const code = text.charCodeAt(n)
            if (code == 10) { // Zeilenumbruch "\n"
                cx = startX
                cy += charH
                continue
            }
            if (cx + 5 * size > WIDTH) {
                cx = startX
                cy += charH
            }
            drawChar(code, cx, cy, size, color)
            cx += charW
        }
    }

    /**
     * Schreibt eine Zahl in den Bildspeicher.
     */
    //% blockId=eink_number
    //% block="schreibe Zahl %value x %x y %y Größe %size Farbe %color"
    //% x.min=0 x.max=151 y.min=0 y.max=151
    //% size.min=1 size.max=10 size.defl=2
    //% color.defl=EInkColor.Black
    //% group="Text" weight=90 inlineInputMode=inline
    export function showNumber(value: number, x: number, y: number, size: number, color: EInkColor): void {
        showText("" + value, x, y, size, color)
    }

    /**
     * Breite eines Textes in Pixeln – nützlich zum Zentrieren.
     */
    //% blockId=eink_text_width
    //% block="Breite von Text %text bei Größe %size"
    //% size.min=1 size.max=10 size.defl=2
    //% group="Text" weight=80
    export function textWidth(text: string, size: number): number {
        size = Math.max(1, size | 0)
        if (text.length == 0) return 0
        return (text.length * 6 - 1) * size
    }

    function drawChar(code: number, x: number, y: number, size: number, color: EInkColor) {
        const offset = glyphIndex(code) * 5
        for (let col = 0; col < 5; col++) {
            const bits = FONT_5X7[offset + col]
            if (!bits) continue
            for (let row = 0; row < 7; row++) {
                if (bits & (1 << row)) {
                    if (size == 1) setPixel(x + col, y + row, color)
                    else fillRect(x + col * size, y + row * size, size, size, color)
                }
            }
        }
    }
}
