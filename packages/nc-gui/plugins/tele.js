import io from 'socket.io-client'
import Vue from 'vue'

export default function({
  app,
  $axios,
  store
}, inject) {
  let socket

  const init = () => {
    socket = io($axios.defaults.baseURL)

    app.router.onReady(() => {
      app.router.afterEach(function(to, from) {
        if (to.path === from.path && (to.query && to.query.type) === (from.query && from.query.type)) {
          return
        }
        socket.emit('page', {
          id: '',
          path: to.matched[0].path + (to.query && to.query.type ? `?type=${from.query.type}` : '')
        })
      })
    }, () => {
      loadPH($axios.defaults.baseURL)
    })

    socket.on('connect_error', () => {
      socket.disconnect()
      loadPH($axios.defaults.baseURL)
    })
  }
  const tele = {
    emit(evt, data) {
      if (socket) {
        socket.emit('event', {
          evt,
          data
        })
      }
    }
  }

  inject('tele', tele)

  function getListener(binding) {
    return function(e) {
      const cat = window.location.hash.replace(/\d+\/(?=dashboard)/, '')
      const action = binding.value && binding.value[0]
      const label = binding.value && binding.value[1]

      tele.emit('clicked',
        {
          cat,
          action,
          label
        })
    }
  }

  Vue.directive('t', {
    bind(el, binding, vnode) {
      if (vnode.componentInstance) {
        vnode.componentInstance.$on('click', getListener(binding))
      } else {
        el.addEventListener('click', getListener(binding))
      }
    }
  })

  store.watch(state => state.project.projectInfo && state.project.projectInfo.teleEnabled, (value) => {
    if (value) { init() }
  })
  if (store.state.project.projectInfo && store.state.project.projectInfo.teleEnabled) { init() }
}

function loadPH(_baseUrl) {
  const baseUrl = _baseUrl && _baseUrl.replace(/\/$/, '')
  const content = `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src="${baseUrl}/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('phc_lQE1SrNLeEAuqHKoIaLYJEbDRnES4RBXPdERQCcIvwa',{api_host:'${baseUrl}'})`
  const scriptElement = document.createElement('script')
  const firstScriptElement = document.getElementsByTagName('script')[0]
  scriptElement.innerHTML = content
  firstScriptElement.parentNode.insertBefore(scriptElement, firstScriptElement)
}
