export function getProp(obj, names) {
  const [name, ...otherNames] = names.split('.')
  const value = obj[name]
  // eslint-disable-next-line no-use-before-define
  if (otherNames.length && value) return getProp(value, otherNames.join('.'))
  return value
}

export function renderThis(string = '', self = {}) {
  const split = string.split('$')
  const newString = split.map(name => {
    if (name.startsWith('=')) {
      const dataName = name.substring(1)
      return getProp(self, dataName) || undefined
    }
    return name
  })
  return newString.join('')
}