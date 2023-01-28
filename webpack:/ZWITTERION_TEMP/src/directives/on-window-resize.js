/**
 * Directive that will trigger the callback when the window size changes.
 */
const onWindowResize = {
    bind (el, binding, vnode) {
        el.onResize = (event) => {
            vnode.context[binding.expression](event)
        }

        window.addEventListener('resize', el.onResize)
    },
    unbind (el) {
        window.removeEventListener('resize', el.onResize)
    },
}

export default onWindowResize
