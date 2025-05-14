const fs = require('fs/promises')
const path = require('path')

const LAYERS = ['tail', 'leg', 'body', 'skin', 'eye', 'ear', 'mouth', 'horn', 'hand']

const COLOUR_SCHEMES = {
  red: {
    base: '#E63946',
    darker: '#B0303C',
    lighter: '#F28B82',
    highlight: '#FFD6D6'
  },
  green: {
    base: '#4CAF50',
    darker: '#388E3C',
    lighter: '#A5D6A7',
    highlight: '#C8E6C9'
  },
  blue: {
    base: '#2B9CD7',
    darker: '#1C82AF',
    lighter: '#9ED8F6',
    highlight: '#FFF000'
  },
  purple: {
    base: '#9C27B0',
    darker: '#6A1B9A',
    lighter: '#CE93D8',
    highlight: '#F3E5F5'
  },
  orange: {
    base: '#FF9800',
    darker: '#F57C00',
    lighter: '#FFCC80',
    highlight: '#FFE0B2'
  },
  teal: {
    base: '#009688',
    darker: '#00695C',
    lighter: '#80CBC4',
    highlight: '#B2DFDB'
  },
  pink: {
    base: '#E91E63',
    darker: '#AD1457',
    lighter: '#F48FB1',
    highlight: '#F8BBD0'
  },
  yellow: {
    base: '#FFEB3B',
    darker: '#FBC02D',
    lighter: '#FFF59D',
    highlight: '#FFF9C4'
  },
  brown: {
    base: '#795548',
    darker: '#5D4037',
    lighter: '#BCAAA4',
    highlight: '#D7CCC8'
  },
  grey: {
    base: '#9E9E9E',
    darker: '#616161',
    lighter: '#E0E0E0',
    highlight: '#F5F5F5'
  }
}

class SVGComposer {
  constructor(assetPath) {
    this.assetPath = assetPath
  }

  getSvgFilename(layer, index) {
    return `${layer}_${index}.svg`
  }

  async getRandomValidIndex(layer) {
    const files = await fs.readdir(this.assetPath)
    const matches = files.filter(f => f.startsWith(`${layer}_`) && f.endsWith('.svg'))
    const indices = matches
      .map(f => parseInt(f.split('_')[1]))
      .filter(n => !isNaN(n))
    return indices[Math.floor(Math.random() * indices.length)]
  }

  applyColourScheme(svgString, scheme) {
    if (!scheme) return svgString

    return svgString
      .replace(/#2B9CD7/gi, scheme.base)
      .replace(/#1C82AF/gi, scheme.darker)
      .replace(/#9ED8F6/gi, scheme.lighter)
      .replace(/#FFF000/gi, scheme.highlight)
  }

  async loadAndCleanSvg(filePath, scheme) {
    let raw = await fs.readFile(filePath, 'utf-8')

    let clean = raw
      .replace(/<\?xml[^>]*\?>/gi, '')
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<\/?svg[^>]*>/gi, '')
      .trim()

    return this.applyColourScheme(clean, scheme)
  }

  /**
   * parts = {
   *   avatar: { hand:1, horn:2, … },
   *   colorScheme: 'red'
   * }
   */
  async compose(parts) {
    const scheme = COLOUR_SCHEMES[parts.colorScheme] || null
   
    const layers = await Promise.all(
      LAYERS.map(async layer => {
        
        if (layer === 'body') {
          const p = path.join(this.assetPath, 'body.svg')
          return this.loadAndCleanSvg(p, scheme)
        }

        let idx = parts.avatar[layer]
        let filename = this.getSvgFilename(layer, idx)
        let fullPath = path.join(this.assetPath, filename)
        
        try {
          return await this.loadAndCleanSvg(fullPath, scheme)
        } catch {
          const fb = await this.getRandomValidIndex(layer)
          const fallbackPath = path.join(this.assetPath, this.getSvgFilename(layer, fb))
          return this.loadAndCleanSvg(fallbackPath, scheme)
        }
      })
    )

    return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">${layers.join('')}</svg>`
  }
}

module.exports = SVGComposer
