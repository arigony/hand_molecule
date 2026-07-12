# MolecuAR — Visualizador Molecular Ball-and-Stick

Objeto educacional interativo para visualização molecular 3D no navegador, com estruturas do PubChem, representação ball-and-stick e modo AR com rastreamento de mão.

## Versão publicada

Esta revisão usa **MediaPipe Tasks Vision / HandLandmarker**, a mesma abordagem técnica da página `mol`, em vez da API antiga `@mediapipe/hands`.

## Características

- Estruturas carregadas prioritariamente do **PubChem** por CID.
- Exemplos com CIDs fixos para reduzir ambiguidade de busca.
- Representação **ball-and-stick** padronizada.
- Átomos como esferas e ligações como bastões.
- Cores atômicas padronizadas.
- Modo AR com câmera frontal.
- Rastreamento de mão por **HandLandmarker**.
- No celular, a molécula fica ancorada em área segura; a mão controla rotação e escala.
- Toque funciona como fallback.
- Modo diagnóstico com `?debug=1`, mostrando pontos detectados da mão.

## Arquivos

```text
index.html
style.css
script.js
README.md
```

## Como testar

Página normal:

```text
https://arigony.github.io/hand_molecule/
```

Página com diagnóstico da mão:

```text
https://arigony.github.io/hand_molecule/?debug=1
```

No modo diagnóstico, se a mão for detectada, pontos brancos devem aparecer sobre a mão.

## Observações técnicas

A página usa:

- Three.js;
- MediaPipe Tasks Vision;
- HandLandmarker;
- PubChem PUG REST API;
- JavaScript puro;
- CSS puro.

O modo câmera exige HTTPS. GitHub Pages já fornece HTTPS automaticamente.

## Exemplos incluídos

| Molécula | CID PubChem |
|---|---:|
| Água | 962 |
| Etanol | 702 |
| Benzeno | 241 |
| Cafeína | 2519 |
| Aspirina | 2244 |
| Dopamina | 681 |
| Glicose | 5793 |

## Uso didático sugerido

O professor pode pedir que os estudantes comparem:

- geometria molecular;
- presença de heteroátomos;
- grupos funcionais;
- ligações simples e duplas;
- diferenças entre moléculas pequenas e maiores;
- relação entre estrutura molecular e propriedades químicas.
