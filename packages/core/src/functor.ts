/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AnyFunction } from './types'
import { entries, isArray, isFunction, isObject } from './utils'

type FunctorOf<F extends (a: any) => any> = Parameters<F>[0] extends infer A
  ? A | A[] | Record<string | number | symbol, A> | ((...args: any[]) => A)
  : never

type FunctorReturn<F extends (a: any) => any, A> = Parameters<F>[0] extends infer P
  ? A extends P
    ? ReturnType<F>
    : A extends P[]
    ? ReturnType<F>[]
    : A extends Record<string | number | symbol, P>
    ? Record<keyof A, ReturnType<F>>
    : A extends AnyFunction
    ? (...params: Parameters<A>) => ReturnType<F>
    : never
  : never

export function map<F extends (a: any) => any, A extends FunctorOf<F>>(
  f: F,
  a: A,
): FunctorReturn<F, A> {
  return isFunction(a)
    ? (...args) => f(a(...args))
    : isArray(a)
    ? a.map(f)
    : isObject(a)
    ? entries(a).reduce((acc, [desc, value]) => ((acc[desc] = f(value)), acc), {} as any)
    : f(a)
}
