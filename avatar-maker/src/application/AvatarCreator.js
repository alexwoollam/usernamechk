class AvatarCreator {
  constructor(composer, renderer, uploader) {
    this.composer = composer
    this.renderer = renderer
    this.uploader = uploader
  }

  async create(input) {
    console.log('Input: ', input);
    const svg = await this.composer.compose({
      avatar: input.avatar,
      colorScheme: input.colorScheme
    })
    const png = await this.renderer.render(svg)
    const filename = `${Date.now()}.png`
    const url = await this.uploader.upload(filename, png)
    return url
  }
}

module.exports = AvatarCreator
