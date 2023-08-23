/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export type Pair<A, B> = [A, B]

export function createPair<A, B>(a: A, b: B): Pair<A, B> {
  return [a, b]
}

createPair.first = function first<A>(a: A) {
  return createPair(a, undefined)
}

createPair.second = function second<B>(b: B) {
  return createPair(undefined, b)
}

createPair.of = function of<V>(value: V) {
  return createPair(value, value)
}
