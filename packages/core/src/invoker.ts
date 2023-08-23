/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AnyFunction, KeyType } from './types'
import { assoc, filterByKey, prop } from './utils'

export interface Invoker {
  [descriptor: KeyType]: AnyFunction
}

export interface Invoke {
  type: string
  payload: any
}

export function add<I extends Invoker, T extends KeyType, C>(
  invoker: I,
  type: T,
  command: C,
): I & { [Key in T]: C } {
  return assoc(type, command, invoker)
}

export function remove<I extends Invoker, T extends KeyType>(
  invoker: I,
  type: T,
): Omit<I, T> {
  return filterByKey(type, invoker)
}

export function invoke<I extends Invoker, T extends KeyType, P>(
  invoker: I,
  type: T,
  payload?: P,
): T extends keyof I ? ReturnType<I[T]> : never {
  return prop(type, invoker)(payload)
}
