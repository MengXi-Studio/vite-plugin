# Configuration Reference

This page summarizes all plugin configuration options for easy reference.

## copyFile Plugin Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| sourceDir | string | Required | Path to the source file directory |
| targetDir | string | Required | Path to the target file directory |
| overwrite | boolean | true | Whether to overwrite files with the same name |
| recursive | boolean | true | Whether to support recursive copying |
| enabled | boolean | true | Whether to enable the plugin |
| verbose | boolean | true | Whether to display detailed logs |

## injectIco Plugin Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------| 
| base | string | / | Base path for icon files |
| url | string | undefined | Complete URL of the icon |
| link | string | undefined | Custom complete link tag HTML |
| icons | array | undefined | Custom icon array |
| verbose | boolean | true | Whether to display detailed logs |
| enabled | boolean | true | Whether to enable the plugin |
| copyOptions | object | undefined | Icon file copy configuration |

### injectIco.copyOptions Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| sourceDir | string | Required | Icon source file directory |
| targetDir | string | Required | Icon target directory (build directory) |
| overwrite | boolean | true | Whether to overwrite files with the same name |
| recursive | boolean | true | Whether to support recursive copying |

## Plugin Priority

If multiple plugins are used simultaneously, their execution order is as follows:

1. injectIco plugin (transformIndexHtml hook)
2. copyFile plugin (writeBundle hook)

## Best Practices

1. **Keep configuration concise**: Only configure necessary options, use default values for others
2. **Enable log output**: Enable verbose option during development for easy debugging
3. **Use enabled option wisely**: Enable/disable plugins based on environment or conditions
4. **Test build output**: Run build command to verify plugins work as expected
5. **Refer to example code**: Refer to the example configuration in the playground project

## FAQ

### Q: What to do if the plugin doesn't work?

A: Please check the following:
1. Ensure the plugin is correctly installed
2. Ensure the plugin is correctly configured in vite.config.ts
3. Ensure the enabled option is true
4. Enable verbose option to view detailed logs
5. Check if configuration options are correct

### Q: How to disable plugins in production environment?

A: You can control the plugin's enabled status based on NODE_ENV environment variable:

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  enabled: process.env.NODE_ENV === 'production'
})
```

### Q: How to handle plugin execution order?

A: You can use Vite plugin's enforce option to control execution order, or use the plugin's built-in hooks to control execution timing.