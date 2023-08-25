# Symphony JS

A Symphony é uma biblioteca que tem como objetivo simplificar significativamente a criação e a gestão de componentes em ecossistemas JavaScript, tanto no backend quanto no frontend. Com uma ênfase em programação funcional, a lib oferece uma abordagem que prioriza a construção de componentes por meio de práticas de programação funcional, permitindo que os desenvolvedores alcancem um alto nível de modularidade, reusabilidade e clareza em seus projetos.

## Objetivos Iniciais

1. Developer Friendly: A Symphony JS está sendo pensada e projetada com foco na experiência do desenvolvedor. Sua abordagem precisa ser simplificada e orientada à programação funcional oferecendo um ambiente onde os desenvolvedores podem se concentrar na lógica do componente em vez de se perder em complexidades técnicas como ocorre na utilização de frameworks atuais.

2. Dependencies Free: Outro ponto fundamental será sua independência de libs externas. Ao adotar essa abordagem, quero minimizar conflitos e problemas de compatibilidade relacionados a bibliotecas de terceiros, reduzindo a possibilidade de interações inesperadas. Isso também resulta em projetos mais enxutos e eficientes, onde os desenvolvedores não precisam se preocupar com a gestão excessiva de pacotes externos, resultando em um código mais limpo e confiável.

3. Código Declarativo: Ao escrever código declarativo, os desenvolvedores descrevem "o que" um componente deve fazer, em vez de "como" ele deve fazer. Isso simplifica o processo de desenvolvimento, tornando o código mais legível e compreensível.

## Instalação

Instalação via `npm`

```bash
 npm install @symphony.js/core
```

Instalação via `yarn`

```bash
 yarn add @symphony.js/core
```

## Documentação

_A documentação será lançada em breve_

## Exemplos

Este é um exemplo de um componente de contador que contém os 3 principais elementos de um componente `State > View > Action`

```javascript
import { createAction, createComponent } from '@symphony.js/core'

const initialState = { count: 0 }

const identity = x => x
const countLens = {
  getter: state => state.count,
  setter: (value, state /*passado como ultimo parametro*/) => ({ count: value }),
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

## APIs disponíveis

### createComponent(config, init): Component

A função `createComponent` é usada para instanciar um componente symphony, sendo sua função principal gerenciar o contexto do componente, promovendo injeção de dependência em tempo de execução para todos os elementos presentes no cenário de utilização de um componente.

#### Como usar?

```javascript
import { createComponent } from '@symphony.js/core'

const config = {
  // definições de configuração do componente
}

const init = {
  // definições de inicialização do componente
}

const component = createComponent(config, init) // Instância do componente
```

#### Argumentos da função

`config`: é um objeto que contém as definições essenciais do componente. Dentro deste objeto, pode-se definir as Actions que irão compor o componente (elas podem ser divididas em actions | interactions | reactions); a View, que determina a renderização do estado do componente e suas respectivas ações; e por fim pode-se definir se o componente possuirá o comportamento de um elemento observável (Observable), atributo importante para integração com outros elementos em termos de programação reativa.

```javascript
  /**
   * No modelo tradicional de arquitetura "one-way data flow" é comum
   * encontramos referências a subdivisão de um componente em 3 partes
   * essenciais:
   *
   * - State
   * - View
   * - Action
   *
   * Conforme vamos inserindo funcionalidades em nossa aplicação percebemos
   * que a manutenção dessa subdivisão em 3 simples partes começa a ficar um
   * tanto quanto difícil de manter.
   *
   * E foi pensando exatamente na dificuldade de manutenção destas partes
   * que projetei a lib pensando não apenas no isolamento do componente, senão
   * na forma como o componente interage com a aplicação como um todo.
   *
   * Por mais que se possa entender que a forma como um elemento externo ao
   * componente interage com ele seja categorizado como um "ação", entendo que
   * não possa ser tratado da mesma forma. E para reparar esse conflito
   * separei as ações em outra subdivisão que será compreendida mais tarde. São
   * elas:
   *
   * - Actions (interações internas do componente com seu próprio estado);
   * - Interactions (interações com outros elementos externos, seja um outro
   *   componente ou uma simples função);
   * - Reactions (interação de reatividade a mudanças no ambiente externo que
   *   reflete no estado e no comportamento do componente).
   */

const config = {

  actions?: {
    // [descriptor: string | number | symbol]: Action
  },

  interactions?: {
    // [descriptor: string | number | symbol]: Interaction
  },

  reactions?: {
    // [descriptor: string | number | symbol]: Reaction
  },

  view?: (state, actions) => `${state}` //(state, actions) => any,

  observable?: true //boolean,
}
```

`init` é um objeto que contém as definições de inicialização da instância do componente. Nele pode-se definir o estado inicial, as dependências do componente e também as "subscriptions, ou listeners" as quais o componente estará sujeito durante seu ciclo de vida.

```javascript
const init = {

  state: 'initial state' // any,

  dependencies: {
    // [descriptor: string | number | symbol]: any
  },

  subscribe: {
    // [descriptor: string| number | symbol]:
    //        (reactions) => Subscription :: () => void
  }
}
```

#### Component (Instance)

```javascript
// Toda inicialização do componente aqui...

const actions = {
  getState,
  setState,
}

const interactions = {
  interactWith,
}

const component = createComponent({ actions, interactions }, init)

/**
 * component: {
 *  ...actions,
 *  ...interactions,
 * }
 */

component.getState()
component.setState()
component.interactWith()

// Se o component possuir ou não uma view definida na configuração
// ele terá o método render disponível, apenas com a diferença
// de que, caso não seja passado nenhuma view, o método render
// retorna um objeto com state e actions

const { state, actions } = component.render()

const stringView = (state, actions) => 'view'
const anotherComponent = createComponent({ view: stringView }, init)

anotherComponent.render() // 'view'

// Utilizando componentes observáveis

const observable = createComponent({ observable: true /*...*/ }, init)

const subscription = observable.subscribe(consumer)

// métodos de cancelamento de inscrição

subscription() // consumer off
observable.unsubscribe(consumer) // ou, essa outra alternativa


component.dispose()
component.getState() // to throw
```
