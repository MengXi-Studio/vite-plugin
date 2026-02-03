# Introduction

`@meng-xi/vite-plugin` is a toolkit that provides practical plugins for Vite, and also serves as a complete **Vite Plugin Development Framework**.

This toolkit not only provides a collection of ready-to-use plugins, but also exports core framework components, allowing developers to quickly build custom plugins based on the same underlying infrastructure, achieving
high extensibility.

## Core Features

### Ready-to-Use Plugins

- **Enhance Vite Build Process**: Provide a collection of practical plugins, extend Vite functionality, simplify common tasks in the build process, and improve development efficiency
- **Modular Plugin Architecture**: Adopt modular design, plugins can be used individually or in combination, flexibly responding to different project needs
- **Highly Configurable**: All features support detailed configuration options, can customize behavior according to project needs, meeting diverse scenarios
- **Environment Awareness**: Support executing plugin functionality based on build environment conditions, intelligently controlling behavior in different environments

### Plugin Development Framework

- **Complete Framework Export**: Export core components like `BasePlugin`, `Logger`, `Validator`, `createPluginFactory`
- **Singleton Logger System**: Unified log management with plugin-level log control
- **Type-Safe Validator**: Strongly-typed configuration validation system ensuring plugin configuration correctness
- **Plugin Factory Pattern**: Support options normalizer to easily handle heterogeneous inputs (like strings or objects)
- **Unified Error Handling**: Configurable error handling strategies (throw/log/ignore)

### Development Experience

- **Detailed Log Output**: Provide optional detailed logs to help developers understand the execution process, facilitating debugging and problem troubleshooting
- **Type Safety**: Fully developed with TypeScript, providing complete type definitions to ensure type safety during use
- **Seamless Integration**: Seamlessly integrate with Vite build process, enabling quick activation without complex configuration
- **Optimize Development Experience**: Simplify common build tasks, reduce manual operations, allowing developers to focus on core business logic

## Main Features

### Built-in Plugins

- **copyFile**: Copy files or directories after build completion
- **injectIco**: Inject website icons into HTML files

### Core Framework API

- **BasePlugin**: Plugin base class providing lifecycle management and standard features
- **createPluginFactory**: Plugin factory function with options normalization support
- **Logger**: Singleton logger manager
- **Validator**: Type-safe configuration validator
- **Common Utils**: File system utilities, object merging and other practical functions

[Quick Start](./installation.md) or check the [GitHub Repository](https://github.com/MengXi-Studio/vite-plugin) for more information.
