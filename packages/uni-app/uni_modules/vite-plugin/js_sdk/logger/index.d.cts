import { L as LoggerOptions, P as PluginLogger } from '../shared/vite-plugin.B8FuZce1.cjs';

/**
 * 日志工具类（单例模式）
 * @description 全局单例日志管理器，统一管理所有插件的日志输出
 */
declare class Logger {
    /**
     * 单例实例
     */
    private static instance;
    /**
     * 库名称
     */
    private readonly libName;
    /**
     * 插件日志配置映射表
     * @description 存储每个插件的日志开关状态
     */
    private pluginConfigs;
    /**
     * 日志类型映射
     */
    private readonly logTypes;
    /**
     * 私有构造函数，防止外部实例化
     */
    private constructor();
    /**
     * 获取单例实例
     * @returns Logger 单例实例
     */
    private static getInstance;
    /**
     * 创建日志记录器（工厂方法）
     * @param options 配置选项
     * @returns Logger 单例实例
     * @description 为插件创建日志记录器，实际返回单例实例并注册插件配置
     */
    static create(options: LoggerOptions): Logger;
    /**
     * 注册插件日志配置
     * @param pluginName 插件名称
     * @param enabled 是否启用日志
     */
    private registerPlugin;
    /**
     * 注销插件日志配置
     * @param pluginName 插件名称
     */
    private unregisterPlugin;
    /**
     * 注销指定插件的日志配置
     * @param pluginName 插件名称
     * @description 从单例中移除指定插件的日志配置，通常在插件销毁时调用
     */
    static unregister(pluginName: string): void;
    /**
     * 销毁单例实例，释放所有资源
     * @description 清除所有已注册的插件配置，重置单例实例。主要用于测试场景
     */
    static destroy(): void;
    /**
     * 生成日志前缀
     * @param pluginName 插件名称
     * @returns 格式化的日志前缀
     */
    private formatPrefix;
    /**
     * 检查插件日志是否启用
     * @param pluginName 插件名称
     * @returns 是否启用
     */
    private isPluginEnabled;
    /**
     * 统一日志输出方法
     * @param pluginName 插件名称
     * @param type 日志类型
     * @param message 日志消息
     * @param data 附加数据
     */
    private log;
    /**
     * 创建插件日志代理对象
     * @param pluginName 插件名称
     * @returns 插件日志代理对象
     * @internal 供 BasePlugin 内部使用
     */
    createPluginLogger(pluginName: string): PluginLogger;
}

export { Logger, LoggerOptions, PluginLogger };
