/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createInjectable } from './injectable'
import { assoc, prop } from './utils'

export function createReaction(def) {
  return function (...payload) {
    return createInjectable(ctx => {
      const s = def.lens?.getter?.(prop('state', ctx)) ?? prop('state', ctx)
      const u = def.pure(...payload, s)
      return assoc('state', def.lens?.setter?.(u, s) ?? u, ctx)
    })
  }
}
