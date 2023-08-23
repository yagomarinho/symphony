/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createBroadcast } from './broadcast'
import { Pointer, createPointer, getPointer, setPointer } from './pointer'
import { Consumer, First, State, Subscription } from './types'

export interface StatePointer<S> extends Pointer<S> {
  subscribe(consumer: Consumer<S>): Subscription
  unsubscribe(consumer: Consumer<S>): void
  dispose(): void
}

export function createState<T>(initial: T): StatePointer<T> {
  const ref = createPointer(initial)
  const _broadcast = createBroadcast()

  function state<S extends State<T>>(s: S): First<S> {
    const [result, updatedState] = s(getPointer(ref))

    if (updatedState !== getPointer(ref)) {
      setPointer(ref, updatedState)
      _broadcast.notify(updatedState)
    }

    return result
  }

  state.subscribe = _broadcast.subscribe
  state.unsubscribe = _broadcast.unsubscribe
  state.dispose = function () {
    _broadcast.dispose()
    setPointer(ref, undefined)
  }

  return state
}
