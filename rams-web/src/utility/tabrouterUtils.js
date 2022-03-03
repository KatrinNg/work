import {getDefaultRoute} from './route'


/**
 * according to router get name && key
 * @param {string} path  routerPath
 */
 export const getKeyName = (path = '/403') => {
    const routes = getDefaultRoute()
    const truePath = path.split('?')[0]
    const curRoute = flattenRoutes(routes).filter(
      (item) => item.path.indexOf(truePath)>=0 && item.path.length === truePath.length
    )
    if (!curRoute[0])
      return { title: 'No Auth', tabKey: '403', component: <>Error Page</> }
    const { name, key, component } = curRoute[0]
    return { title: name, tabKey: key, component }
  }

  /**
 * Flatten the react router array recursively
 * @param {object[]} arr Router array
 * @param {string} child The name of the field that needs to be recursed
 */
export const flattenRoutes = (arr) => arr.reduce(
  (prev, item) => {
    if (Array.isArray(item.routes)) {
      prev.push(item)
    }
    return prev.concat(
      Array.isArray(item.routes) ? flattenRoutes(item.routes) : item
    )
  },
  []
)

/**
 * According to the authority to judge whether there is authority
 */
 export const isAuthorized = (val) => {
    const permissions = getPermission()
    return permissions.includes(val)
}

/**
 * Get permissions in local storage
 */
 export const getPermission = () => localStorage.getItem('permissions') || []