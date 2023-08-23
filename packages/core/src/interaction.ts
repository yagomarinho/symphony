/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createInjectable } from './injectable'
import { prop } from './utils'

export function createInteraction(def) {
  return function (...payload) {
    return createInjectable(ctx => {
      const s = def.lens?.state?.getter?.(prop('state', ctx)) ?? prop('state', ctx)
      const d =
        def.lens?.dependencies?.getter?.(prop('dependencies', ctx)) ??
        prop('dependencies', ctx)
      return def.pure(...payload, { state: s, dependencies: d })
    })
  }
}
