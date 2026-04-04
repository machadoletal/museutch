/**
 * personImages.js
 * Mapeamento de nome → URL de imagem para os avatares do Hall da Fama.
 * A busca é feita com normalização (sem acento, lowercase).
 */

const IMAGES = {
  'ana':     'https://dicionariompb.com.br/wp-content/uploads/2021/04/Ana-Vilela.jpeg',
  'helo':    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjI-qnOOBW6MTjwdvaTtoGBh-RcbLXQB-wmg&s',
  'hosanna': 'https://cdn.marvel.com/content/2x/107shr_ons_cut_mob_01_1.jpg',
  'gustavo': 'https://img.freepik.com/vetores-gratis/cute-ninja-com-shuriken-e-espada-cartoon-vector-icon-ilustracao-pessoas-ferias-isoladas-planas_138676-9389.jpg',
  'rapha':   'https://upload.wikimedia.org/wikipedia/pt/thumb/6/6a/Cap_nascimento.jpg/250px-Cap_nascimento.jpg',
  'jack':    'https://akamai.sscdn.co/uploadfile/letras/fotos/5/6/f/f/56ff194f5979caf85cfa3eb3be66cb6f.jpg',
  'matheus': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvyvAWJM_NI8aEgPyOw3qe8Y3zqrjQnS0JFg&s',
  'cuctor':  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt6O4sNo3Y7Z0H-tWGpvB8WGSUVbEyOYIV8w&s',
  'julia':   'https://static.vecteezy.com/ti/vetor-gratis/p1/3809209-vector-design-of-a-cute-chinese-girl-character-vetor.jpg',
}

function normalize(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function getPersonImage(name) {
  return IMAGES[normalize(name)] ?? null
}
