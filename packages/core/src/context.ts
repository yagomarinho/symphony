/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Broadcast } from './broadcast'
import { Invoke } from './invoker'
import { Pointer, createPointer, getPointer, setPointer } from './pointer'
import { StatePointer } from './state'
import { KeyType, State, Subscription } from './types'

export interface ComponentContext<S = any, D = {}> {
  state: S
  dependencies: D
  subscriptions: { [x: KeyType]: Subscription }
  invoke: Invoke[]
}

export function getContext<S, D extends {}>(
  state: Pointer<S>,
  dependencies: Pointer<D>,
  subscriptions: Pointer,
  invoke: Pointer,
) {
  return (): ComponentContext<S, D> => ({
    state: getPointer(state),
    dependencies: getPointer(dependencies),
    subscriptions: getPointer(subscriptions),
    invoke: getPointer(invoke),
  })
}

export function setContext<S, D extends {}>(
  state: StatePointer<S>,
  dependencies: Pointer<D>,
  subscriptions: Pointer,
  invoke: Pointer,
) {
  return (context: ComponentContext<S, D>) => {
    setPointer(dependencies, context.dependencies)
    setPointer(subscriptions, context.subscriptions)
    setPointer(invoke, context.invoke)
    setPointer(state, context.state)
  }
}

export function createContext<S, D extends {}>(
  state: StatePointer<S>,
  dependencies: Pointer<D>,
  subscriptions: Pointer<{ [key: KeyType]: Subscription }>,
  invoke: Pointer<Invoke[]>,
  broadcast?: Broadcast,
) {
  const get = getContext<S, D>(state, dependencies, subscriptions, invoke)
  const set = setContext<S, D>(state, dependencies, subscriptions, invoke)
  const pending = createPointer(false)

  state.subscribe(() => setPointer(pending, true))

  function _notify() {
    if (getPointer(pending)) {
      broadcast?.notify(getPointer(state))
      setPointer(pending, false)
    }
  }

  return function run<A extends State<ComponentContext<S, D>>>(s: A) {
    const [result, updated] = s(get())
    set(updated)
    _notify()
    return result
  }
}
