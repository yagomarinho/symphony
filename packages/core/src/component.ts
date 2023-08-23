/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createBroadcast } from './broadcast'
import { ComponentContext, createContext } from './context'
import { map } from './functor'
import { Invoke, invoke } from './invoker'
import { createPair } from './pair'
import { Pointer, createPointer, getPointer, setPointer } from './pointer'
import { resolve } from './resolve'
import { resolveAction } from './resolve.action'
import { resolveInteraction } from './resolve.interaction'
import { resolveReaction } from './resolve.reaction'
import { createState } from './state'
import { AnyFunction, KeyType, Subscription } from './types'
import { identity, dispose as utilDispose } from './utils'

export function createComponent(config, init) {
  const _state = createState(init.state)
  const _dependencies = createPointer(init.dependencies)
  const _subscriptions = createPointer<{ [key: KeyType]: Subscription }>({})
  const _invoke = createState<Invoke[]>([])
  const _broadcast = config.observable ? createBroadcast() : undefined

  const context = createPointer(
    createContext(_state, _dependencies, _subscriptions, _invoke, _broadcast),
  )

  const resolvedContext: any = resolve(state => getPointer(context)(state))

  const actions: any = map(mapAction(resolvedContext), config.actions ?? {})
  const interactions: any = map(
    mapInteraction(resolvedContext),
    config.interactions ?? {},
  )
  const reactions: any = map(mapReaction(resolvedContext), config.reactions ?? {})

  _subscriptions(() =>
    createPair.second(map(mapSubscribers(reactions), init.subscribe ?? {})),
  )

  _invoke.subscribe(i => {
    if (i.length) {
      i.forEach(({ type, payload }) => invoke(interactions, type, payload))
      setPointer<Invoke[]>(_invoke, [])
    }
  })

  const dispose = function () {
    _state.dispose()
    _invoke.dispose()
    _broadcast?.dispose()
    map(utilDispose, getPointer(_subscriptions) as any)
    setPointer(_dependencies, undefined)
    setPointer(_subscriptions, undefined)
    setPointer(context, undefined)
  }
  const subscribe = _broadcast?.subscribe
  const unsubscribe = _broadcast?.unsubscribe

  function render() {
    const state = getPointer(_state)
    return (config.view ?? identity)({ state, actions: { ...actions, ...interactions } })
  }

  return {
    ...actions,
    ...interactions,
    dispose,
    render,
    subscribe,
    unsubscribe,
  }
}

export function mapAction<C extends ComponentContext, A extends AnyFunction>(
  context: Pointer<C>,
) {
  return (action: A) => resolveAction(context, action)
}

export function mapInteraction<C extends ComponentContext, A extends AnyFunction>(
  context: Pointer<C>,
) {
  return (interaction: A) => resolveInteraction(context, interaction)
}

export function mapReaction<C extends ComponentContext, A extends AnyFunction>(
  context: Pointer<C>,
) {
  return (interaction: A) => resolveReaction(context, interaction)
}

export function mapSubscribers(reactions: any) {
  return (subscriber: any) => subscriber(reactions)
}
