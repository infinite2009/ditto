import { hyphenToCamelCase } from '@/util';
import { useEffect, useMemo, useRef, createElement } from 'react';

export interface IProps {
  children: string;
  [x: string]: string | number;
}

export function createCamelotComponent(elementName: string, url: string) {
  return function CamelotComponent (props: IProps = {} as IProps) {
    useEffect(() => {
      import( url/* @vite-ignore */ ).then((module) => {
        const registerName = `${hyphenToCamelCase(elementName)}Register`.slice(1);
        if (module && module[registerName]) {
          if (module[registerName]) {
            module[registerName]();
          } else if (module.register) {
            module.register();
          }
        }
      });
    }, []);
    return createElement(elementName, props);
  };
}

