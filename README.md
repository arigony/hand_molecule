# MolecuAR — Visualizador Molecular WebAR Multilíngue

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21325855.svg)](https://doi.org/10.5281/zenodo.21325855)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://arigony.github.io/hand_molecule/)

**MolecuAR** é um objeto educacional interativo para visualização molecular 3D no navegador, com busca multilíngue, integração com PubChem/Wikidata, representação ball-and-stick e modo de realidade aumentada para celular.

## Versão citável atual

- **Versão:** v1.1.0
- **DOI Zenodo:** https://doi.org/10.5281/zenodo.21325855
- **Release GitHub:** https://github.com/arigony/hand_molecule/releases/tag/v1.1.0
- **Estado:** integração do painel químico e do controle de câmera concluída e verificada manualmente em celular
- **Demonstração online:** https://arigony.github.io/hand_molecule/
- **Repositório:** https://github.com/arigony/hand_molecule

### Versão anterior

- **Versão:** v1.0.1
- **DOI Zenodo:** https://doi.org/10.5281/zenodo.21323163
- **Release GitHub:** https://github.com/arigony/hand_molecule/releases/tag/v1.0.1

## Citação sugerida

Souto, A. A. (2026). *MolecuAR: a multilingual WebAR molecular visualization tool for chemical education* (Version 1.1.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.21325855

Um arquivo `CITATION.cff` também está incluído no repositório e contém o DOI específico da versão 1.1.0.

## Novidades da versão 1.1.0

- integração efetiva de `molecule-info.css` e `molecule-info.js` ao `index.html`;
- painel inferior expansível com propriedades recuperadas do PubChem;
- exibição de SMILES, massa molar, XLogP, TPSA, solubilidade, propriedades físicas, usos e perigos quando disponíveis;
- conversão de temperaturas para °C quando possível;
- integração de `camera-toggle.js` antes da inicialização do modo AR;
- alternância funcional entre câmera frontal e traseira;
- verificação manual do painel e da troca de câmera em celular;
- atualização dos metadados de citação para v1.1.0;
- arquivamento da versão 1.1.0 no Zenodo.

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
- Three.js 0.160.0
- PubChem PUG REST
- PubChem PUG-View
- Wikidata API
- MediaPipe Tasks Vision / HandLandmarker 0.10.34
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

A versão atual v1.1.0 está arquivada no Zenodo:

```text
https://doi.org/10.5281/zenodo.21325855
```

A versão anterior v1.0.1 permanece disponível em:

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

- Repetir e documentar a matriz de verificação técnica para a versão 1.1.0.
- Atualizar o manuscrito do ChemRxiv com o DOI e os resultados da versão 1.1.0.
- Implementar modo **Mundo AR** com WebXR hit-test.
- Permitir ancoragem da molécula em uma superfície real.
- Criar atividades guiadas para sala de aula.
- Validar o objeto educacional com estudantes.

## Licença

Este projeto está licenciado sob a **MIT License**.

## Autor

Prof. Dr. André Arigony Souto
