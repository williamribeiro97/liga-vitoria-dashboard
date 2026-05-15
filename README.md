# Liga Vitória Dashboard TV

Dashboard de metas em tempo real para exibição em TVs.

## Estrutura

```
liga-vitoria-dashboard/
├── index.html          # Página principal (TV)
├── assets/
│   └── logo.png        # Logo da empresa
├── css/
│   └── style.css       # Todo o visual
└── js/
    ├── config.js       # ⚙️ CONFIGURAÇÕES — edite aqui
    └── dashboard.js    # Lógica (não precisa editar)
```

## Como atualizar

1. Edite `js/config.js` para mudar intervalos ou adicionar slides
2. Faça `git add . && git commit -m "update" && git push`
3. O Vercel publica automaticamente em ~30 segundos

## Adicionar novo slide

Em `js/config.js`, adicione na lista `SLIDES`:
```js
{ id: 'slide-2', title: 'SLA Operacional' },
```
E em `index.html`, adicione um novo `<div class="slide" id="slide-2">`.

## URL de produção

https://liga-vitoria-dashboard.vercel.app
