# MolecuAR — Visualizador Molecular WebAR Multilíngue

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21323163.svg)](https://doi.org/10.5281/zenodo.21323163)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://arigony.github.io/hand_molecule/)

**MolecuAR** é um objeto educacional interativo para visualização molecular 3D no navegador, com busca multilíngue, integração com PubChem/Wikidata, representação ball-and-stick e modo de realidade aumentada para celular.

## Versão citável

- **Versão:** v1.0.1
- **DOI Zenodo:** https://doi.org/10.5281/zenodo.21323163
- **Release GitHub:** https://github.com/arigony/hand_molecule/releases/tag/v1.0.1
- **Demonstração online:** https://arigony.github.io/hand_molecule/

## Citação sugerida

Souto, A. A. (2026). *MolecuAR: a multilingual WebAR molecular visualization tool for chemical education* (Version 1.0.1) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.21323163

Um arquivo `CITATION.cff` também está incluído no repositório.

## Objetivo educacional

O MolecuAR foi desenvolvido para apoiar o ensino de Química, permitindo que estudantes relacionem:

- fórmula molecular;
- geometria e visualização 3D;
- ligações simples, duplas e triplas;
- heteroátomos e grupos funcionais;
- propriedades físico-químicas;
- solubilidade, LogP, massa molar e informações de segurança;
- relação entre estrutura molecular e propriedades químicas.

## Principais funcionalidades

- Visualização molecular 3D em representação **ball-and-stick**.
- Busca de estruturas moleculares a partir do **PubChem CID**.
- Busca por nomes em **português, espanhol e inglês**.
- Resolução multilíngue por **Wikidata → PubChem CID**.
- Integração com **PubChem PUG REST** e **PubChem PUG-View**.
- Interface responsiva para celular e computador.
- Modo AR com câmera do navegador.
- Alternância entre câmera frontal e traseira no celular.
- Rastreamento de mão com **MediaPipe Tasks Vision / HandLandmarker**.
- Controle por gesto de pinça para zoom molecular.
- Painel expansível com informações químicas.
- Normalização de temperaturas para **°C** quando possível.

## Informações exibidas no painel químico

O painel inferior pode ser expandido para mostrar informações recuperadas do PubChem:

- fórmula molecular;
- massa molar;
- SMILES;
- nome IUPAC;
- LogP / XLogP;
- TPSA;
- doadores e aceptores de ligação de hidrogênio;
- ligações rotacionais;
- carga;
- complexidade;
- massa exata;
- solubilidade;
- ponto de fusão;
- ponto de ebulição;
- densidade;
- uso/contexto;
- perigos e informações de segurança.

Nem todos os compostos possuem todos os campos preenchidos no PubChem. Quando um dado não está disponível, o painel mostra **não informado**.

## Como usar

1. Acesse: https://arigony.github.io/hand_molecule/
2. Digite um nome molecular em português, espanhol ou inglês.
3. Alternativamente, digite diretamente o **CID PubChem**.
4. Use o mouse/toque para girar e aproximar a molécula.
5. Toque no cartão inferior para abrir o painel de informações químicas.
6. No celular, clique em **AR** para usar a câmera.
7. No modo AR, use o botão de câmera para alternar entre câmera frontal e traseira.

Exemplos de busca:

```text
água / agua / water
etanol / ethanol
benzeno / benceno / benzene
cafeína / caffeine
aspirina / aspirin
glicose / glucosa / glucose
ácido acético / acetic acid
curcumina / curcumin
resveratrol
```

Também é possível buscar por CID:

```text
2244   # aspirina
2519   # cafeína
5793   # glicose
```

## Arquitetura de busca molecular

A busca usa uma estratégia híbrida:

```text
1. CID numérico digitado pelo usuário
2. Tabela local de aliases PT/ES/EN para moléculas didáticas
3. Busca direta no PubChem
4. Busca multilíngue no Wikidata
5. Recuperação do PubChem CID via propriedade P662 no Wikidata
6. Carregamento da estrutura molecular pelo PubChem
```

Essa arquitetura evita depender exclusivamente de tradução automática e melhora a identificação de nomes comuns em diferentes idiomas.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro
- Three.js
- PubChem PUG REST
- PubChem PUG-View
- Wikidata API
- MediaPipe Tasks Vision / HandLandmarker
- GitHub Pages
- Zenodo

## Estrutura dos arquivos

```text
index.html              interface principal
style.css               estilos gerais e responsividade
script.js               visualização 3D, PubChem e AR
resolver.js             resolução multilíngue Wikidata → PubChem CID
camera-toggle.js        alternância de câmera frontal/traseira
molecule-info.css       estilos do painel de informações químicas
molecule-info.js        painel expandido de propriedades químicas
README.md               documentação do projeto
LICENSE                 licença MIT
CITATION.cff            metadados de citação
```

## Publicação

O projeto está publicado via GitHub Pages:

```text
https://arigony.github.io/hand_molecule/
```

O software foi arquivado no Zenodo:

```text
https://doi.org/10.5281/zenodo.21323163
```

## Limitações

- A disponibilidade de estruturas, propriedades, solubilidade, perigos e usos depende dos dados existentes no PubChem.
- A busca multilíngue depende da presença de identificadores PubChem CID no Wikidata.
- Alguns nomes podem ser ambíguos, especialmente sais, isômeros, hidratos, misturas e nomes comerciais.
- O modo AR atual sobrepõe a molécula à câmera; a ancoragem espacial em mesa/chão exigirá uma etapa futura com WebXR hit-test.
- O desempenho do rastreamento de mão pode variar conforme navegador, câmera, iluminação e modelo do celular.

## Próximos passos

- Implementar modo **Mundo AR** com WebXR hit-test.
- Permitir ancoragem da molécula em uma superfície real.
- Adicionar mais moléculas didáticas à tabela local.
- Criar atividades guiadas para sala de aula.
- Validar o objeto educacional com estudantes.
- Preparar preprint/artigo como software educacional ou technology report.

## Licença

Este projeto está licenciado sob a **MIT License**.

## Autor

Prof. Dr. André Arigony Souto
