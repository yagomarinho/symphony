/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export type AnyFunction = (...args: any[]) => any

export interface State<S = any, A = any> {
  (state: S): [A, S]
}

export type First<S extends State> = ReturnType<S>[0]
export type Second<S extends State> = ReturnType<S>[1]

export type KeyType = string | number | symbol

export interface Consumer<S = any> {
  (state: S): any
}

export interface Subscription {
  (): void
}
