/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ComponentContext } from './context'
import { isInjectable } from './injectable'
import { Pointer } from './pointer'
import { AnyFunction } from './types'

export function resolveReaction<C extends ComponentContext, A extends AnyFunction>(
  context: Pointer<C>,
  action: A,
) {
  return (...payload: Parameters<A>) =>
    context(current => [undefined, evaluate(action(...payload))(current)])
}

function evaluate<T>(result: T) {
  return function bind<C extends ComponentContext>(current: C): any {
    if (isInjectable(result)) {
      const r = result(current)
      return evaluate(r)(current)
    }

    return result
  }
}
