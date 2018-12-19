import React, { Component } from 'react'
const {
  Provider,
  Consumer
} = React.createContext(null)

const eventBus = {
  'scroll': [],
  'scrollX': [],
  'scrollY': [],
  'scrollReachedEnd': [],
  'scrollReachedTop': []
}
class ViewportProvider extends Component {
  constructor (props) {
    super(props)

    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    this.state = {
      scrollTop: 0,
      orientation: vw > vh ? 'landscape' : 'portrait',
      scrollDirection: null,
      scrollLeft: 0,
      scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 0),
      vw,
      vh,
      atTop: true,
      atBottom: true,
      scrollDelta: 0
    }
  }
  componentDidMount () {
    let isScrolling = false
    let isResizing = false
    const run = () => {
      if (isScrolling) {
        const oldScrollTop = this.state.scrollTop
        const oldScrollLeft = this.state.scrollLeft
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
        const scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft
        const scrollDirection = oldScrollTop < scrollTop ? 'down' : 'up'
        const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 0)
        const scrollDelta = scrollTop - oldScrollTop
        const scrollXDelta = scrollLeft - oldScrollLeft
        const atTop = scrollTop <= 0
        const atBottom = scrollTop >= scrollHeight - this.state.vh
        if (atBottom && !this.state.atBottom) {
          eventBus['scrollReachedEnd'].forEach(fn => {
            fn({
              scrollTop
            })
          })
        }

        if (atTop && !this.state.atTop) {
          eventBus['scrollReachedTop'].forEach(fn => {
            fn({
              scrollTop
            })
          })
        }
        this.setState({
          scrollTop,
          scrollLeft,
          scrollDirection,
          atTop,
          atBottom,
          scrollHeight,
          scrollDelta,
          scrollXDelta
        })
        eventBus['scroll'].forEach(fn => {
          fn({
            scrollTop,
            scrollLeft,
            scrollDelta: scrollTop - oldScrollTop
          })
        })
        if (scrollDelta) {
          eventBus['scrollY'].forEach(fn => {
            fn({
              scrollTop,
              scrollDelta: scrollTop - oldScrollTop
            })
          })
        }
        if (scrollXDelta) {
          eventBus['scrollX'].forEach(fn => {
            fn({
              scrollLeft,
              scrollXDelta: scrollLeft - oldScrollLeft
            })
          })
        }
      }

      if (isResizing) {
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        this.setState({
          scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 0),
          vw,
          vh,
          orientation: vw > vh ? 'landscape' : 'portrait'
        })
      }
      isScrolling = false
      isResizing = false
      window.requestAnimationFrame(run)
    }
    const scrollHandler = event => {
      isScrolling = true
    }
    const resizeHandler = event => {
      isResizing = true
    }
    window.addEventListener('scroll', scrollHandler)
    window.addEventListener('resize', resizeHandler)
    window.requestAnimationFrame(run)
  }

  render () {
    return (
      <Provider value={this.state}>{this.props.children}</Provider>
    )
  }
}

export const withViewport = (mapStateToProps, subscribe = 'subscribe') => WrappedComponent => ({ ...rest }) => {
  return (
    <Consumer>
      {state => {
        let props
        if (mapStateToProps && typeof mapStateToProps === 'function') {
          props = mapStateToProps(state)
        }

        if (!mapStateToProps && !props) {
          throw new Error('No props mapped')
        }
        props[subscribe] = (eventName, callback) => {
          eventBus[eventName].push(callback)
          return () => {
            const i = eventBus[eventName].indexOf(callback)
            eventBus[eventName].splice(i, 1)
          }
        }
        return (<WrappedComponent {...props} {...rest} />)
      }
      }
    </Consumer>
  )
}

export default ViewportProvider
