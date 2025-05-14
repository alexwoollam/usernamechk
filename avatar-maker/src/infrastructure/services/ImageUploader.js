class ImageUploader {
  constructor(client, bucket) {
    this.client = client
    this.bucket = bucket
  }

  async upload(filename, content) {
    await this.client.putObject(this.bucket, filename, content)

    const url = await this.client.presignedGetObject(this.bucket, filename)
    return url
  }
}

module.exports = ImageUploader
