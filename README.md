# Symphony JS

A Symphony é uma biblioteca que tem como objetivo simplificar significativamente a criação e a gestão de componentes em ecossistemas JavaScript, tanto no backend quanto no frontend. Com uma ênfase em programação funcional, a lib oferece uma abordagem que prioriza a construção de componentes por meio de práticas de programação funcional, permitindo que os desenvolvedores alcancem um alto nível de modularidade, reusabilidade e clareza em seus projetos.

## Objetivos Iniciais

1. Developer Friendly: A Symphony JS está sendo pensada e projetada com foco na experiência do desenvolvedor. Sua abordagem precisa ser simplificada e orientada à programação funcional oferecendo um ambiente onde os desenvolvedores podem se concentrar na lógica do componente em vez de se perder em complexidades técnicas como ocorre na utilização de frameworks atuais.

2. Dependencies Free: Outro ponto fundamental será sua independência de libs externas. Ao adotar essa abordagem, quero minimizar conflitos e problemas de compatibilidade relacionados a bibliotecas de terceiros, reduzindo a possibilidade de interações inesperadas. Isso também resulta em projetos mais enxutos e eficientes, onde os desenvolvedores não precisam se preocupar com a gestão excessiva de pacotes externos, resultando em um código mais limpo e confiável.

3. Código Declarativo: Ao escrever código declarativo, os desenvolvedores descrevem "o que" um componente deve fazer, em vez de "como" ele deve fazer. Isso simplifica o processo de desenvolvimento, tornando o código mais legível e compreensível.

## Instalação

Instalação via npm

```bash
 npm install @symphony.js/core
```

## Documentação

_A documentação será lançada em breve_

## Exemplos

Este é um exemplo de um componente de contador que contém os 3 principais elementos de um componente State > View > Action

```javascript
import { createAction, createComponent } from '@symphony.js/core'

const initialState = { count: 0 }

const identity = x => x
const countLens = {
  getter: state => state.count,
  setter: (value, state/*passado como ultimo parametro*/) => ({ count: value }),
}

const getCount = createAction({
  type: 'reader',
  lens: countLens,
  pure: identity, // Reader Signature :: s => a
})

const increment = createAction({
  type: 'state',
  lens: countLens,
  pure: count => [undefined, count + 1], // State Signature :: s => [a, s]
})

const decrement = createAction({
  type: 'state',
  lens: countLens,
  pure: count => [undefined, count - 1], // State Signature :: s => [a, s]
})

const stringView = (state, actions) => `<div>Valor atual: ${state.count}</div>`

const config = {
  actions: {
    getCount,
    increment,
    decrement,
  },
  view: stringView,
}

const init = {
  state: initialState,
}

const component = createComponent(config, init)

component.getCount() // log 0
component.increment() // result undefined state.count 1
component.increment() // result undefined state.count 2
component.increment() // result undefined state.count 3
component.decrement() // result undefined state.count 2
component.decrement() // result undefined state.count 1

initialState.count // log 0 Immutable

component.render() // `<div>Valor atual: 1</div>`
```
