/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createPair } from './pair'
import { createPointer, getPointer, setPointer } from './pointer'
import { Consumer, Subscription } from './types'
import { apply } from './utils'

export interface Broadcast {
  subscribe(consumer: Consumer): Subscription
  unsubscribe(consumer: Consumer): void
  notify(...payload: any[]): void
  dispose(): void
}

export function createBroadcast(...consumers: Consumer[]): Broadcast {
  const _consumers = createPointer<Consumer[]>(consumers)

  function subscribe(consumer: Consumer) {
    function subscription() {
      return unsubscribe(consumer)
    }
    return _consumers(c =>
      createPair(subscription, c.includes(consumer) ? c : c.concat(consumer)),
    )
  }

  function unsubscribe(consumer: Consumer) {
    return _consumers(c => createPair.second(c.filter(el => el !== consumer)))
  }

  function notify(...payload: any[]) {
    return getPointer(_consumers).forEach(apply(...payload))
  }

  function dispose() {
    setPointer(_consumers, [])
  }

  return {
    subscribe,
    unsubscribe,
    notify,
    dispose,
  }
}
