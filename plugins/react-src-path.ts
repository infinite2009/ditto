import { parse } from '@babel/core';
import { generate } from '@babel/generator';

import * as t from '@babel/types';
import { Plugin } from 'vite';

import { default as _traverse } from '@babel/traverse';

// fix: 解决 @babel/traverse 的导出问题
const traverse = (_traverse as unknown as { default: typeof _traverse }).default;

export default function reactDevInspect(): Plugin {
  return {
    name: 'react-src-path',
    enforce: 'pre',
    transform(code, id) {
      try {
        // 只处理特定类型的文件
        if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
          // 使用 Babel 解析代码
          const ast = parse(code, {
            babelrc: false,
            configFile: false,
            sourceType: 'module',
            filename: id, // 添加 filename 选项
            plugins: [
              ['@babel/plugin-syntax-jsx', { throwIfNamespace: false }],
              ['@babel/plugin-syntax-typescript', { isTSX: true }]
            ],
            retainLines: true
          });

          if (ast) {
            traverse(ast, {
              JSXElement(path) {
                // 获取 JSX 标签的属性
                if (path.isJSXElement() && path.node.openingElement.name.type === 'JSXIdentifier') {
                  const { name } = path.node.openingElement.name;
                  // 如果 name 全小写，则添加 data-src 属性
                  if (name.toLowerCase() === name) {
                    const { attributes } = path.node.openingElement;
                    // 获取原始行号
                    const originalLine = path.node.loc?.start.line;
                    // 检查是否已经存在 data-src 属性
                    const hasDataSrc = attributes.some(attr => t.isJSXAttribute(attr) && attr.name.name === 'data-src');
                    // 如果不存在 data-src 属性，则添加
                    if (!hasDataSrc) {
                      attributes.push(
                        t.jsxAttribute(t.jsxIdentifier('data-src'), t.stringLiteral(`${id}:${originalLine}`))
                      );
                    }
                  }
                }
              }
            });
            const transformedCode = generate(ast);

            return {
              code: transformedCode.code,
              map: null
            };
          }
        }
      } catch (error) {
        console.error('babel-plugin error:', id, (error as Error)?.message);
      }
      return null; // 返回 null 表示不转换
    }
  };
}
