import {
  define,
  render,
  Component,
  cloneElement,
  WeElement
} from '../../src/omi'

describe('install()', () => {
  let scratch
  //const Empty = () => null

  before(() => {
    scratch = document.createElement('div')
    ;(document.body || document.documentElement).appendChild(scratch)
  })

  beforeEach(() => {
    //let c = scratch.firstElementChild;
    //if (c) render(<Empty />, scratch, { merge: c })
    scratch.innerHTML = ''
  })

  after(() => {
    scratch.parentNode.removeChild(scratch)
    scratch = null
  })

  it('should render components', () => {
    class Ele extends Component {
      render() {
        return <div>Ele</div>
      }
      install() {
        console.log(123)
      }
    }

    define('my-ele', Ele)
    sinon.spy(Ele.prototype, 'render')
    render(<my-ele />, scratch)

    expect(Ele.prototype.render)
      .to.have.been.calledOnce.and.to.have.been.calledWithMatch({}, {})
      .and.to.have.returned(sinon.match({ nodeName: 'div' }))

    expect(scratch.innerHTML).to.equal('<div>Ele</div>')
  })

  it('should render components with props', () => {
    const PROPS = { foo: 'bar', onBaz: () => {} }
    let constructorProps

    class C2 extends Component {
      constructor(props) {
        super(props)
        constructorProps = props
      }
      render(props) {
        return <div {...props} />
      }
    }
    sinon.spy(C2.prototype, 'render')

    define('c2-ele', C2)
    render(<c2-ele {...PROPS} />, scratch)

    expect(constructorProps).to.deep.equal(PROPS)

    expect(C2.prototype.render)
      .to.have.been.calledOnce.and.to.have.been.calledWithMatch(PROPS, {})
      .and.to.have.returned(
        sinon.match({
          nodeName: 'div',
          attributes: PROPS
        })
      )

    expect(scratch.innerHTML).to.equal('<div foo="bar"></div>')
  })

  it('should clone components', () => {
    let instance = <a-b a />
    let clone = cloneElement(instance)
    expect(clone).to.deep.equal(instance)
  })

  it('should render string', () => {
    class StringComponent extends Component {
      render() {
        return 'Hi there'
      }
    }

    define('a-b', StringComponent)

    render(<a-b />, scratch)
    expect(scratch.innerHTML).to.equal('Hi there')
  })

  it('should render number as string', () => {
    define('c-d', class extends Component {
      render() {
        return 42
      }
    })
    render(<c-d />, scratch)
    expect(scratch.innerHTML).to.equal('42')
  })

  it('should render null as empty string', () => {
    define('c-d', class extends Component {
      render() {
        return null
      }
    })
    render(<c-d />, scratch)
    expect(scratch.innerHTML).to.equal('')
  })

  it('should remove orphaned elements replaced by Components', () => {
    define('c-d', class Comp extends Component {
      render() {
        return <span>span in a component</span>
      }
    })

    let root
    function test(content) {
      root = render(content, scratch, { merge: root })
    }

    test(<c-d />)
    test(<div>just a div</div>)
    test(<c-d />)

    expect(scratch.innerHTML).to.equal('<span>span in a component</span>')
  })

  describe('props.children', () => {
    describe('should always be an array', () => {
      it('render props.children[0]', () => {
        define('my-p', class extends WeElement {
          render(props) {
            return props.children[0]
          }
        })

        define('my-app', class extends WeElement {
          render() {
            return (
              <div>
                <my-p>
                  <h2>Hello World</h2>
                </my-p>
              </div>
            )
          }
        })

        render(<my-app />, scratch)

        expect(scratch.innerHTML).to.equal('<div><h2>Hello World</h2></div>')
      })
    })
  })
})
