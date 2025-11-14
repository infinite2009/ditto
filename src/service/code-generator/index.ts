import IPageSchema from '@/types/page.schema';
import ReactCodeGenerator from '@/service/code-generator/react';
import TypeScriptCodeGenerator from '@/service/code-generator/typescript';
import * as dsl from '@/mock/tab-case.json';
import { createWriteStream, mkdirSync } from 'fs';
import { remove } from 'fs-extra';
import * as prettier from 'prettier';
import * as prettierConfig from '../../../.prettierrc.json';

export default async function generateTsxFile(fileDir: string) {
  return new Promise<any>((resolve, reject) => {
    const react = new ReactCodeGenerator(dsl as unknown as IPageSchema, new TypeScriptCodeGenerator());
    const content = formatSentences(react.generatePageCode());
    const fileRootPath = `${fileDir}/${dsl.name}`;
    remove(fileRootPath).then(() => {
      mkdirSync(fileRootPath);
      const writeStream = createWriteStream(`${fileRootPath}/index.tsx`);
      writeStream.write(content);
      writeStream.on('finish', () => {
        resolve(1);
      });
      writeStream.on('error', () => {
        reject('写入失败');
      });
      writeStream.end();
    });
  });
}

function formatSentences(content: string) {
  return prettier.format(content, prettierConfig as any);
}
