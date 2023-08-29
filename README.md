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

// const consumer = () => { ... }

// método de inscrição de um consumer
const subscription = observable.subscribe(consumer)

// métodos de cancelamento de inscrição
subscription() // consumer off
observable.unsubscribe(consumer) // ou, essa outra alternativa

// Finalizando o ciclo de vida do componente
component.dispose()
component.getState() // to throw
```

### createInjectable(fnToInject): Injectable

A função `createInjectable` possibilita a criação de funções marcadas como **injetáveis (Injectable)**, permitindo a injeção de dependência em tempo de execução nas ações dos componentes Symphony. Esse recurso é crucial para garantir que as ações dos componentes possam interagir com o contexto mais amplo do componente de forma flexível, usando recursos externos ou serviços, sem a necessidade de um acomplamento rígido entre os componentes individuais.

```javascript
import { createInjectable, createComponent } from '@symphony.js/core'

const initialState = { count: 0 }

function getCount() {
  /**
   * getCountToInject é a função que fará uso do estado do componente
   * e retornará o valor do contador
   */
  function getCountToInject(context) {
    // O contexto do componente possui o estado
    const { state } = context

    // As "Actions" possuem a assinatura de state
    // monad | state => [result, state]
    // o que será explicado em breve
    return [state.count, context]
  }

  return createInjectable(getCountToInject)
}

const config = {
  actions: {
    getCount,
  },
}

const init = {
  state: initialState,
}

const component = createComponent(config, init)

/**
 * Internamente na função createComponent, o resultado da função getCount
 * será empurrado para um resolver que analisará se o retorno da função
 * é uma função injetavél e então poderá prover, em tempo de execução, o
 * contexto do componente. Retornando apenas a computação final.
 */
component.getCount() // log 0 (zero)
```

Percebe-se pelo exemplo anterior que, o Symphony baseia-se em uma abordagem de "function composition" (composição de funções) como pedra angular de sua arquitetura. Isso significa que as funções são projetadas para serem puras e independentes, tornando o código mais legível, testável e modular. Através do uso das funções injetáveis e dos componentes, o Symphony promove uma arquitetura mais robusta e flexível, que facilita a construção e manutenção de aplicações complexas.

Uma parte crucial para o entendimento dessa arquitetura são os monads em teoria das categorias, que é facilmente percebida na assinatura das Actions dos componentes. As assinaturas de ações seguem o padrão `State<S, A> = (state: S) => [A, S]`, onde o estado é recebido como entrada e, após a execução da ação, tanto o resultado quanto o estado modificado são retornados como uma lista. Isso permite uma composição fluente de ações, onde o resultado de uma ação pode ser encadeado como entrada para outra, mantendo uma manipulação clara e controlada do estado.

#### E porque monads são tão importantes?

Eles oferecem uma maneira de estruturar o código de forma eficaz, permitindo a composição de operações complexas de maneira limpa e controlada. Em um cenário sem monads, abordagens alternativas como a mutabilidade direta dos componentes ou o uso de reducers poderiam ser empregadas. No entanto, essas abordagens muitas vezes levam a problemas como efeitos colaterais indesejados, dificuldade na rastreabilidade de mudanças e maior complexidade de código, principalmente quando se trata de composição de funções. Como no exemplo abaixo:

```javascript
/**
 * A função abaixo, chamada 'compose', oferece uma maneira poderosa
 * de compor várias funções em uma única função resultante. Isso permite
 * encadear os resultados das funções, da direita para a esquerda, formando
 * uma composição funcional. O primeiro argumento dessa função é a função
 * que receberá a entrada original, e os argumentos subsequentes são as
 * funções que serão aplicadas sucessivamente aos resultados, criando uma
 * cadeia de transformações.
 */
function compose(...fns) {
  return x => fns.reduceRight((v, f) => f(v), x)
}

// Por exemplo, criaremos uma transformação de string
const split = x => x.split('')
const reverse = x => x.reverse()
const join = x => x.join('')

// Este seria um exemplo simples de uma cadeia de transformações
// onde seria possível aplicar a composição de funções
//
// obs.: a ordem da cadeia deve ser lido da direita para a esquerda
const reverseString = compose(join, reverse, split)

/**
 * No entanto, quando trabalhamos com reducers, essa composição funcional
 * pode ser prejudicada devido à natureza própria do reducer. Reducers são
 * geralmente usados para processar ações e atualizar o estado em um cenário
 * de gerenciamento de estado, como o Redux. Esses processos podem envolver
 * lógicas condicionais complexas, o que pode tornar a composição de funções
 * menos elegante.
 *
 * O exemplo abaixo ilustra uma composição de reducers que lida com
 * diferentes tipos de ações, introduzindo condições que podem dificultar a
 * aplicação da composição funcional.
 */

function nameReducer(state, action) {
  switch (action.type) {
    case 'name':
      return { ...state, name: action.payload }
    default:
      return state
  }
}

function emailReducer(state, action) {
  switch (action.type) {
    case 'email':
      return { ...state, email: action.payload }
    default:
      return state
  }
}

function phoneReducer(state, action) {
  switch (action.type) {
    case 'phone':
      return { ...state, phone: action.payload }
    default:
      return state
  }
}

/**
 * Caso fosse necessário realizar uma operação de composição de função com reducer
 * seria dificultado pela própria natureza incompátivel
 */

const updateRegistration = compose(phoneReducer, emailReducer, nameReducer) // ERROR

/**
 * Essa dificuldade não significa que seja impossível de realizar, como disse
 * anteriormente, com uma maior complexidade de código pode-se chegar ao mesmo
 * resultado.
 *
 * Entretanto, quando trabalhamos com monads, podemos aproveitar os benefícios
 * da composição funcional e da atualização controlada do estado. Monads oferecem
 * um paradigma onde cada operação retorna uma estrutura especial, permitindo
 * controlar como os dados fluem e evitando efeitos colaterais indesejados.
 * Isso é especialmente útil em cenários onde múltiplas transformações precisam
 * ser aplicadas ao estado, mantendo a clareza e previsibilidade.
 */

function updateName(props) {
  return state => [props, { ...state, name: props.name }]
}

function updateEmail(props) {
  return state => [props, { ...state, email: props.email }]
}

function updatePhone(props) {
  return state => [props, { ...state, phone: props.phone }]
}

/**
 * No caso de monads, composição de funções podem ser facilmente estabelecidas
 * com uma ou duas funções auxiliares, e como se percebe nas funções acima
 * estabelecidas, cada uma delas é legível, testável e modular.
 */

const bind = fmap => monad => {
  return state => {
    const [result1, updatedState1] = monad(state)
    return fmap(result1)(updatedState1)
  }
}

const updateRegistration = props =>
  compose(bind(updatePhone), bind(updateEmail))(updateName(props))

const result = updateRegistration({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+999 9999 999',
})({
  /*initialState here*/
}) // OK!
```

É importante ressaltar que, como usuário da Symphony, você não precisa se preocupar em resolver essas complexas composições por conta própria. Afinal, esse é o propósito central da biblioteca: oferecer uma abstração que cuida desses detalhes intricados para você. No entanto, é valioso entender que essas estruturas subjacentes constituem os alicerces da arquitetura da Symphony.

Dito isso, vamos analisar como aplicar o uso da função `createInjectable` nas três subdivisões de `actions` do componente, presentes na construção de uma instância.

#### Action

A primeira e mais natural subdivisão das `actions` em um componente Symphony é a `Action`. Essa subdivisão é parte integrante da tríade `state > view > action`, sendo responsável por gerar modificações no estado e, por consequência, alterações na visualização do componente.

Conforme discutido anteriormente, a assinatura padrão para uma Action segue o padrão da State Monad:

```typescript
type State<S, A> = (state: S) => [A, S]
```

Nesse contexto:

- `(s)` representa o contexto atual do componente.
- `(a)` é o resultado da ação.
- O retorno da função é uma tupla `(a, s)`, onde a é o resultado da ação e s é o novo contexto após a ação.

Para ilustrar melhor como criar e usar uma action injetável, considere o exemplo a seguir:

```javascript
import { createComponent, createInjectable } from '@symphony.js/core'

const initialState = {
  user: {
    name: 'John Doe',
  },
}

// Action para obter o nome do usuário
function getUserName() {
  function getUserNameToInject(context) {
    const { user } = context.state

    // Retorna o nome do usuário como resultado da ação
    // e mantém o contexto inalterado (nenhuma atualização no contexto)
    return [user.name, context]
  }

  return createInjectable(getUserNameToInject)
}

// Action para definir o nome do usuário
function setUserName(name) {
  function setUserNameToInject(context) {
    const { state } = context // get state
    const { user } = state // get user

    // update context
    const updatedContext = {
      ...context,
      state: {
        ...state,
        user: {
          ...user,
          name, // set updated name
        },
      },
    }

    // Retorna 'undefined' como resultado da ação (nenhum resultado específico)
    // e retorna o novo contexto atualizado
    return [undefined, updatedContext]
  }

  return createInjectable(setUserNameToInject)
}

const config = {
  actions: {
    getUserName,
    setUserName,
  },
}

const init = {
  state: initialState,
}

const component = createComponent(config, init)

component.getUserName() // log 'John Doe'
component.setUserName('Jane Doe') // result undefined state.user.name === 'Jane Doe'
component.getUserName() // log 'Jane Doe'
```

Essas ações exemplificam como criar e usar as actions injetáveis no contexto do ecossistema Symphony. A primeira ação, `getUserName`, retorna o nome do usuário a partir do estado atual do componente, sem realizar nenhuma alteração no contexto. A segunda ação, `setUserName`, atualiza o nome do usuário no estado do componente e retorna o contexto atualizado.

#### Interaction

A segunda subdivisão das `actions` em um componente Symphony é conhecida como `Interaction`. Essa subdivisão tem como objetivo principal facilitar a interação entre o componente e o ambiente externo. Em alguns padrões de desenvolvimento, essas ações também podem ser chamadas de controladores, mediadores, entre outros termos.

Uma característica fundamental dessas Interactions é a sua capacidade de interagir com elementos fora do escopo do componente, como serviços externos, APIs, eventos do sistema ou qualquer recurso que não seja diretamente controlado pelo componente. Isso proporciona uma maneira organizada e desacoplada de gerenciar a comunicação entre o componente e o ambiente externo.

É importante observar que, enquanto as `Actions` seguem a assinatura padrão da `State Monad (State s a => s -> (a, s))`, o que implica em retornar uma tupla com o resultado da ação e o estado atualizado, as Interactions têm um foco diferente. Elas frequentemente precisam lidar com operações assíncronas, como chamadas de rede, espera por eventos externos ou processamento demorado. Portanto, a rigidez da assinatura State Monad síncrona pode ser inadequada para esse cenário.

Para acomodar operações assíncronas, as Interaction Actions adotam uma abordagem que se baseia na assinatura da Reader Monad:

```typescript
type Reader<E, A> = (env: E) => A
```

Nesse contexto:

- `(e)` representa o contexto do componente que será lido para fornecer as informações necessárias para ação externa.
- `(a)` é o resultado da interação.
- A função retorna o resultado da interação com base no contexto fornecido, que pode incluir informações sobre o estado do componente, configurações e outros dados relevantes.

Para ilustrar melhor como criar e usar uma interaction injetável, considere o exemplo a seguir:

```javascript
import { createComponent, createInjectable } from '@symphony.js/core'

const initialState = {
  /* Declare State Here */
}

function save() {
  function saveStateInteractionToInject(context) {
    const { state, dependencies } = context

    // Chama a função 'persistenceStorage' definida nas dependências
    // para persistir o estado atual do componente
    return dependencies.persistenceStorage(state)
  }

  return createInjectable(saveStateInteractionToInject)
}

// Função assíncrona para simular a operação de persistência do estado
async function persistenceStorage(state) {
  // operação para persistir o estado aqui

  const computation = {
    // representação do resultado da operação
  }

  return computation
}

const config = {
  actions: {
    /* Declare Actions Here */
  },
  interactions: {
    save,
  },
}

const init = {
  state: initialState,
  dependencies: {
    persistenceStorage,
  },
}

const component = createComponent(config, init)

// Faça as mudanças no estado através das actions
// component.setState(...)
// component.setState(...)

// Inicie a interação 'save' e trate o resultado assíncrono, se necessário
component.save().then(/*computation result*/)
```

Neste exemplo estendido, a interação save demonstra como empregar uma interação injetável. Essa interação pode envolver comportamento síncrono ou assíncrono, neste caso do exemplo, assíncrono, pois ela invoca a função `persistenceStorage`, que simula a persistência dos dados de estado do componente. A chamada component.save() inicia a interação, e a promessa resultante permite gerenciar o resultado da interação assim que a operação assíncrona for concluída.

#### Reaction

A última, e não menos importante, subdivisão das `actions` em um componente Symphony é a `Reaction`.

### Helper Functions

#### createAction(definition): Injectable

Como evidenciado, o processo de criação de uma `action` pode ser considerado repetitivo, seguindo um algoritmo de fácil compreensão:

1. ler o estado presente no contexto
2. realizar a operação
3. atualizar o contexto
4. retornar a combinação entre resultado e contexto atualizado

Devido a essa repetição, a API `createAction` foi disponibilizada para simplificar a construção de actions, eliminando a necessidade de reproduzir essas etapas em cada função. Vamos examinar como essa API funciona para otimizar esse processo:

```javascript
import { createAction, createComponent } from '@symphony.js/core'

const initialState = {
  user: {
    name: 'John Doe',
  },
}

const identity = x => x

const userNameLens = {
  getter: state => state.user.name,
  setter: (name, state) => ({ ...state, user: { ...state.user, name } }),
}

const getUserName = createAction({
  type: 'reader',
  lens: userNameLens,
  pure: identity,
})
```

#### createInteraction(definition): Injectable

#### createReaction(definition): Injectable
