# Missão Especial — landing pages

Páginas estáticas (HTML + CSS + JS puro), mobile first, sem build.

```
index.html               # Dia das Crianças
natal.html               # campanha de Natal
assets/css/styles.css    assets/js/main.js    # Dia das Crianças
assets/css/natal.css     assets/js/natal.js   # Natal
assets/img/              # imagens (WebP)
```

## Checkout

Cada página tem um campo `CONFIG.checkoutUrl` no próprio JS (`main.js` e `natal.js`).
Todos os botões com `data-checkout` passam a apontar para esse link, repassando UTMs e
`fbclid`. Enquanto estiver vazio, os botões levam até a oferta.

## Publicar

Qualquer hospedagem estática. Suba a pasta `assets/` junto com os arquivos `.html`.
