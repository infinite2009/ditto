import EditComp from "@/components/EditComp";
import { define, generateDefaultStyleConfig } from "../utils";
import { TextIcon } from "@/components/icon";

const typographyTransformerStr =
  `return ((values) => {
        if (!values) {
            return {};
        }
        const result = {};
        const {
            strong,
            italic,
            underline
        } = values;
        const arr = [];
        if (values.delete) {
            arr.push('line-through');
        }
        if (underline) {
            arr.push('underline');
        }
        if (arr.length) {
            result.textDecoration = arr.join(' ');
        }
        if (italic) {
            result.fontStyle = 'italic';
        }
        if (strong) {
            result.fontWeight = 600;
        }
        return result;
    })(values);`;

export default define({
  configName: 'Text',
  name: 'Text',
  importName: 'Typography',
  callingName: 'Typography.Text',
  dependency: 'antd',
  component: EditComp.Text,
  categories: ['常用', '数据展示'],
  title: '文字',
  icon: TextIcon,
  propsConfig: {
    style: generateDefaultStyleConfig({ padding: 0 }, {
      layout: {
        width: true,
        height: true,
        padding: true
      },
      backgroundColor: true,
      text: {
        // 字号和行高
        size: true,
        color: true,
        decoration: true
      },
      border: {
        borderRadius: true
      }
    }),
    copyable: {
      schemaType: 'props',
      title: '可复制',
      category: 'basic',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput',
    },
    delete: {
      schemaType: 'props',
      title: '删除线',
      category: 'hidden',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput',
    },
    disabled: {
      schemaType: 'props',
      title: '禁用',
      category: 'basic',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput'
    },
    editable: {
      title: '可编辑',
      schemaType: 'props',
      category: 'basic',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput'
    },
    ellipsis: {
      title: '自动省略',
      schemaType: 'props',
      category: 'basic',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput'
    },
    mark: {
      title: '添加标记',
      schemaType: 'props',
      category: 'basic',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput'
    },
    strong: {
      title: '加粗',
      schemaType: 'props',
      category: 'hidden',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput'
    },
    italic: {
      title: '斜体',
      schemaType: 'props',
      category: 'hidden',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput'
    },
    underline: {
      title: '下划线',
      schemaType: 'props',
      category: 'hidden',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput'
    },
  },
  transformerStr: typographyTransformerStr,
  children: {
    value: '默认文字',
    type: 'text',
    category: 'children',
    schema: {
      title: '内容',
      component: 'Input'
    }
  }
});