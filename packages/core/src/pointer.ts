/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createPair } from './pair'
import { First, State } from './types'

export interface Pointer<T = any> {
  <S extends State<T>>(state: S): First<S>
}

export function createPointer<T>(initial: T): Pointer<T> {
  let ref = initial

  return function pointer<S extends State<T>>(state: S): First<S> {
    const [r, u] = state(ref)

    if (ref !== u) ref = u

    return r
  }
}

export function getPointer<T>(pointer: Pointer<T>): T {
  return pointer(value => createPair.of(value))
}

export function setPointer<T>(pointer: Pointer<T>, value: T): void {
  return pointer(() => createPair.second(value))
}
