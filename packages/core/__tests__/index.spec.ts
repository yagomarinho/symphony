import { createComponent, createInjectable } from '../src'
import { ComponentContext } from '../src/context'
import { createPair } from '../src/pair'
import { createState } from '../src/state'
import { concatenate } from '../src/utils'

describe('Component Unit Testing', () => {
  it('should correctly update count using component actions', () => {
    // Initial state with count set to 0
    const initialState = { count: 0 }

    // Action to increment count
    function inc() {
      return createInjectable((ctx: ComponentContext<typeof initialState>) =>
        createPair.second(concatenate(ctx, { state: { count: ctx.state.count + 1 } })),
      )
    }

    // Action to decrement count
    function dec() {
      return createInjectable((ctx: ComponentContext<typeof initialState>) =>
        createPair.second(concatenate(ctx, { state: { count: ctx.state.count - 1 } })),
      )
    }

    // Action to get the current count
    function getCount() {
      return createInjectable((ctx: ComponentContext<typeof initialState>) =>
        createPair(ctx.state.count, ctx),
      )
    }

    // Actions object containing all defined actions
    const actions = {
      inc,
      dec,
      getCount,
    }

    // Create the component with initial state and actions
    const component = createComponent({ actions }, { state: initialState })

    // Test increment action
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

  it('should invoke a mediator function to manage status updates for another component', () => {
    // Initial status set to 'ready'
    const initialState = { status: 'ready' }

    // Action to set status to 'loading'
    function loading() {
      return createInjectable(ctx =>
        createPair.second(concatenate(ctx, { state: { status: 'loading' } })),
      )
    }

    // Action to get status from component
    function getStatus() {
      return createInjectable(ctx => createPair(ctx.state.status, ctx))
    }

    const actions = {
      loading,
      getStatus,
    }

    // Create the main component with initial status and actions
    const component = createComponent({ actions }, { state: initialState })

    // Action to simulate a button click that triggers loading
    function click() {
      return createInjectable(ctx =>
        createPair.second(concatenate(ctx, { invoke: [{ type: 'loadingStatus' }] })),
      )
    }

    // Action to handle loading status by invoking the main component's loading action
    function loadingStatus() {
      return createInjectable(ctx => ctx.dependencies.component.loading())
    }

    // Actions for the button component
    const buttonActions = {
      click,
    }

    // Interactions for the button component
    const interactions = {
      loadingStatus,
    }

    // Dependencies for the button component
    const dependencies = {
      component,
    }

    const button = createComponent(
      {
        actions: buttonActions,
        interactions,
      },
      { dependencies },
    )

    // Check initial status
    expect(component.getStatus()).toBe('ready')

    // Invoke button click action
    expect(button.click()).toBeUndefined()

    // Check updated status
    expect(component.getStatus()).toBe('loading')
  })

  it('should update color when triggered by another element', () => {
    // Initial state of the component
    const initialState = { color: 'blue' }

    // Create a mutable state for triggering color changes
    const mutable = createState({ changeTo: '' })

    // Action to change the color of the component
    function changeColor({ color }) {
      return createInjectable(ctx =>
        concatenate(ctx, { state: concatenate(ctx.state, { color }) }),
      )
    }

    // Action to get the current color
    function getColor() {
      return createInjectable(ctx => createPair(ctx.state.color, ctx))
    }

    // Reaction to the color changer function
    function colorChanger(reactions) {
      const changeColorReaction = reactions.changeColor

      function consumer({ changeTo }) {
        changeColorReaction({ color: changeTo })
      }

      return mutable.subscribe(consumer)
    }

    // Actions available for the component
    const actions = {
      getColor,
    }

    // Reactions triggered by external changes
    const reactions = {
      changeColor,
    }

    // Subscriptions for external interactions
    const subscribe = {
      colorChanger,
    }

    // Create the main component
    const component = createComponent(
      { actions, reactions },
      {
        state: initialState,
        subscribe,
      },
    )

    // Check initial color
    expect(component.getColor()).toBe('blue')

    // Trigger a change in color using the mutable state
    mutable(() => createPair.second({ changeTo: 'green' }))

    // Check if the color has been updated
    expect(component.getColor()).toBe('green')

    // Dispose of the component's subscriptions
    component.dispose()

    // Attempt to change the color after the component is disposed
    mutable(() => createPair.second({ changeTo: 'red' }))

    // Since the component is disposed, the color should remain 'green'
    expect(() => component.getColor()).toThrow()
  })

  it('should render internal state and actions in the view function', () => {
    // Initial state of the component
    const initialState = { status: 'ready' }

    // View function to render the state and actions
    function view({ state, actions }) {
      return { state, actions }
    }

    // Action to change the status
    function changeStatus(status) {
      return createInjectable(ctx =>
        createPair.second(concatenate(ctx, { state: { status } })),
      )
    }

    // Actions available for the component
    const actions = {
      changeStatus,
    }

    // Create the component with initial state and actions
    const component = createComponent({ actions, view }, { state: initialState })

    // Render the component's view
    const rendered = component.render()

    // Initial render checks
    expect(rendered).toEqual(expect.objectContaining({ state: initialState }))
    expect(rendered).toHaveProperty('actions')

    // Change the status using the action
    component.changeStatus('finished')

    // Render the component's view again after the status change
    const rerendered = component.render()

    // Check if the state change is reflected in the rendered view
    expect(rerendered).toEqual(expect.objectContaining({ state: { status: 'finished' } }))
    expect(rerendered).toHaveProperty('actions')
  })

  it('should update state and notify consumers', () => {
    const initialState = { status: 'ready' }

    // Function to simulate changing the status
    function setStatus(status) {
      return createInjectable(ctx =>
        createPair.second(concatenate(ctx, { state: { status } })),
      )
    }

    // Function to simulate getting the status
    function getStatus() {
      return createInjectable(ctx => createPair(ctx.state.status, ctx))
    }

    // Actions to be tested
    const actions = {
      setStatus,
      getStatus,
    }

    // Create the component instance with initial state and actions
    const component = createComponent(
      { observable: true, actions },
      { state: initialState },
    )

    // Mock function to track consumer calls
    const consumer = jest.fn()

    // Subscribe the consumer to the component
    const subscription = component.subscribe(consumer)

    // Change the status to 'changed'
    component.setStatus('changed')

    // Verify that the consumer was called with the updated status
    expect(consumer).toHaveBeenLastCalledWith({ status: 'changed' })

    // Change the status to 'finished'
    component.setStatus('finished')

    // Verify that the consumer was called with the new status
    expect(consumer).toHaveBeenLastCalledWith({ status: 'finished' })

    // Clear the mock function to prepare for the next test
    consumer.mockClear()

    // Unsubscribe the consumer
    subscription()

    // Change the status to 'non-called'
    component.setStatus('non-called')

    // Verify that the consumer was not called after unsubscribing
    expect(consumer).not.toHaveBeenCalled()

    // Verify that the status can still be retrieved using getStatus()
    expect(component.getStatus()).toBe('non-called')
  })
})
