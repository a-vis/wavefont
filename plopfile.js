const dedent = require('dedent')

// const UPM = 2048
const UPM = 1000

const ZERO_CHAR = ` \t`.split('').map(v=>v.charCodeAt(0)) //[0x09,0x0a,0x0b,0x0c,0x0d,0x20,0x85,0xa0,0x1680,0x180e,0x2000,0x2001,0x2002,0x2003,0x2004,0x2005,0x2006,0x2007,0x2008,0x2009,0x200a,0x200b,0x200c,0x200d,0x2028,0x2029,0x202f,0x205f,0x2060,0x2061,0x2062,0x3000,0xfeff].map(String.fromCharCode)

const ONE_CHAR = `.-_`.split('').map(v=>v.charCodeAt(0)) //`.-–—―_¯ˉˍ˗‐‑‒‾⁃⁻₋−⎯⏤─➖⸺⸻𐆑`

const MAX_CHAR = [`|`].map(v=>v.charCodeAt(0)) //`|｜ǀ∣│।`

const BAR_CHAR = `▁▂▃▄▅▆▇█`.split('').map(v=>v.charCodeAt(0))

const ASCII_CHAR = `!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~`.split('').map(v=>v.charCodeAt(0))

const FONTFACE = {
  wavefont10: {
    name: 'wavefont10',
    min: 0,
    max: 10,
    alias: {
      // NOTE: no need to stub 0s because they're covered by fallback blank font
      // 0: [...ZERO_CHAR, ...ASCII_CHAR.filter(code => !`0123456789abcdef`.includes(String.fromCharCode(code)) && !ONE_CHAR.includes(code) && !MAX_CHAR.includes(code))],
      1: ONE_CHAR,
      10: [...MAX_CHAR, ...`abcdef`.split('').map(v => v.charCodeAt(0))]
    },
    values: `0123456789a`.split(``).map(v => v.charCodeAt(0))
  },

  wavefont100: {
    name: 'wavefont100',
    min: 0,
    max: 100,
    alias: {
      1: ONE_CHAR
    },
    values: Array.from({length: 108}).map((v,i)=>(0x0100 + i))
  },

  wavefont255: {
    name: 'wavefont255',
    min: 0, max: 255,
    values: Array.from({length: 255})
  },

  wavefont1000: {
    name: 'wavefont1000',
    min: 0, max: 1000,
    values: Array.from({length: 1024})
  }
}

module.exports = function (plop) {
	plop.setGenerator('build-ufo', {
    description: 'Build font-face UFOs',
    prompts: [{name: 'faceName', message: 'font-face name', type: 'text'}],
		actions: ({faceName}) => {
      const face = FONTFACE[faceName]

      const axes = {
        width: {tag: 'wdth', min: 1, max: 1000, default: 1},
        align: {tag: 'algn', min: 0, max: 1, default: 0},
        radius: {tag: 'radi', min: 0, max: 50, default: 0}
      }

      const masters = {
        w1a0r0: {width: 1, align: 0, radius: 0},
        w1a1r0: {width: 1, align: 1, radius: 0},
        w1000a0r0: {width: 1000, align: 0, radius: 0 },
        w1000a1r0: {width: 1000, align: 1, radius: 0 },
        w1a0r50: {width: 1, align: 0, radius: 50 },
        w1a1r50: {width: 1, align: 1, radius: 50},
        w1000a0r50: {width: 1000, align: 0, radius: 50 },
        w1000a1r50: {width: 1000, align: 1, radius: 50},
      }

      // convert value to units-per-em (0-100 → 0-2048)
      const upm = (v) => (v * UPM / face.max).toFixed(0)
      const hex = (v) => v.toString(16).toUpperCase().padStart(4,0)
      const uni = (v) => Array.isArray(v) ? v.map(v => `u${hex(parseInt(v))}`).join(',') : `u${hex(parseInt(v))}`

      // uni 1 → uni0001
      plop.setHelper('uni', uni);

      // upm x →
      plop.setHelper('upm', upm);

      // hex x →
      plop.setHelper('hex', hex);

      // `clip x → true/false`
      plop.setHelper('clip', v => !!v && v < face.max)

      // sub 1 2 → -1
      plop.setHelper('sub', (a,b) => a-b);

      // half 1 → .5
      plop.setHelper('half', (a) => a*.5);

      return [
        // populate skeleton
        {
          type: 'addMany',
          force: true,
          verbose: false,
          destination: `${faceName}/`,
          base: '_wavefont',
          templateFiles: '_wavefont/*',
          data: { face, masters, axes }
        },
        ...Object.keys(masters).map(name => master({name, ...masters[name], axes})).flat()
      ]

      // actions to build one master file
      function master({name, align, width, radius, axes}){
        const destination = `${face.name}/${name}.ufo`
        const baseline = face.max * align
        return [
          // ufo skeleton
          {
            type: 'addMany',
            force: true,
            verbose: false,
            destination: `${destination}/`,
            base: '_wavefont/master.ufo',
            templateFiles: '_wavefont/master.ufo/**/*',
            data: { axes, width, face, baseline }
          },
          // value data points
          ...face.values.map((code, value) => ({
            verbose: false,
            force: true,
            type: 'add',
            path: `${destination}/glyphs/${value}.glif`,
            template: glyph({value, code, baseline, width, align, axes, radius: (radius*.01 && 1) * width})
          })),
          // substitute glyphs lower than max width to compensate wrong interpolation on width clipping
          // the logic: big widths would have big radius, but since it's limited to value, we interpolate between wrong 1 width and max width
          // ...values.filter(({clip}) => clip).map(({value}) => ({
          //   verbose: false,
          //   force: true,
          //   type: 'add',
          //   path: `masters/${width}_${align}_${radius}.ufo/glyphs/${value}.clip.glif`,
          //   template: glyph({value, width, align, maxValue, maxWidth, radius: (radius && 1) * value*.5})
          // }))
        ]
      }

      function glyph({value, code, width, align, radius}) {
        const R=radius,
              // bezier curve shift to approximate border-radius
              Rc = R * (1 - .55),
              // alignment constant shift
              Ca = (face.max - value) * align

        return dedent`
          <?xml version="1.0" encoding="UTF-8"?>
          <glyph name="_" format="2">
            <advance width="${width}"/>
            ${code ? `<unicode hex="{{hex ${code} }}"/>` : ``}
            ${face.alias[value]?.map(code => `<unicode hex="{{hex ${code} }}"/>`).join('') || ``}
            <outline>
              <contour>
                ${
                  dedent`
                  <point x="0" y="{{upm ${Ca} }}" type="line"/>
                  <point x="0" y="{{upm ${value + Ca} }}" type="line"/>
                  <point x="${width}" y="{{upm ${value + Ca} }}" type="line"/>
                  <point x="${width}" y="{{upm ${Ca}}}" type="line"/>
                  `
                  // `<point x="0" y="{{upm ${value-Rc + Ca} }}"/>

                  // <point x="{{upm ${Rc} }}" y="{{upm ${value + Ca} }}"/>
                  // <point x="{{upm ${R} }}" y="{{upm ${value + Ca} }}" type="curve" smooth="yes"/>
                  // <point x="{{upm ${width-R} }}" y="{{upm ${value + Ca} }}" type="line"/>
                  // <point x="{{upm ${width-Rc} }}" y="{{upm ${value + Ca} }}"/>

                  // <point x="{{upm ${width} }}" y="{{upm ${value-Rc + Ca} }}"/>
                  // <point x="{{upm ${width} }}" y="{{upm ${value-R + Ca} }}" type="curve" smooth="yes"/>
                  // <point x="{{upm ${width} }}" y="{{upm ${R + Ca} }}" type="line"/>
                  // <point x="{{upm ${width} }}" y="{{upm ${Rc + Ca} }}"/>

                  // <point x="{{upm ${width-Rc} }}" y="{{upm ${Ca} }}"/>
                  // <point x="{{upm ${width-R} }}" y="{{upm ${Ca} }}" type="curve" smooth="yes"/>
                  // <point x="{{upm ${R} }}" y="{{upm ${Ca} }}" type="line"/>
                  // <point x="{{upm ${Rc} }}" y="{{upm ${Ca} }}"/>

                  // <point x="0" y="{{upm ${Rc + Ca} }}"/>
                  // <point x="0" y="{{upm ${R + Ca} }}" type="curve" smooth="yes"/>
                  // <point x="0" y="{{upm ${value-R + Ca} }}" type="line"/>`
                }
              </contour>
            </outline>
          </glyph>
        `
      }
    }
  });
}
