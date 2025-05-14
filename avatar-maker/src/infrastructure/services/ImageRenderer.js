const sharp = require('sharp')

class ImageRenderer {
  async render(svg) {
    return sharp(Buffer.from(svg)).png().toBuffer()
  }
}

module.exports = ImageRenderer
