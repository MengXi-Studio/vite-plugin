export { toCamelCase, toPascalCase, stripJsonComments } from './utils'

export { parsePagesJson } from './parser'
export { extractExistingRawRoutes, extractExistingRoutes } from './route-parser'

export { mergeRoutes } from './merger'

export { generateFileContent } from './generator'
export { generateRouterDtsContent } from './dts'

export { serializeRoute, serializeValue, serializeValueCompact, extractRouteObjects, extractPropertyValueText, replacePropertyValue, removeProperty } from './code-manipulation'
