export function validateAvatar(avatar) {
  const requiredLayers = ['hand', 'horn', 'mouth', 'ear', 'eye', 'skin', 'leg', 'tail']
  return requiredLayers.every(layer => Number.isInteger(avatar[layer]) && avatar[layer] > 0)
}
