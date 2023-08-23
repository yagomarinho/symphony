/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createInjectable } from './injectable'
import { createPair } from './pair'
import { assoc, prop } from './utils'

export function createAction(def) {
  if (def.type === 'state')
    return function (...payload) {
      return createInjectable(ctx => {
        const s = def.lens?.getter
          ? def.lens.getter(prop('state', ctx))
          : prop('state', ctx)
        const [r, u] = def.pure(...payload, s)
        return createPair(r, assoc('state', def.lens?.setter?.(u, s) ?? u, ctx))
      })
    }

  if (def.type === 'reader')
    return function (...payload) {
      return createInjectable(ctx => {
        const v = def.lens?.getter
          ? def.lens.getter(prop('state', ctx))
          : prop('state', ctx)
        const r = def.pure(...payload, v)
        return createPair(r, ctx)
      })
    }

  if (def.type === 'invoke')
    return function (...payload) {
      return createInjectable(ctx => {
        const v = def.lens?.getter
          ? def.lens.getter(prop('state', ctx))
          : prop('state', ctx)
        const [r, i] = def.pure(...payload, v)
        return createPair(r, assoc('invoke', prop('invoke', ctx).concat(i), ctx))
      })
    }

  if (def.type === 'reducer') {
    return function (action) {
      return createInjectable(ctx => {
        const s = def.lens?.getter
          ? def.lens.getter(prop('state', ctx))
          : prop('state', ctx)
        const u = def.pure(s, action)
        return createPair.second(assoc('state', def.lens?.setter?.(u, s) ?? u, ctx))
      })
    }
  }

  throw new Error(`Invalid Action Type: ${def.type}`)
}
