import { createAction, createComponent, createInteraction, createReaction } from '../src'

import { createPair } from '../src/pair'
import { createState } from '../src/state'
import { assoc, prop } from '../src/utils'

describe('helpers unit testing', () => {
  it('should manipulate state action using helpers', () => {
    // Define an action to increment the count
    const inc = createAction({
      type: 'state',
      lens: {
        getter: state => prop('count', state),
        setter: (value, state) => assoc('count', value, state),
      },
      pure: function inc(value) {
        return createPair.second(value + 1)
      },
    })

    // Define an action to decrement the count
    const dec = createAction({
      type: 'state',
      lens: {
        getter: state => prop('count', state),
        setter: (value, state) => assoc('count', value, state),
      },
      pure: function dec(value) {
        return createPair.second(value - 1)
      },
    })

    // Define an action to get the current count
    const getCount = createAction({
      type: 'state',
      lens: {
        getter: state => prop('count', state),
        setter: (value, state) => assoc('count', value, state),
      },
      pure: function getCount(value) {
        return createPair.of(value)
      },
    })

    // Actions to be tested
    const actions = {
      inc,
      dec,
      getCount,
    }

    // Initial state for the test
    const initialState = {
      count: 0,
    }

    // Create the component instance with actions and initial state
    const component = createComponent({ actions }, { state: initialState })

    // Test increment action and getCount
    expect(component.inc()).toBeUndefined()
    expect(component.getCount()).toBe(1)

    // Increment count multiple times and check
    component.inc()
    component.inc()
    component.inc()
    expect(component.getCount()).toBe(4)

    // Test decrement action
    expect(component.dec()).toBeUndefined()
    expect(component.getCount()).toBe(3)

    // Decrement count multiple times and check
    component.dec()
    component.dec()
    expect(component.getCount()).toBe(1)

    // Check if initialState still the same
    expect(initialState.count).toBe(0)
  })

  it('should read and return initial state', () => {
    // Define initial state
    const initialState = 'state'

    // Define action to read the current state
    const getState = createAction({
      type: 'reader',
      pure: function getState(state) {
        return state
      },
    })

    // Create the component instance with the getState action and initial state
    const component = createComponent({ actions: { getState } }, { state: initialState })

    // Check if the getState action returns the initial state
    expect(component.getState()).toBe(initialState)
  })

  it('should update state and invoke append', () => {
    // Define initial state
    const initialState = 'state'

    // Define action to read the current state
    const getState = createAction({
      type: 'reader',
      pure: function getState(state) {
        return state
      },
    })

    // Define action to update the state
    const setState = createAction({
      type: 'state',
      pure: function setState(value) {
        return createPair.second(value)
      },
    })

    // Create the component instance with getState and setState actions, and initial state
    const component = createComponent(
      { actions: { getState, setState } },
      { state: initialState },
    )

    // Define action to invoke append and modify the state
    const invokeAppend = createAction({
      type: 'invoke',
      pure: function invokeAppend(value) {
        return createPair.second([{ type: 'append', payload: value }])
      },
    })

    // Define the append function to modify the state using a dependency
    const append = createInteraction({
      lens: {
        dependencies: {
          getter: dependencies => dependencies.component,
        },
      },
      pure: (value, { dependencies: comp }) => {
        const updated = comp.getState() + value
        comp.setState(updated)
        return updated
      },
    })

    // Create an invoker component with invokeAppend and append actions, and a dependency on the main component
    const invoker = createComponent(
      {
        actions: { invokeAppend },
        interactions: { append },
      },
      {
        dependencies: { component },
      },
    )

    // Initial state should be 'state'
    expect(component.getState()).toBe('state')

    // Invoke the action to append ' changed' and update the state
    expect(invoker.invokeAppend(' changed')).toBeUndefined()

    // State should now be 'state changed'
    expect(component.getState()).toBe('state changed')
  })

  it('should perform state reduction', () => {
    // Define initial state with a count property
    const initialState = { count: 0 }

    // Define action for state reduction using a reducer function
    const dispatch = createAction({
      type: 'reducer',
      lens: {
        getter: state => state.count,
        setter: (value, state) => ({ ...state, count: value }),
      },
      pure: function reducer(state, action) {
        switch (action.type) {
          case 'increment':
            return state + 1
          case 'decrement':
            return Math.max(state - 1, 0)
          default:
            return state
        }
      },
    })

    // Define action to read the current count value
    const getCount = createAction({
      type: 'reader',
      lens: {
        getter: state => state.count,
      },
      pure: value => value,
    })

    // Create the component instance with dispatch and getCount actions, and initial state
    const component = createComponent(
      { actions: { dispatch, getCount } },
      { state: initialState },
    )

    // Initial count should be 0
    expect(component.getCount()).toBe(0)

    // Dispatch 'increment' action multiple times and check count
    expect(component.dispatch({ type: 'increment' })).toBeUndefined()
    expect(component.dispatch({ type: 'increment' })).toBeUndefined()
    expect(component.dispatch({ type: 'increment' })).toBeUndefined()
    expect(component.getCount()).toBe(3)

    // Dispatch 'decrement' action multiple times and check count
    expect(component.dispatch({ type: 'decrement' })).toBeUndefined()
    expect(component.dispatch({ type: 'decrement' })).toBeUndefined()
    expect(component.getCount()).toBe(1)

    // Initial state's count should still be 0
    expect(initialState.count).toBe(0)
  })

  it('shouba', () => {
    const initialState = { color: 'blue' }
    const mutable = createState({ changeColorTo: 'blue' })

    const updateColor = createReaction({
      lens: {
        setter: color => ({ color }),
      },
      pure: color => color,
    })

    const getColor = createAction({
      type: 'reader',
      lens: {
        getter: state => state.color,
      },
      pure: color => color,
    })

    function colorChanger(reactions) {
      return mutable.subscribe(({ changeColorTo }) =>
        reactions.updateColor(changeColorTo),
      )
    }

    const component = createComponent(
      {
        actions: { getColor },
        reactions: { updateColor },
      },
      { state: initialState, subscribe: { colorChanger } },
    )

    expect(component.getColor()).toBe('blue')

    mutable(() => createPair.second({ changeColorTo: 'green' }))

    expect(component.getColor()).toBe('green')
  })
})
