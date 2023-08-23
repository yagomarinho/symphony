/**
 * Copyright (c) Yago Marinho - 2023.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AnyFunction, KeyType } from './types'

export function identity<T>(value: T) {
  return value
}

export function always<T>(value: T) {
  return () => value
}

export function entries<O extends {}>(obj: O): [keyof O, O[keyof O]][] {
  return Object.entries(obj) as any
}

export function isFunction(element: any): element is AnyFunction {
  return typeof element === 'function'
}

export function isArray(element: any): element is any[] {
  return element instanceof Array
}

export function isObject(element: any): element is {} {
  return element instanceof Object && !isArray(element) && element !== null
}

export function prop<K extends KeyType, O extends Record<K, unknown>>(
  key: K,
  obj: O,
): O[K] {
  return obj[key]
}

export function assoc<K extends KeyType, V, O extends {}>(
  key: K,
  value: V,
  obj: O,
): O & { [Key in K]: V } {
  return concatenate(obj, { [key]: value }) as any
}

export function filterByKey<K extends KeyType, O extends Record<K, unknown>>(
  key: K,
  obj: O,
): Omit<O, K> {
  return entries(obj).reduce(
    (acc, [descriptor, command]) =>
      descriptor === key ? acc : { ...acc, [descriptor]: command },
    {} as any,
  )
}

export function concatenate<A extends {}, B extends {}>(a: A, b: B): A & B {
  return {
    ...a,
    ...b,
  }
}

export function dispose(subscription: () => void) {
  return subscription()
}

export function apply<A extends any[]>(...payload: A) {
  return <F extends (...args: A) => any>(fn: F): ReturnType<F> => fn(...payload)
}
