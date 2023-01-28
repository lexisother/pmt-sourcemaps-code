/**
 * Directive that will trigger the callback as value when the user clicks outside
 * an element.
 */
const clickOutside = {
    bind (el, binding, vnode) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                if (vnode.context[binding.expression]) {
                    vnode.context[binding.expression](event)
                }
            }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    unbind (el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    },
}

export default clickOutside
