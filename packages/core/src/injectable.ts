/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { always, isFunction } from './utils'
import { AnyFunction } from './types'

export interface Injectable<F extends AnyFunction = AnyFunction> {
  (...args: Parameters<F>): ReturnType<F>
  isInjectable(): true
}

export function createInjectable<F extends AnyFunction>(f: F): Injectable<F> {
  function injectable(this: any, ...args: Parameters<F>) {
    return f.apply(this, args)
  }

  injectable.isInjectable = always<true>(true)

  return injectable
}

export function isInjectable(element: any): element is Injectable {
  return isFunction(element) && (element as any).isInjectable?.()
}
