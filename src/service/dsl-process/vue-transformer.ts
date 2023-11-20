
import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import IPropsSchema from '@/types/props.schema';
import { generateId, typeOf } from '@/util';
import ComponentSchemaRef from '@/types/component-schema-ref';

export default class VueTransformer {
  dsl: IPageSchema;
  componentHanlderMap: Record<string, Record<string, (child: IComponentSchema) => void>>;
  constructor(dsl: IPageSchema) {
    this.dsl = dsl;
    // 处理不同组件，不同props处理方法的映射
    this.componentHanlderMap = {
      Tabs: {
        items: (node: IComponentSchema) => {
          this.itemsChildren(node, 'TabPane');
        },
        tabBarExtraContent: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'tabBarExtraContent');
        },
      },
      Table: {
        columns: (node: IComponentSchema) => {
          this.tableColumn(node);
        }
      },
      Collapse: {
        items: (node: IComponentSchema) => {
          this.itemsChildren(node, 'CollapsePanel');
        }
      },
      Descriptions:  {
        items: (node: IComponentSchema) => {
          this.itemsChildren(node, 'DescriptionsItem');
        }
      },
    };
  }
  transformDsl() {
    const { child, componentIndexes } = this.dsl;
    this.transformChildDsl(child);
    // writeFile(resolve(__dirname, './data.json'), JSON.stringify(this.dsl, null, 2), () => {
    //   console.log('writeFile');
    // });
    return this.dsl;
  }
  transformChildDsl(root: ComponentSchemaRef): IPageSchema {
    this.breadthFirstTraversal(root, (node) => {
      const componentHanlderMap = this.componentHanlderMap;
      const nodeName = node.name as keyof typeof this.componentHanlderMap;

      if (componentHanlderMap[nodeName] && Array.isArray(node.propsRefs) && node.propsRefs.length > 0) {
        node.propsRefs.forEach(propsName => {
          if (componentHanlderMap[nodeName][propsName]) {
            componentHanlderMap[nodeName][propsName](node);
          }
        });
        this.fixDependency(node);
      } else {
        this.fixDependency(node);
      }
    });
    return this.dsl;
  }

  /**
   * 广度遍历 components
   */
  breadthFirstTraversal(root: ComponentSchemaRef, callback: (node: IComponentSchema) => void) {

    const q: ComponentSchemaRef[] = [root];
    const { componentIndexes } = this.dsl;
    while (q.length) {
      // 弹出头部的节点
      const nodeRef: ComponentSchemaRef  | undefined = q.shift();

      // 过滤字符串节点/空节点
      if (typeof nodeRef === 'object' && !nodeRef.isText) {
        const node = componentIndexes[nodeRef.current];
        if (node) {
          callback(node);
          if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
              q.push(node.children[i]);
            }
          }
        } else {
          console.warn(`The componentIndexes.${nodeRef.current} does not exist`);
        }
      }
    }
  }
  /**
   * 带children的items转template
   */
  itemsChildren(node: IComponentSchema, childComponentName: string) {
    const { props, componentIndexes } = this.dsl;
    const componentProps = props[node.id];

    if (!node.children) {
      node.children = [];
    }
    const templateKeyPathsReg = componentProps.items.templateKeyPathsReg;
    if (componentProps.items && templateKeyPathsReg && Array.isArray(componentProps.items.value)) {

      // children可能还有
      componentProps.items.value.forEach((item, index) => {
        const currentKeyPath = `[${index}].${item.children ? 'children' : ''}`;
        const keyPathMatchResult = templateKeyPathsReg.length > 0 && templateKeyPathsReg.find(pathObj => {
          return new RegExp(pathObj.path).test(currentKeyPath);
        });
        // 不符合
        if (!keyPathMatchResult) {
          return item;
        }
        const newId = generateId();
        // key 差异映射
        const itemProps = {
          key: item.key,
          tab: item.label,
        };
        const newProps = this.createSimplePropsDsl(newId, itemProps);
        const child = this.createComponentDsl(newId, childComponentName, itemProps);
        props[newId] = newProps;
        componentIndexes[newId] = child;
        // 因为是副作用，需要提前赋值
        child.children = Array.isArray(item.children) ? item.children : [item.children];
        child.children.forEach((itemChild: any) => {
          if (typeof itemChild === 'string') {
            // 不处理
          } else {
            this.transformChildDsl(itemChild);
          }
        });
        node.children.push({
          current: newId,
          isText: false,
        });
      });
      // 删除特定的数据
      delete componentProps.items.templateKeyPathsReg;
      componentProps.items.value = [];

      this.removeProps(node.propsRefs || [], 'items');
      return node.children;
    }
    return [];

  }
  /**
   * table的column转template#bodyCell + template v-if="column.key=xxx"
   */
  tableColumn(node: IComponentSchema) {
    const { props, componentIndexes } = this.dsl;
    const componentProps = props[node.id];

    if (!node.children) {
      node.children = [];
    }

    const templateKeyPathsReg = componentProps.columns.templateKeyPathsReg;
    if (componentProps.columns && templateKeyPathsReg && Array.isArray(componentProps.columns.value)) {
      const bodyCellProps = {
        "#bodyCell": "{ column, record }"
      };
      const bodyCellId = `bodyCell_${generateId()}`;
      const bodyCell = this.createComponentDsl(bodyCellId, 'template', bodyCellProps);
      props[bodyCellId] =  this.createSimplePropsDsl(bodyCellId, bodyCellProps);
      componentIndexes[bodyCellId] = bodyCell;
      // children可能还有
      componentProps.columns.value.forEach((item, index) => {
        const currentKeyPath = `[${index}].${item.render ? 'render' : ''}`;
        const keyPathMatchResult = templateKeyPathsReg.length > 0 && templateKeyPathsReg.find(pathObj => {
          return new RegExp(pathObj.path).test(currentKeyPath);
        });
        // 不符合
        if (!keyPathMatchResult) {
          return item;
        }
        const newId = generateId();
        // key 差异映射
        const itemProps = {
          'v-if': `column.key === '${item.key}'`,
        };
        const newProps = this.createSimplePropsDsl(newId, itemProps);
        const child = this.createComponentDsl(newId, 'template', itemProps);
        props[newId] = newProps;
        componentIndexes[newId] = child;
        // 因为是副作用，需要提前赋值
        child.children = Array.isArray(item.render) ? item.render : [item.render];
        child.children.forEach((itemChild: any) => {
          if (typeof itemChild === 'string') {
            // 不处理
          } else {
            this.transformChildDsl(itemChild);
          }
        });
        bodyCell.children.push({
          current: newId,
          isText: false,
        });
        delete item.render;
      });
      node.children = [{
        current: bodyCellId,
        isText: false,
      }];
      // 删除特定的数据
      delete componentProps.columns.templateKeyPathsReg;
      return node.children;
    }
    return [];
  }
  vnodeToTemplate(node: IComponentSchema, name: string) {
    const { props, componentIndexes } = this.dsl;
    const componentProps = props[node.id];
    const templateKeyPathsReg = componentProps[name].templateKeyPathsReg;
    // console.log(node, templateKeyPathsReg, componentProps[name].value);
    if (!templateKeyPathsReg || templateKeyPathsReg.length === 0) {
      return;
    }

    const values = Array.isArray(componentProps[name].value) ? componentProps[name].value as any[] : [componentProps[name].value];
    values.forEach((item, index) => {
      const currentKeyPath = `[${index}].`;
      const keyPathMatchResult = templateKeyPathsReg.length > 0 && templateKeyPathsReg.find(pathObj => {
        return new RegExp(pathObj.path).test(currentKeyPath);
      });
      if (!keyPathMatchResult) {
        return;
      }
      const newId = generateId();
      // key 差异映射
      const itemProps = {
        [`#${name}`]: ``,
      };
      const template = this.createComponentDsl(newId, 'template', itemProps);
      props[newId] = this.createSimplePropsDsl(newId, itemProps);
      componentIndexes[newId] = template;
      node.children.push({current: newId, isText: false});
      template.children.push(item as ComponentSchemaRef);
      this.removeProps(node.propsRefs, name);
      delete componentProps[name];
    });
  }
  propNameMap(node: IComponentSchema, name: string, newName: string) {
    const { props } = this.dsl;
    const componentProps = props[node.id];
    componentProps[newName] = componentProps[name];
    delete componentProps[name];
  }
  ignoreProps(node: IComponentSchema, name: string) {
    const { props } = this.dsl;
    const componentProps = props[node.id];
    delete componentProps[name];
  }
  /** slot转函数 */
  vnodeToH(node: IComponentSchema, propNames: string[]) {
    //
  }
  /**
   * import {} from "antd" -> import {} from 'ant-design-vue'
   */
  fixDependency(node: IComponentSchema) {
    if (node.dependency === 'antd') {
      node.dependency = 'ant-design-vue';
    }
  }
  removeProps(props: string[], propsName: string) {
    const index = props.findIndex(item => item === propsName);
    if (index > - 1) {
      props.splice(index, 1);
    }
  }
  createComponentDsl(id: string, name: string, props: Record<string, string | number>) {
    const dependencyIgnore = ['template'].includes(name);
    return {
      "parentId": "",
      "id": id,
      "schemaType": "component",
      "dependency": dependencyIgnore ? '' : "ant-design-vue",
      "name": name,
      "propsRefs": Object.keys(props),
      "children": []
    } as IComponentSchema;
  }
  createSimplePropsDsl(id: string, props: Record<string, string | number>) {
    const newProps: Record<string, IPropsSchema & {category: string}> = {} as Record<string, IPropsSchema & {category: string}>;
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const value = props[key];
        // @ts-ignore
        newProps[key] = {
          "id": id,
          "schemaType": "props",
          "name": key,
          "category": "basic",
          "value": value,
          "valueType": typeOf(value) as IPropsSchema['valueType'],
          "valueSource": "editorInput"
        };
      }
    }
    return newProps;
  }

}
