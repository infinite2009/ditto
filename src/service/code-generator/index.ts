import IPageSchema from '@/types/page.schema';
import ReactCodeGenerator from '@/service/code-generator/react';
import TypeScriptCodeGenerator from '@/service/code-generator/typescript';
import * as dsl from '@/mock/tab-case.json';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { remove } from 'fs-extra';

export default async function generateTsxFile(fileDir: string) {
  return new Promise<any>((resolve, reject) => {
    const react = new ReactCodeGenerator(dsl as unknown as IPageSchema, new TypeScriptCodeGenerator());
    const sentences = react.generatePageCode();
    const fileRootPath = `${fileDir}/${dsl.name}`;
    if (existsSync(fileRootPath)) {
      remove(fileRootPath).then(() => {
        mkdirSync(fileRootPath);
        const writeStream = createWriteStream(`${fileRootPath}/index.tsx`);
        writeStream.write(sentences.join('\n'));
        writeStream.on('finish', () => {
          resolve(1);
        });
        writeStream.on('error', () => {
          reject('写入失败');
        });
        writeStream.end();
      });
    }
  });
}
