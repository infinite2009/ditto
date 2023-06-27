export interface IImportOptions {
  importNames?: string[] | string;
  packageName: string;
  importPath?: string;
  importType?: 'default' | 'object' | '*';
  needSemicolon?: boolean;
}

export default class TypeScriptCodeGenerator {

  generateImportSentence(data: IImportOptions) {
    if (!data) {
      throw new Error('no import data error');
    }
    const { importType, importNames, importPath = '', packageName, needSemicolon = true } = data;
    if (!packageName) {
      throw new Error('no package name error');
    }
    const importPathPart = `from ${packageName}${importPath.indexOf('/') === 0 ? importPath : '/' + importPath}${needSemicolon ? ';' : ''}`;
    switch (importType) {
      case 'object':
        // 无论是字符串还是数组，都可以被检查到
        if (!importNames?.length) {
          throw new Error('no dependencies error');
        }
        return `import { ${typeof importNames === 'string' ? importNames : importNames.join(', ')} } ${importPathPart}`;
      case '*':
        return `import * as ${importNames} ${importPathPart}`;
        default:
          return `import ${importNames} ${importPathPart}`
    }
  }
}