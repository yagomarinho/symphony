/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ComponentContext } from './context'
import { isInjectable } from './injectable'
import { createPair } from './pair'
import { Pointer } from './pointer'
import { AnyFunction } from './types'
import { isFunction } from './utils'

export type Env<C extends ComponentContext> = {
  context: Pointer<C>
  current: C
}

export function resolveAction<C extends ComponentContext, A extends AnyFunction>(
  context: Pointer<C>,
  action: A,
) {
  return (...payload: Parameters<A>) => context(runEvaluate(action(...payload), context))
}

function evaluate<T>(result: T) {
  return function bind<C extends ComponentContext>({
    context,
    current,
  }: Env<C>): [any, C] {
    if (isInjectable(result)) {
      const [a, s] = result(current)
      return evaluate(a)({ context, current: s })
    }

    if (isFunction(result)) {
      return createPair(resolveAction(context, result), current)
    }

    return createPair(result, current)
  }
}

function runEvaluate<C extends ComponentContext, T>(result: T, context: Pointer<C>) {
  return (current: C) => evaluate(result)({ context, current })
}
