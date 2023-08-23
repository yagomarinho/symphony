/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AnyFunction } from './types'

export function resolve<F extends AnyFunction>(f: F, dep?: Parameters<F>) {
  return function get(args?: Parameters<F>): ReturnType<F> {
    const params = (f.length ? [args ? args : dep] : []) as Parameters<F>
    return f(...params)
  }
}

export function singleton<F extends AnyFunction>(f: F, dep?: Parameters<F>) {
  let instance: ReturnType<F>
  return function get(args?: Parameters<F>): ReturnType<F> {
    if (!instance) {
      instance = resolve(f, dep)(args)
    }
    return instance
  }
}
