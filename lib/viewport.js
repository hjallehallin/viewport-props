import React, { Component } from 'react'

const {
  Provider,
  Consumer
} = React.createContext(null)

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
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
        const scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft
        const scrollDirection = oldScrollTop < scrollTop ? 'down' : 'up'
        const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 0)

        const atTop = scrollTop <= 0
          ? 'true'
          : 'false'
        const atBottom = scrollTop >= scrollHeight - this.state.vh
          ? 'true'
          : 'false'
        this.setState({
          scrollTop,
          scrollLeft,
          scrollDirection,
          atTop,
          atBottom,
          scrollHeight,
          scrollDelta: scrollTop - oldScrollTop
        })
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
    window.addEventListener('scroll', event => {
      isScrolling = true
    })
    window.addEventListener('resize', event => {
      isResizing = true
    })
    window.requestAnimationFrame(run)
  }

  render () {
    return (
      <Provider value={this.state}>{this.props.children}</Provider>
    )
  }
}

export const withViewport = (mapStateToProps) => WrappedComponent => ({ ...rest }) => {
  return (
    <Consumer>
      {state => {
        if (mapStateToProps && typeof mapStateToProps === 'function') {
          state = mapStateToProps(state)
        }
        return (<WrappedComponent {...state} {...rest} />)
      }
      }
    </Consumer>
  )
}

export default ViewportProvider
