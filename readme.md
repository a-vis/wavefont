# wavefont

A typeface for rendering data: waveforms, spectrums, diagrams, bars etc. [Demo](https://a-vis.github.io/wavefont).

<a href="https://a-vis.github.io/wavefont"><img src="./preview.png" width="240px"/></a>

## Usage

<!-- Get [wavefont.otf](./wavefont.otf) or [wavefont.ttf](./wavefont.ttf). -->
Put [_wavefont.woff2_](./wavefont.woff2) into your project directory and use this code:

```html
<style>
	@font-face {
		font-family: wavefont;
		src: url(./wavefont.woff2) format('woff2');
	}

	.wavefont {
		font-family: wavefont;
		--wdth: 10;
		font-variation-settings: 'wdth' var(--wdth), 'algn' 0.5, 'radi' 30;
	}
</style>

<textarea id="waveform" class="wavefont" cols="100"></textarea>

<script>
	waveform.textContent = ints.map(v => String.fromCharCode(0x100 + v)).join('')
</script>
```

## Font-faces

Wavefont provides font-faces with various size/range balance, you can include one or multiple.

Face 									| Size 	| Values 				| Characters		| Value → character
---|---|---|---|---
_wavefont10.woff2_ 		| 5kb 	| 0-10 					| 0-10 					| `value`
_wavefont16.woff2_ 		| 10kb 	| 0x0-0xF			 	| 0-10, a-f 		| `value.toString(16)`
_wavefont100.woff2_ 	| 30kb 	| 0-100		 			| U+0100-0200 	| `String.fromCharCode(0x100 + value)`
_wavefont255.woff2_ 	| 50kb	| 0-255					| U+0100-03FF 	| `String.fromCharCode(0x100 + value)`
_wavefont1000.woff2_ 	| 100kb	| 0-1000 				| U+E000-E8FF 	| `String.fromCharCode(0xe000 + value)`
_wavefont.woff2_		 	| 100kb	| all of above	| all	of above 	| any of above

To choose automatically the right face depending on used characters, use _unicode-range_:

```css
/* 0-10 */
@font-face {
	font-family: wavefont;
	src: url(./wavefont10.woff2) format('woff2');
	unicode-range: U+0020-007E;
}
/* 0-16 */
@font-face {
	font-family: wavefont;
	src: url(./wavefont16.woff2) format('woff2');
	unicode-range: U+0020-007E;
}
/* 0-100 */
@font-face {
	font-family: wavefont;
	src: url(./wavefont100.woff2) format('woff2');
	unicode-range: U+00F8-02AF;
}
/* 0-255 */
@font-face {
	font-family: wavefont;
	src: url(./wavefont255.woff2) format('woff2');
	unicode-range: U+00F8-02AF;
}
/* 0-1000 */
@font-face {
	font-family: wavefont;
	src: url(./wavefont1000.woff2) format('woff2');
	unicode-range: U+E000-E8FF;
}
```

## Variable features

Tag | Range | Meaning
---|---|---
`wdth` | _1_-_100_ | Adjusts glyph width.
`algn` | _0_-_1_ | _0_ for bottom align, _0.5_ for center and _1_ for top align.
`radi` | _0_-_50_ | Border radius, percentage of glyph width.
`ampl` | _0_-_1_ | Amplitude (height) or bars


## Hints

* Charcodes fall under marking characters unicode category, ie. recognized as word by regexp and can be selected with <kbd>Ctrl</kbd> + <kbd>→</kbd> / double click.
* Vertical position of a bar can be adjusted with accent grave <kbd>&nbsp;&#x0300;</kbd> (U+0300) for negative shift or accent acute <kbd>&nbsp;&#x0301;</kbd> (U+0301) for positive shift. One accent character adjusts vertical position by _1_, use multiple accents to shift for more than 1.
* Values below range are limited to 0, eg. _0x0ff_ in _wavefont100_ is mapped to 0.
* Values above range are supported to some extent and then clipped, eg. _0x164_ (dec 101) in _wavefont100_ is supported and value above 108 is clipped.
* Space, tab and other non-marking characters alias to _0_ value.
* Dashes, dot, underscore characters alias to _1_ value.
* Vertical lines like `|` alias to max value.
* Block characters ▁▂▃▄▅▆▇█ are mapped to corresponding bars.
* [Adobe Blank](https://github.com/adobe-fonts/adobe-blank-vf) font-face can be used to avoid flash of system font while loading wavefont. It can as well be used as blob.


## Building

[UFOs](https://unifiedfontobject.org/versions/ufo3/) are generated by [plop](https://github.com/plopjs/plop), to modify font the [plopfile](./plopfile.js) change is required.
TTF is built with [fontmake](https://github.com/googlefonts/fontmake). OTF is built with [afdko](https://adobe-type-tools.github.io/afdko/).

## See also

* [linefont](https://github.com/a-vis/linefont) − font-face for rendering linear data.

## References

* [unified font object spec](https://unifiedfontobject.org/versions/ufo3) − unified human-readable format for storing font data.
* [feature file spec](https://adobe-type-tools.github.io/afdko/OpenTypeFeatureFileSpecification.html#6.h) − defining opentype font features.
* [afdko](https://adobe-type-tools.github.io/afdko/) − font building tools from Adobe.
* [fontmake](https://github.com/googlefonts/fontmake) − font building tool from Google.
* [unicode-table](https://unicode-table.com/) − convenient unicode table.
* [adobe-variable-font-prototype](https://github.com/adobe-fonts/adobe-variable-font-prototype) − example variable font.
* [designspace xml spec](https://github.com/fonttools/fonttools/tree/main/Doc/source/designspaceLib#document-xml-structure) − human-readable format for describing variable fonts.
* [plopfile](https://github.com/plopjs/plop#built-in-actions) − file generator based on templates.
* [Adobe Blank](https://github.com/adobe-fonts/adobe-blank-vf) − blank characters variable font.

<p align="center">🕉<p>
