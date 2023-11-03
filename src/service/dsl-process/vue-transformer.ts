
import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import IPropsSchema, { TemplateKeyPathsReg } from '@/types/props.schema';
import { generateId, hyphenToCamelCase, typeOf } from '@/util';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { toJS } from 'mobx';
import { BaseDirectory, createDir, exists, FileEntry, readDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';

export default class VueTransformer {
  dsl: IPageSchema;
  componentHanlderMap: Record<string, Record<string, (child: IComponentSchema) => void>>;
  constructor(dsl: IPageSchema) {
    this.dsl = toJS(dsl);
    // 处理不同组件，不同props处理方法的映射
    this.componentHanlderMap = {
      Space: {
        block: (node: IComponentSchema) => {
          this.ignoreProps(node, 'icon');
        },
      },
      Anchor: {
        block: (node: IComponentSchema) => {
          this.ignoreProps(node, 'icon');
        },
      },
      Button: {
        icon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'icon');
        },
      },
      FloatButton: {
        icon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'icon');
        },
        description: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'description');
        },
        tooltip: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'tooltip');
        },
      },
      Tabs: {
        items: (node: IComponentSchema) => {
          this.itemsToTemplate(node, 'TabPane', 'items[].children');
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
      Breadcrumb: {
        items: (node: IComponentSchema) => {
          this.itemsToTemplate(node, 'BreadcrumbItem', 'items[].title');
        },
      },
      Dropdown: {
        items: (node: IComponentSchema) => {
          this.itemsToTemplate(node, 'MenuItem', 'items[].children');
        },
        autoAdjustOverflow: (node: IComponentSchema) => {
          this.ignoreProps(node, 'autoAdjustOverflow');
        },
        autoFocus: (node: IComponentSchema) => {
          this.ignoreProps(node, 'autoFocus');
        },
      },
      Cascader: {
        tagRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'tagRender');
        },
        suffixIcon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'suffixIcon');
        },
        displayRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'displayRender');
        },
        removeIcon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'removeIcon');
        },
        maxTagTextLength: (node: IComponentSchema) => {
          this.ignoreProps(node, 'maxTagTextLength');
        },
      },
      DatePicker: {
        dateRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'dateRender');
        },
        renderExtraFooter: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'renderExtraFooter');
        },
        cellRender: (node: IComponentSchema) => {
          this.ignoreProps(node, 'cellRender');
        },
      },
      Form: {
        initialValues: (node: IComponentSchema) => {
          this.ignoreProps(node, 'initialValues');
        },
        dateRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'dateRender');
        },
        renderExtraFooter: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'renderExtraFooter');
        },
      },
      Input: {
        addonAfter: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'addonAfter');
        },
        addonBefore: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'addonBefore');
        },
        prefix: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'prefix');
        },
        suffix: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'suffix');
        },
      },
      InputNumber: {
        addonAfter: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'addonAfter');
        },
        addonBefore: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'addonBefore');
        },
        prefix: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'prefix');
        },
        suffix: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'suffix');
        },
      },
      Mentions: {
        notFoundContent: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'notFoundContent');
        },
      },
      Rate: {
        character: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'character');
        },
      },
      Select: {
        popupMatchSelectWidth: (node: IComponentSchema) => {
          this.propNameMap(node, 'popupMatchSelectWidth', 'dropdownMatchSelectWidth');
        },
        dropdownRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'dropdownRender');
        },
        suffixIcon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'suffixIcon');
        },
        tagRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'tagRender');
        },
      },
      Slider: {
        mark: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'mark');
        },
      },
      Switch: {
        checkedChildren: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'checkedChildren');
        },
        unCheckedChildren: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'unCheckedChildren');
        },
      },
      TimePicker: {
        dateRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'dateRender');
        },
        renderExtraFooter: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'renderExtraFooter');
        },
        cellRender: (node: IComponentSchema) => {
          this.ignoreProps(node, 'cellRender');
        },
      },
      Transfer: {
        footer: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'footer');
        },
      },
      TreeSelect: {
        tagRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'tagRender');
        },
        suffixIcon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'suffixIcon');
        },
        autoClearSearchValue: (node: IComponentSchema) => {
          this.ignoreProps(node, 'autoClearSearchValue');
        },
        notFoundContent: (node: IComponentSchema) => {
          this.ignoreProps(node, 'notFoundContent');
        },
      },
      Upload: {
        itemRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'itemRender');
        },
        iconRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'iconRender');
        },
        removeIcon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'removeIcon');
        },
      },
      Avatar: {
        onError: (node: IComponentSchema) => {
          this.propNameMap(node, 'onError', 'loadError');
        },
      },
      Calendar: {
        headerRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'headerRender');
        },
      },
      Card: {
        title: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'title');
        },
        extra: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'extra');
        },
        avatar: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'avatar');
        },
      },
      Collapse: {
        items: (node: IComponentSchema) => {
          this.itemsToTemplate(node, 'CollapsePanel', 'items[].children');
        }
      },
      Descriptions:  {
        items: (node: IComponentSchema) => {
          this.itemsToTemplate(node, 'DescriptionsItem', 'items[].children');
        }
      },
      Empty: {
        description: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'description');
        },
        image: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'image');
        },
      },
      Image: {
        preview: (node: IComponentSchema) => {
          this.ignoreProps(node, 'preview.imageRender');
          this.ignoreProps(node, 'preview.onTransform');
          this.ignoreProps(node, 'preview.onVisibleChange');
        }
      },
      List: {
        renderItem: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'renderItem');
        },
        header: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'header');
        },
        footer: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'footer');
        },
        extra: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'extra');
        },
        title: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'title');
        },
      },
      Statistic: {
        formatter: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'formatter');
        },
        prefix: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'prefix');
        },
        suffix: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'suffix');
        },
        title: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'title');
        }
      },
      Tag: {
        icon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'icon');
        },
      },
      Tooltip: {
        title: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'title');
        },
      },
      Tree: {
        switcherIcon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'switcherIcon');
        },
      },
      Alert: {
        description: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'description');
        },
        icon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'icon');
        },
        message: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'message');
        },
        action: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'action');
        },
      },
      Drawer: {
        closeIcon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'closeIcon');
        },
        extra: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'extra');
        },
        footer: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'footer');
        },
        title: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'title');
        },
        forceRender: (node: IComponentSchema) => {
          this.ignoreProps(node, 'forceRender');
        },
      },
      Popconfirm: {
        title: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'title');
        },
        description: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'description');
        },
        onPopupClick: (node: IComponentSchema) => {
          this.propNameMap(node, 'onPopupClick', 'openChange');
        },
      },
      Result: {
        extra: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'extra');
        },
        icon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'icon');
        },
        subTitle: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'subTitle');
        },
        title: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'title');
        },
      }, 
      Modal: {
        modalRender: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'modalRender');
        },
        footer: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'footer');
        },
        title: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'title');
        },
        okText: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'okText');
        },
        closeIcon: (node: IComponentSchema) => {
          this.vnodeToTemplate(node, 'closeIcon');
        },
        afterOpenChange: (node: IComponentSchema) => {
          this.ignoreProps(node, 'afterOpenChange');
        },
      }
    }; 
  }
  generateId() {
    return hyphenToCamelCase(generateId());
  }
  transformDsl() {
    const { child, componentIndexes } = this.dsl;
    this.transformChildDsl(child);
    // console.log(JSON.stringify(this.dsl, null, 2));
    return this.dsl;
  }
  transformChildDsl(root: ComponentSchemaRef): IPageSchema {
    this.breadthFirstTraversal(root, (node) => {
      const componentHanlderMap = this.componentHanlderMap;
      const nodeName = node.name as keyof typeof this.componentHanlderMap;


      if (componentHanlderMap[nodeName] && Array.isArray(node.propsRefs) && node.propsRefs.length > 0) {
        let topPropsName = node.propsRefs.shift();
        while(topPropsName) {
          if (componentHanlderMap[nodeName][topPropsName]) {
            componentHanlderMap[nodeName][topPropsName](node);
          }
          topPropsName = node.propsRefs.shift();
        }
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
  templateKeyPathsReg(params: {value?: any; templateKeyPathsReg?: TemplateKeyPathsReg[]}, callback: (value: Record<string, any>, type: TemplateKeyPathsReg['type']) => void) {
    const { value, templateKeyPathsReg }  = params;
    if (!templateKeyPathsReg || !Array.isArray(value)) {
      return;
    }
    
    for (let j = 0; j < value.length; j++) {
      const valueItem = value[j];
      for (const key in valueItem) {
        const currentKeyPath = `[${j}].${key}`;
        const keyPathMatchResult = templateKeyPathsReg.length > 0 && templateKeyPathsReg.find(pathObj => {
          return new RegExp(pathObj.path).test(currentKeyPath);
        });
        // 不符合
        if (!keyPathMatchResult) {
          continue;
        }
        callback(valueItem, keyPathMatchResult.type);
        continue;
      }
    }
    
  }
  /**
   * items转template
   * @example itemsToTemplate(node, 'Panel', 'items[].children')
   */
  itemsToTemplate(node: IComponentSchema, childComponentName: string, keyPath: string) {
    const { props, componentIndexes } = this.dsl;
    const componentProps = props[node.id];
    if (!keyPath.includes('[].')) {
      console.warn('只能处理数组items', node, keyPath);
    }
    if (!node.children) {
      node.children = [];
    }
    const [valueKey, itemKey] = keyPath.split('[].');

    if (componentProps[valueKey] && valueKey && itemKey) {
      this.templateKeyPathsReg({
        templateKeyPathsReg: componentProps[valueKey].templateKeyPathsReg,
        value: componentProps[valueKey].value
      }, (item) => {
        // 先取出插槽数据，剩余的放到子组件
        const slotProps = item[itemKey];
        delete item[itemKey];
        const resetProps = item;

        const [child, newProps] = this.createComponentDsl(node.id, childComponentName, resetProps);
        this.addComponentToDsl(child, newProps);
        // 因为是副作用，需要提前赋值
        child.children = Array.isArray(slotProps) ? slotProps : [slotProps];
        child.children.forEach((itemChild: any) => {
          if (typeof itemChild === 'string') {
            // 不处理
          } else {
            this.transformChildDsl(itemChild);
          } 
        });
        this.appendChildren(node, {
          current: child.id,
          isText: false,
        });
      });
      // 删除特定的数据
      delete componentProps[valueKey].templateKeyPathsReg;
      componentProps[valueKey].value = []; 
      this.removeProps(node.propsRefs, valueKey);
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

    if (componentProps.columns) {

      const [bodyCell, bodyCellProps] = this.createComponentDsl(node.id, 'template', {
        "#bodyCell": "{ column, record }"
      });
      this.addComponentToDsl(bodyCell, bodyCellProps);

      this.templateKeyPathsReg({
        templateKeyPathsReg: componentProps.columns.templateKeyPathsReg,
        value: componentProps.columns.value
      }, (item) => {
        // key 差异映射
        const itemProps = {
          'v-if': `column.key === '${item.key}'`,
        };
        const [child, newProps] = this.createComponentDsl(bodyCell.id, 'template', itemProps);
        this.addComponentToDsl(child, newProps);
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
          current: child.id,
          isText: false,
        });
        delete item.render;
      });
      node.children = [{
        current: bodyCell.id,
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

    if (!templateKeyPathsReg || templateKeyPathsReg.length === 0) {
      return;
    }
    const values: ComponentSchemaRef[] = Array.isArray(componentProps[name].value) ? componentProps[name].value as any[] : [componentProps[name].value];
    this.templateKeyPathsReg({
      templateKeyPathsReg: templateKeyPathsReg,
      value: values
    }, (item) => {
      if (item.current) {
        const [template, templateProps] = this.createComponentDsl(node.id, 'template', {
          [`#${name}`]: ``,
        });
        this.addComponentToDsl(template, templateProps);
        this.appendChildren(node, {current: template.id, isText: false});
        this.appendChildren(template, item as ComponentSchemaRef);
        this.removeProps(node.propsRefs, name);
        delete componentProps[name];
      } else {
        console.warn('TODO: ', item);
      }
    });
  }
  propNameMap(node: IComponentSchema, name: string, newName: string) {
    const { props } = this.dsl;
    const componentProps = props[node.id];
    componentProps[newName] = componentProps[name];
    delete componentProps[name];
  }
  /**
   * @param node 
   * @param name 
   */
  ignoreProps(node: IComponentSchema, name: string) {
    const { props } = this.dsl;
    const componentProps = props[node.id];
    const namePaths = name.split('.');
    if (namePaths.length <= 1) {
      delete componentProps[name];
    } else {
      let top = namePaths.shift();
      let propValue = componentProps[top as any].value as Record<string, any>;
      while(namePaths.length && propValue) {
        top = namePaths.shift();
        if (top) {
          propValue = propValue[top];
        }
      }
      delete propValue[top as string];
    }
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

  removeProps(props: string[] | undefined, propsName: string) {
    if (!props) {
      return;
    }
    const index = props.findIndex(item => item === propsName);
    if (index > - 1) {
      props.splice(index, 1);
    }
  }
  createComponentDsl(parentId: string, name: string, props: Record<string, string | number>) {
    const dependencyIgnore = ['template'].includes(name);
    const newId = `${name}_${this.generateId()}`;
    const newProps = this.createSimplePropsDsl(newId, props);
    const commentDsl = {
      "parentId": parentId,
      "displayName": name,
      "id": newId,
      "schemaType": "component",
      "dependency": dependencyIgnore ? '' : "ant-design-vue",
      "name": name,
      "propsRefs": Object.keys(props),
      "children": []
    } as IComponentSchema;
    return [commentDsl, newProps] as [IComponentSchema, ReturnType<typeof this.createSimplePropsDsl>];
  }  
  createSimplePropsDsl(id: string, props: Record<string, string | number>) {
    const newProps: Record<string, IPropsSchema> = {} as Record<string, IPropsSchema>;
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const value = props[key];
        newProps[key] = {
          "id": id,
          "title": "",
          "schemaType": "props",
          "name": key,
          "category": "basic" as const,
          "value": value,
          "valueType": typeOf(value) as IPropsSchema['valueType'],
          "valueSource": "editorInput"
        };
      }
    }
    return newProps;
  }
  addComponentToDsl(componentDsl: IComponentSchema, newProps: Record<string, IPropsSchema>) {
    const { props, componentIndexes } = this.dsl;
    props[componentDsl.id] = newProps;
    componentIndexes[componentDsl.id] = componentDsl;
  }
  appendChildren(perentComponetDsl: IComponentSchema, child: ComponentSchemaRef) {
    perentComponetDsl.children.push(child);
  }
}
