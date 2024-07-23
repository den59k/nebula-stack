import CyrillicToTranslit from 'cyrillic-to-translit-js';

const cyrillicToTranslit = CyrillicToTranslit();

export const translit = (str: string) => {
  let start = 0
  let currentLang = "en"
  let output = ""
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    const isRu = code >= 1040 && code <= 1103
    const isEn = code >= 65 && code <= 122

    if (isEn || isRu) {
      if ((isRu && currentLang === "ru") || (isEn && currentLang === "en")) continue
      if (currentLang === "ru") {
        output += cyrillicToTranslit.transform(str.slice(start, i))
      } else {
        output += cyrillicToTranslit.reverse(str.slice(start, i))
      }
      start = i
      currentLang = isRu? "ru": "en"
    }
  }
  if (currentLang === "ru") {
    output += cyrillicToTranslit.transform(str.slice(start))
  } else {
    output += cyrillicToTranslit.reverse(str.slice(start))
  }
  return output
}
