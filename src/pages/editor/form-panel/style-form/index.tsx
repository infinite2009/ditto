import { Col, ColorPicker, Divider, Popover, Radio, Row, Select, Slider, Space, Tooltip } from 'antd';
import classNames from 'classnames';
import { CSSProperties, useContext, useEffect, useMemo, useRef, useState } from 'react';
import NumberInput from '@/pages/editor/form-panel/style-form/components/number-input';

import {
  AlignCenter,
  AlignStart,
  Arrow,
  Bold,
  Border2,
  BorderRadius,
  ColumnLayout,
  ColumnSpaceAround,
  ColumnSpaceBetween,
  Compact,
  DashedLine,
  Fixed,
  Gap,
  Grow,
  Height,
  Italic,
  Line,
  LineThrough,
  LongBar,
  NoWrap,
  Padding,
  PlusThin,
  RowSpaceBetween,
  ShortBar,
  SingleBorder,
  SingleBorderRadius,
  SpaceAround,
  Start,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  Thickness,
  UnderLine,
  Width,
  Wrap
} from '@/components/icon';
import styles from './index.module.less';
import { isDifferent, parsePadding, typeOf } from '@/util';
import { StyleFormConfig } from '@/types/form-config';
import { AppStoreContext } from '@/hooks/context';
import { Scene } from '@/service/app-store';
import tinycolor2 from 'tinycolor2';
import { ColorPickerProps } from 'antd/lib';
import { Color } from 'antd/es/color-picker';
import { AggregationColor } from 'antd/es/color-picker/color';
import { omit } from 'lodash';

export interface IStyleFormProps {
  config?: StyleFormConfig;
  onChange: (style: CSSProperties) => void;
  parentDirection: 'row' | 'column';
  value?: CSSProperties;
}

enum ItemsAlignment {
  topLeft,
  top,
  topRight,
  left,
  center,
  right,
  bottomLeft,
  bottom,
  bottomRight
}

type ItemsAlignment2 = 'start' | 'center' | 'end';

type SizeMode = 'hug' | 'fill' | 'fixed';

const itemsAlignmentDict = {
  [ItemsAlignment.topLeft]: {
    alignItems: 'start',
    justifyContent: 'start'
  },
  [ItemsAlignment.top]: {
    alignItems: 'start',
    justifyContent: 'center'
  },
  [ItemsAlignment.topRight]: {
    alignItems: 'start',
    justifyContent: 'end'
  },
  [ItemsAlignment.left]: {
    alignItems: 'center',
    justifyContent: 'start'
  },
  [ItemsAlignment.center]: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  [ItemsAlignment.right]: {
    alignItems: 'center',
    justifyContent: 'end'
  },
  [ItemsAlignment.bottomLeft]: {
    alignItems: 'end',
    justifyContent: 'start'
  },
  [ItemsAlignment.bottom]: {
    alignItems: 'end',
    justifyContent: 'center'
  },
  [ItemsAlignment.bottomRight]: {
    alignItems: 'end',
    justifyContent: 'end'
  }
};

const textSizeOptions = [
  {
    fontSize: 24,
    lineHeight: '36px',
    name: 'text-hugtitle · 24/36'
  },
  {
    fontSize: 18,
    lineHeight: '27px',
    name: 'text-h1 · 18/27'
  },
  {
    fontSize: 16,
    lineHeight: '24px',
    name: 'text-h2 · 16/24'
  },
  {
    fontSize: 14,
    lineHeight: '21px',
    name: 'text-h3 · 14/21'
  },
  {
    fontSize: 13,
    lineHeight: '20px',
    name: 'text-h4 · 13/20'
  },
  {
    fontSize: 16,
    lineHeight: '29px',
    name: 'text-body-lg · 16/29'
  },
  {
    fontSize: 14,
    lineHeight: '25px',
    name: 'text-body-md · 14/25'
  },
  {
    fontSize: 13,
    lineHeight: '20px',
    name: 'text-description · 13/20'
  }
];

const indicatingColors = [
  {
    category: '主色',
    data: [
      {
        name: '主色/colorPrimaryDefault',
        value: '#00aeecff'
      },
      {
        name: '主色/colorPrimaryHover',
        value: '#00aeecbf'
      },
      {
        name: '主色/colorPrimaryActive',
        value: '#008ac5ff'
      },
      {
        name: '主色/colorPrimaryDisabled',
        value: '#00aeec80'
      },
      {
        name: '主色/colorPrimaryHighlight',
        value: '#00aeec14'
      }
    ]
  },
  {
    category: '成功',
    data: [
      {
        name: '成功/colorSuccessDefault',
        value: '#2ac864ff'
      },
      {
        name: '成功/colorSuccessHover',
        value: '#2ac864bf'
      },
      {
        name: '成功/colorSuccessActive',
        value: '#0eb350ff'
      },
      {
        name: '成功/colorSuccessDisabled',
        value: '#2ac864bf'
      },
      {
        name: '成功/colorSuccessHighlight',
        value: '#2ac86414'
      }
    ]
  },
  {
    category: '警示',
    data: [
      {
        name: '警示/colorWarningDefault',
        value: '#ff7f24ff'
      },
      {
        name: '警示/colorWarningHover',
        value: '#ff7f24bf'
      },
      {
        name: '警示/colorWarningActive',
        value: '#e95b03ff'
      },
      {
        name: '警示/colorWarningDisabled',
        value: '#ff7f2480'
      },
      {
        name: '警示/colorWarningHighlight',
        value: '#FF7F2414'
      }
    ]
  },
  {
    category: '错误',
    data: [
      {
        name: '错误/colorErrorDefault',
        value: '#f85a54ff'
      },
      {
        name: '错误/colorErrorHover',
        value: '#f85a54bf'
      },
      {
        name: '错误/colorErrorActive',
        value: '#e23d3dff'
      },
      {
        name: '错误/colorErrorDisabled',
        value: '#f85a5480'
      },
      {
        name: '错误/colorErrorHighlight',
        value: '#f85a5414'
      }
    ]
  }
];

const textColorOptions = [
  {
    category: '字符 Text&symbol color',
    data: [
      {
        name: '一级色字符/colorSymbolBase',
        value: 'rgb(24, 25, 28)'
      },
      {
        name: '二级色字符/colorSymbolBold',
        value: 'rgb(97, 102, 109)'
      },
      {
        name: '三级色字符/colorSymbolMedium',
        value: 'rgb(148, 153, 160)'
      },
      {
        name: '四级色字符/colorSymbolLight',
        value: 'rgb(201, 204, 208)'
      },
      {
        name: '绝对白色字符/colorSymbolWhite',
        value: 'rgb(255, 255, 255)'
      },
      {
        name: '链接色/colorLink',
        value: 'rgb(0, 105, 157)'
      }
    ]
  },
  ...indicatingColors
];

const colors = [
  {
    category: '背景',
    data: [
      {
        name: '一级白色/colorBgBase',
        value: 'rgb(255, 255, 255)'
      },
      {
        name: '二级亮灰/colorBgBright',
        value: 'rgb(246, 247, 248)'
      },
      {
        name: '三级灰色/colorBgLight',
        value: 'rgb(241, 242, 243)'
      },
      {
        name: '灰色控件/colorBgWeak',
        value: 'rgb(227, 229, 231)'
      },
      {
        name: '雪白控件/colorBgSnow',
        value: 'rgb(255, 255, 255)'
      },
      {
        name: '绝对白色/colorBgWhite',
        value: 'rgb(255, 255, 255)'
      },
      {
        name: '凹陷的亮灰/colorBgSunkenBright',
        value: 'rgb(246, 247, 248)'
      },
      {
        name: '凹陷的灰色/colorBgSunkenLight',
        value: 'rgb(241, 242, 243)'
      },
      {
        name: '浮层一级/colorFloat',
        value: 'rgb(246, 247, 248)'
      },
      {
        name: '浮层二级/colorFloatSecondary',
        value: 'rgb(246, 247, 248)'
      },
      {
        name: '浮层三级/colorFloatTertiary',
        value: 'rgb(246, 247, 248)'
      },
      {
        name: '浮层深色/colorFloatDark',
        value: 'rgb(246, 247, 248)'
      },
      {
        name: '重遮罩/colorMaskBold',
        value: 'rgb(246, 247, 248)'
      },
      {
        name: '默认遮罩/colorMask',
        value: 'rgb(246, 247, 248)'
      },
      {
        name: '轻遮罩/colorMaskLight',
        value: 'rgb(246, 247, 248)'
      }
    ]
  },
  ...indicatingColors
];

const borderOpt = [
  {
    category: '',
    data: [
      {
        value: 'rgb(201, 204, 208)',
        name: '重线框/colorBorderBold'
      },
      {
        value: 'rgb(227, 229, 231)',
        name: '默认线框/colorBorder'
      },
      {
        value: 'rgb(241, 242, 243)',
        name: '浅线框/colorBorderLight'
      }
    ]
  }
];

type BorderRadiusObj = { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number };

export default function StyleForm({ onChange, value, config, parentDirection }: IStyleFormProps) {
  const [fillVisible, setFillVisible] = useState<boolean>(true);
  const [borderVisible, setBorderVisible] = useState<boolean>(true);
  const [shadowVisible, setShadowVisible] = useState<boolean>(false);
  const [fillColor, setFillColor] = useState<Color>();
  const [borderColorObj, setBorderColorObj] = useState<{
    name: string;
    value: string;
  }>();
  const [shadowObj, setShadowObj] = useState<{
    name: string;
    value: string;
  }>();
  const [textColorObj, setTextColorObj] = useState<Color>();

  const [textSizeObj, setTextSizeObj] = useState<{
    fontSize: number;
    lineHeight: string;
    name: string;
  }>();

  const [borderType, setBorderType] = useState<string>();

  const [itemsAlignmentState, setItemsAlignmentState] = useState<ItemsAlignment | ItemsAlignment2>();

  const [fillOpen, setFillOpen] = useState<boolean>(false);
  const [borderOpen, setBorderOpen] = useState<boolean>(false);
  const [shadowOpen, setShadowOpen] = useState<boolean>(false);
  const [textOpen, setTextOpen] = useState<boolean>(false);
  const [textColorOpen, setTextColorOpen] = useState<boolean>(false);
  const [borderWidth, setBorderWidth] = useState<number>();
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed'>();
  const [borderRadiusType, setBorderRadiusType] = useState<'stable' | 'separate'>('stable');

  const [borderRadiusObj, setBorderRadiusObj] = useState<BorderRadiusObj>({
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0
  });
  const borderRadius = useMemo(() => {
    if (
      borderRadiusObj.bottomLeft === borderRadiusObj.bottomRight &&
      borderRadiusObj.bottomLeft === borderRadiusObj.topLeft &&
      borderRadiusObj.bottomLeft === borderRadiusObj.topRight
    ) {
      return borderRadiusObj.bottomLeft;
    }
    return 0;
  }, [borderRadiusObj]);

  const [widthSizeMode, setWidthSizeMode] = useState<SizeMode>();
  const [heightSizeMode, setHeightSizeMode] = useState<SizeMode>();

  const colorPresetList = useMemo(() => {
    const allColorsOpt: {
      name: string;
      value: string;
    }[] = [];
    colors.forEach(color => {
      color.data.forEach(item => {
        allColorsOpt.push(item);
      });
    });
    return allColorsOpt;
  }, [colors]);

  const textColorPresetList = useMemo(() => {
    const allTextColors: {
      name: string;
      value: string;
    }[] = [];
    textColorOptions.forEach(category => {
      category.data.forEach(item => allTextColors.push(item));
    });
    return allTextColors;
  }, []);

  const appStore = useContext(AppStoreContext);

  // 上次的value值
  const oldValueRef = useRef<Record<string, any>>(value);

  useEffect(() => {
    // if (!isDifferent(oldValueRef.current, value)) {
    //   return;
    // }
    // value 发生变化时，先同步旧值
    oldValueRef.current = value;
    // 初始化表单值
    const {
      flexGrow,
      alignSelf,
      width,
      height,
      color,
      borderColor,
      backgroundColor,
      fontSize,
      lineHeight,
      flex,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius
    } = value;
    // 设置背景色
    if (backgroundColor) {
      // setFillVisible(true);
      setFillColor(new AggregationColor(backgroundColor));
    }
    // 设置线框
    const allBorderOpt = [];
    borderOpt.forEach(color => {
      color.data.forEach(item => {
        allBorderOpt.push(item);
      });
    });
    const borderColorOpt = allBorderOpt.find(item => item.value === borderColor);
    if (borderColorOpt) {
      // setBorderVisible(true);
      setBorderColorObj(borderColorOpt);
    }

    const borderTypes = ['border', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom'];
    for (const key of borderTypes) {
      if (`${key}Width` in value) {
        setBorderType(key);
        setBorderWidth(value[`${key}Width`]);
      }
      if (`${key}Style` in value) {
        setBorderStyle(value[`${key}Style`]);
      }
    }
    if (
      borderTopLeftRadius !== undefined ||
      borderBottomLeftRadius !== undefined ||
      borderBottomRightRadius !== undefined ||
      borderTopRightRadius !== undefined
    ) {
      // setBorderVisible(true);
      setBorderRadiusObj({
        topLeft: borderTopLeftRadius as number,
        topRight: borderTopRightRadius as number,
        bottomLeft: borderBottomLeftRadius as number,
        bottomRight: borderBottomRightRadius as number
      });
    } else if (value.borderRadius !== undefined) {
      // setBorderVisible(true);
      setBorderRadiusObj({
        topLeft: value.borderRadius as number,
        topRight: value.borderRadius as number,
        bottomLeft: value.borderRadius as number,
        bottomRight: value.borderRadius as number
      });
    }

    // 设置文字大小
    const opt = textSizeOptions.find(item => item.fontSize === fontSize && item.lineHeight === lineHeight);
    if (opt) {
      setTextSizeObj(opt);
    }

    if (color) {
      setTextColorObj(new AggregationColor(color));
    }

    // 如果是方向是 row, 判断flexGrow，
    if (
      (parentDirection === 'row' && Number(flexGrow) > 0) ||
      (parentDirection === 'column' && alignSelf === 'stretch')
    ) {
      setWidthSizeMode('fill');
    } else if (Number(width) > 0) {
      setWidthSizeMode('fixed');
    } else {
      setWidthSizeMode('hug');
    }

    if (
      (parentDirection === 'column' && Number(flexGrow) > 0) ||
      (parentDirection === 'row' && alignSelf === 'stretch')
    ) {
      setHeightSizeMode('fill');
    } else if (Number(height) > 0) {
      setHeightSizeMode('fixed');
    } else {
      setHeightSizeMode('hug');
    }
  }, [value]);

  useEffect(() => {
    if (
      value.borderRadius ||
      (value.borderTopLeftRadius === value.borderBottomLeftRadius &&
        value.borderTopLeftRadius === value.borderBottomRightRadius &&
        value.borderTopLeftRadius === value.borderTopRightRadius)
    ) {
      setBorderRadiusType('stable');
    } else {
      setBorderRadiusType('separate');
    }
  }, []);

  function doChange(newValue: Record<string, any>) {
    if (isDifferent(newValue, oldValueRef.current)) {
      onChange(newValue);
      oldValueRef.current = newValue;
    }
  }

  useEffect(() => {
    const borderTypes = ['border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft'];
    for (const key of borderTypes) {
      if (value[`${key}Width`] > 0) {
        handleChangingBorderWidth(value[`${key}Width`]);
      }
      if (value[`${key}Style`]) {
        handleSelectingBorderStyle(value[`${key}Style`]);
      }
    }
  }, [borderType]);

  useEffect(() => {
    if ((appStore as any).activeContext?.id) {
      appStore.registerHandlers(Scene.editor, {
        bold: handleSwitchBold,
        italic: handleSwitchItalic,
        underline: toggleUnderline,
        lineThrough: toggleLineThrough,
        textAlignLeft: alignTextLeft,
        textAlignCenter: alignTextCenter,
        textAlignRight: alignTextRight,
        textAlignJustify: alignTextJustified,
        alignStart,
        alignCenter,
        alignEnd,
        justifyStart,
        justifyCenter,
        justifyEnd,
        justifyBetween,
        justifyEvenly,
        toggleDirection,
        toggleWrap
      });
    }
  }, [
    handleSwitchBold,
    handleSwitchItalic,
    toggleUnderline,
    toggleLineThrough,
    alignTextLeft,
    alignTextCenter,
    alignTextRight,
    alignTextJustified,
    alignStart,
    alignCenter,
    alignEnd,
    justifyStart,
    justifyCenter,
    justifyEnd,
    justifyBetween,
    justifyEvenly,
    toggleDirection,
    toggleWrap
  ]);

  function justifyStart() {
    if (onChange) {
      doChange({
        ...value,
        justifyContent: 'start'
      });
    }
  }

  function justifyEnd() {
    if (onChange) {
      doChange({
        ...value,
        justifyContent: 'end'
      });
    }
  }

  function justifyCenter() {
    if (onChange) {
      doChange({
        ...value,
        justifyContent: 'center'
      });
    }
  }

  function alignStart() {
    if (onChange) {
      doChange({
        ...value,
        alignItems: 'start'
      });
    }
  }

  function justifyBetween() {
    if (onChange) {
      doChange({
        ...value,
        alignItems: 'space-between'
      });
    }
  }

  function justifyEvenly() {
    if (onChange) {
      doChange({
        ...value,
        alignItems: 'space-evenly'
      });
    }
  }

  function alignEnd() {
    if (onChange) {
      doChange({
        ...value,
        alignItems: 'end'
      });
    }
  }

  function alignCenter() {
    if (onChange) {
      doChange({
        ...value,
        alignItems: 'center'
      });
    }
  }

  function handleChangeSize(val: number | string, type: 'width' | 'height') {
    const newValueState = value ? { ...value } : {};

    if (parentDirection === 'row') {
      if (type === 'width') {
        delete newValueState.flexGrow;
        delete newValueState.flex;
      } else {
        delete newValueState.alignSelf;
      }
    } else {
      if (type === 'width') {
        delete newValueState.alignSelf;
      } else {
        delete newValueState.flexGrow;
        delete newValueState.flex;
      }
    }

    newValueState.flexShrink = 0;
    newValueState[type] = val;

    if (onChange) {
      doChange(newValueState);
    }
  }

  function handleSelectingSpaceArrangement(val: 'start' | 'space-evenly' | 'space-between') {
    const newValues = value ? { ...value } : {};
    newValues.justifyContent = val;
    // newValues.alignItems = 'start';
    if (onChange) {
      doChange(newValues);
    }
  }

  function renderItemsAlignment() {
    const { flexDirection } = value;
    let tpl: JSX.Element;

    const iconClassObj = {
      [styles.alignmentIcon]: true
    };

    if (flexDirection === 'row') {
      tpl = (
        <>
          <Start
            className={classNames({ ...iconClassObj, [styles.selected]: isCompact(value.justifyContent) })}
            onClick={() => handleSelectingSpaceArrangement('start')}
          />
          <SpaceAround
            className={classNames({ ...iconClassObj, [styles.selected]: value.justifyContent === 'space-evenly' })}
            onClick={() => handleSelectingSpaceArrangement('space-evenly')}
          />
          <RowSpaceBetween
            className={classNames({ ...iconClassObj, [styles.selected]: value.justifyContent === 'space-between' })}
            onClick={() => handleSelectingSpaceArrangement('space-between')}
          />
        </>
      );
    } else {
      tpl = (
        <>
          <ColumnLayout
            className={classNames({ ...iconClassObj, [styles.selected]: isCompact(value.justifyContent) })}
            onClick={() => handleSelectingSpaceArrangement('start')}
          />
          <ColumnSpaceAround
            className={classNames({ ...iconClassObj, [styles.selected]: value.justifyContent === 'space-evenly' })}
            onClick={() => handleSelectingSpaceArrangement('space-evenly')}
          />
          <ColumnSpaceBetween
            className={classNames({ ...iconClassObj, [styles.selected]: value.justifyContent === 'space-between' })}
            onClick={() => handleSelectingSpaceArrangement('space-between')}
          />
        </>
      );
    }
    return <div className={styles.adjustmentContainer}>{tpl}</div>;
  }

  function isStart(key: string) {
    return value[key] === 'start' || value[key] === 'flex-start';
  }

  function isEnd(key: string) {
    return value[key] === 'end' || value[key] === 'flex-end';
  }

  function isCenter(key: string) {
    return value[key] === 'center';
  }

  function handleChangingItemsAlignmentAndJustifyContent(val: ItemsAlignment) {
    let { alignItems, justifyContent } = itemsAlignmentDict[val];
    if (alignItems === value.alignItems && justifyContent === value.justifyContent) {
      alignItems = undefined;
      justifyContent = undefined;
    }
    if (onChange) {
      doChange({
        ...value,
        alignItems,
        justifyContent
      });
    }
  }

  function handleChangingItemsAlignment(val: ItemsAlignment2) {
    const newValues = value ? { ...value } : {};
    newValues.alignItems = value.alignItems === val ? undefined : val;
    if (onChange) {
      doChange(newValues);
    }
  }

  function handlePreviewItemsAlignment(val: ItemsAlignment | ItemsAlignment2) {
    setItemsAlignmentState(val);
  }

  function cancelSelectingItemsAlignment() {
    setItemsAlignmentState(undefined);
  }

  // 元素排布的预览九宫格
  function renderAlignmentPreview() {
    const alignmentClass = classNames({
      [styles.rDiagonal180]: value.flexDirection === 'column',
      [styles.alignmentGrid]: true
    });

    const iconClass = classNames({
      [styles.icon]: true,
      [styles.alignEnd]: true
    });

    return (
      <div className={alignmentClass} onMouseLeave={cancelSelectingItemsAlignment}>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.topLeft)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.topLeft)}
        >
          {(isStart('alignItems') && isStart('justifyContent')) || itemsAlignmentState === ItemsAlignment.topLeft ? (
            <AlignStart className={styles.icon} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.top)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.top)}
        >
          {(isStart('alignItems') && isCenter('justifyContent')) || itemsAlignmentState === ItemsAlignment.top ? (
            <AlignStart className={styles.icon} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.topRight)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.topRight)}
        >
          {(isStart('alignItems') && isEnd('justifyContent')) || itemsAlignmentState === ItemsAlignment.topRight ? (
            <AlignStart className={styles.icon} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.left)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.left)}
        >
          {(isCenter('alignItems') && isStart('justifyContent')) || itemsAlignmentState === ItemsAlignment.left ? (
            <AlignCenter className={styles.icon} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.center)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.center)}
        >
          {(isCenter('alignItems') && isCenter('justifyContent')) || itemsAlignmentState === ItemsAlignment.center ? (
            <AlignCenter className={styles.icon} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.right)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.right)}
        >
          {(isCenter('alignItems') && isEnd('justifyContent')) || itemsAlignmentState === ItemsAlignment.right ? (
            <AlignCenter className={styles.icon} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.bottomLeft)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.bottomLeft)}
        >
          {(isEnd('alignItems') && isStart('justifyContent')) || itemsAlignmentState === ItemsAlignment.bottomLeft ? (
            <AlignStart className={iconClass} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.bottom)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.bottom)}
        >
          {(isEnd('alignItems') && isCenter('justifyContent')) || itemsAlignmentState === ItemsAlignment.bottom ? (
            <AlignStart className={iconClass} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
        <div
          onMouseEnter={() => handlePreviewItemsAlignment(ItemsAlignment.bottomRight)}
          onClick={() => handleChangingItemsAlignmentAndJustifyContent(ItemsAlignment.bottomRight)}
        >
          {(isEnd('alignItems') && isEnd('justifyContent')) || itemsAlignmentState === ItemsAlignment.bottomRight ? (
            <AlignStart className={iconClass} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
      </div>
    );
  }

  function handleSwitchAlignment() {
    // TODO
  }

  function renderSpaceAssignmentPreview() {
    const alignmentClass = classNames({
      [styles.rDiagonal180]: value.flexDirection === 'column',
      [styles.alignmentGrid]: true
    });

    return (
      <div className={alignmentClass}>
        <div
          className={styles.alignStart}
          onMouseEnter={() => handlePreviewItemsAlignment('start')}
          onMouseLeave={cancelSelectingItemsAlignment}
          onClick={() => handleChangingItemsAlignment('start')}
        >
          {isStart('alignItems') || itemsAlignmentState === 'start' ? (
            <>
              <LongBar className={styles.icon} />
              <ShortBar className={styles.icon} />
              <LongBar className={styles.icon} />
            </>
          ) : (
            <>
              <div className={styles.dot} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </>
          )}
        </div>
        <div
          className={styles.alignCenter}
          onMouseEnter={() => handlePreviewItemsAlignment('center')}
          onMouseLeave={cancelSelectingItemsAlignment}
          onClick={() => handleChangingItemsAlignment('center')}
        >
          {isCenter('alignItems') || itemsAlignmentState === 'center' ? (
            <>
              <LongBar className={styles.icon} />
              <ShortBar className={styles.icon} />
              <LongBar className={styles.icon} />
            </>
          ) : (
            <>
              <div className={styles.dot} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </>
          )}
        </div>
        <div
          className={styles.alignEnd}
          onMouseEnter={() => handlePreviewItemsAlignment('end')}
          onMouseLeave={cancelSelectingItemsAlignment}
          onClick={() => handleChangingItemsAlignment('end')}
        >
          {isEnd('alignItems') || itemsAlignmentState === 'end' ? (
            <>
              <LongBar className={styles.icon} />
              <ShortBar className={styles.icon} />
              <LongBar className={styles.icon} />
            </>
          ) : (
            <>
              <div className={styles.dot} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </>
          )}
        </div>
      </div>
    );
  }

  function handleSelectingSizeMode(val: SizeMode, type: 'width' | 'height') {
    const newValueState = value ? { ...value } : {};

    switch (val) {
      case 'fill':
        if (parentDirection === 'row') {
          if (type === 'width') {
            newValueState.flex = 1;
            delete newValueState.width;
          } else {
            newValueState.alignSelf = 'stretch';
            delete newValueState.height;
          }
        } else {
          if (type === 'width') {
            newValueState.alignSelf = 'stretch';
            delete newValueState.width;
          } else {
            newValueState.flexGrow = 1;
            delete newValueState.height;
          }
        }
        if (onChange) {
          doChange(newValueState);
        }
        break;
      case 'hug':
        if (parentDirection === 'row') {
          if (type === 'width') {
            delete newValueState.flexGrow;
          } else {
            delete newValueState.alignSelf;
          }
        } else {
          if (type === 'width') {
            delete newValueState.alignSelf;
          } else {
            delete newValueState.flexGrow;
          }
        }
        delete newValueState[type];
        if (onChange) {
          doChange(newValueState);
        }
        break;
      case 'fixed':
        break;
    }
    if (type === 'width') {
      setWidthSizeMode(val);
    } else {
      setHeightSizeMode(val);
    }
  }

  function handleChangingRowGap(val: number) {
    if (onChange) {
      doChange({
        ...value,
        rowGap: val
      });
    }
  }

  function handleChangingColumnGap(val: number) {
    if (onChange) {
      doChange({
        ...value,
        columnGap: val
      });
    }
  }

  function handleChangingRowPadding(val: number) {
    if (onChange) {
      const newValue = {
        ...value,
        paddingTop: val,
        paddingBottom: val,
        paddingLeft: value.paddingLeft || value.padding || 0,
        paddingRight: value.paddingRight || value.padding || 0
      };
      delete newValue.padding;
      doChange(newValue);
    }
  }

  function handleChangingColumnPadding(val: number) {
    if (onChange) {
      const newValue = {
        ...value,
        paddingLeft: val,
        paddingRight: val,
        paddingTop: value.paddingTop || value.padding || 0,
        paddingBottom: value.paddingBottom || value.padding || 0
      };
      delete newValue.padding;
      doChange(newValue);
    }
  }

  /**
   * 是否是紧凑排列
   */
  function isCompact(val: string) {
    const compactStyles = ['start', 'center', 'end'];
    return compactStyles.includes(val);
  }

  function renderLayout() {
    if (!config.layout) {
      return null;
    }

    const iconClass = classNames({
      [styles.r90]: true,
      [styles.icon]: true
    });

    const widthOptions = [
      {
        value: 'fill',
        label: (
          <div className={styles.option}>
            <Grow className={styles.widthIcon} />
            <span>Fill·撑满容器宽度</span>
          </div>
        ),
        tag: (
          <span>
            <Grow className={styles.widthIcon} />
            Fill
          </span>
        )
      },
      {
        value: 'fixed',
        label: (
          <div className={styles.option}>
            <Fixed className={styles.widthIcon} />
            <span>Fixed·固定宽度</span>
          </div>
        ),
        tag: (
          <span>
            <Fixed className={styles.widthIcon} />
            Fixed
          </span>
        )
      },
      {
        value: 'hug',
        label: (
          <div className={styles.option}>
            <Compact className={styles.widthIcon} />
            <span>Hug·紧凑内容</span>
          </div>
        ),
        tag: (
          <span>
            <Compact className={styles.widthIcon} />
            Hug
          </span>
        )
      }
    ];

    const heightOptions = [
      {
        value: 'fill',
        label: (
          <div className={styles.option}>
            <Grow className={styles.heightIcon} />
            <span>Fill·撑满容器高度</span>
          </div>
        ),
        tag: (
          <span>
            <Grow className={styles.heightIcon} />
            Fill
          </span>
        )
      },
      {
        value: 'fixed',
        label: (
          <div className={styles.option}>
            <Fixed className={styles.heightIcon} />
            <span>Fixed·固定宽度</span>
          </div>
        ),
        tag: (
          <span>
            <Fixed className={styles.heightIcon} />
            Fixed
          </span>
        )
      },
      {
        value: 'hug',
        label: (
          <div className={styles.option}>
            <Compact className={styles.heightIcon} />
            <span>Hug·紧凑内容</span>
          </div>
        ),
        tag: (
          <span>
            <Compact className={styles.heightIcon} />
            Hug
          </span>
        )
      }
    ];

    let paddingObj: { paddingTop?: number; paddingLeft?: number } = {};
    if (value?.padding) {
      paddingObj = parsePadding(value.padding) || {};
    } else {
      paddingObj = {
        paddingTop: (value?.paddingTop as number) || 0,
        paddingLeft: (value?.paddingLeft as number) || 0
      };
    }

    function shouldRenderSizeSection() {
      if (typeOf(config.layout) === 'object') {
        return (config.layout as Record<string, any>)?.width || (config.layout as Record<string, any>)?.height;
      }
      return config.layout;
    }

    function renderSizeSection() {
      if (!shouldRenderSizeSection()) {
        return null;
      }

      const useWidthOption = config.layout === true || (config.layout as Record<string, any>).width;
      const useHeightOption = config.layout === true || (config.layout as Record<string, any>).height;

      return (
        <>
          <div className={styles.row}>
            {useWidthOption ? (
              <NumberInput
                disabled={widthSizeMode !== 'fixed'}
                value={value.width as number}
                icon={<Width className={styles.numberIcon} />}
                onChange={data => handleChangeSize(data, 'width')}
              />
            ) : null}
            {useHeightOption ? (
              <NumberInput
                disabled={heightSizeMode !== 'fixed'}
                value={value.height as number}
                icon={<Height />}
                onChange={data => handleChangeSize(data, 'height')}
              />
            ) : null}
          </div>
          <div className={styles.sizeSelector}>
            {useWidthOption ? (
              <Select
                variant="borderless"
                value={widthSizeMode}
                optionLabelProp="tag"
                popupMatchSelectWidth={false}
                onSelect={(val: string) => handleSelectingSizeMode(val as SizeMode, 'width')}
                options={widthOptions}
              />
            ) : null}
            {useHeightOption ? (
              <Select
                variant="borderless"
                value={heightSizeMode}
                optionLabelProp="tag"
                popupMatchSelectWidth={false}
                onSelect={(val: string) => handleSelectingSizeMode(val as SizeMode, 'height')}
                options={heightOptions}
              />
            ) : null}
          </div>
        </>
      );
    }

    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <p className={styles.title}>布局</p>
        </div>
        <div className={styles.body}>
          {renderSizeSection()}
          <div className={styles.row} style={{ height: 'auto' }}>
            {config.layout === true || config.layout.direction ? (
              <>
                <div className={styles.left}>
                  <div className={styles.row}>
                    {renderDirectionSwitch()}
                    <Divider type="vertical" style={{ height: 8, borderRadius: 0.5, margin: 0 }} />
                    {renderWrapSwitch()}
                  </div>
                  {renderItemsAlignment()}
                </div>
                <div className={styles.right}>
                  {isCompact(value.justifyContent) ? renderAlignmentPreview() : renderSpaceAssignmentPreview()}
                </div>
              </>
            ) : null}
          </div>
          {config.layout === true || config.layout.gap ? (
            <div className={styles.row}>
              <NumberInput
                icon={<Gap className={styles.columnGapIcon} />}
                value={value.columnGap as number}
                onChange={handleChangingColumnGap}
              />
              <NumberInput
                icon={<Gap className={styles.rowGapIcon} />}
                value={value.rowGap as number}
                onChange={handleChangingRowGap}
              />
            </div>
          ) : null}
          {config.layout === true || config.layout.padding ? (
            <div className={styles.row}>
              <NumberInput
                icon={<Padding className={styles.columnPaddingIcon} />}
                value={paddingObj.paddingLeft}
                onChange={handleChangingColumnPadding}
              />
              <NumberInput
                icon={<Padding className={styles.rowPaddingIcon} />}
                value={paddingObj.paddingTop}
                onChange={handleChangingRowPadding}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  function toggleDirection() {
    if (onChange) {
      doChange({
        ...value,
        flexDirection: value.flexDirection === 'row' ? 'column' : 'row'
      });
    }
  }

  function toggleWrap() {
    if (onChange) {
      doChange({
        ...value,
        flexWrap: value.flexWrap === 'wrap' ? 'nowrap' : 'wrap'
      });
    }
  }

  function handleSwitchDirection(flexDirection: 'row' | 'column') {
    if (onChange) {
      doChange({
        ...value,
        flexDirection
      });
    }
  }

  function handleSwitchWrap(val: 'wrap' | 'nowrap') {
    if (onChange) {
      doChange({
        ...value,
        flexWrap: val
      });
    }
  }

  function renderDirectionSwitch() {
    const { flexDirection } = value;

    const rowSelectedClass = classNames({
      [styles.selected]: flexDirection !== 'column',
      [styles.layoutIcon]: true
    });
    const columnSelectedClass = classNames({
      [styles.selected]: flexDirection === 'column',
      [styles.layoutIcon]: true,
      [styles.r90]: true
    });
    return (
      <div className={styles.directionContainer}>
        {config?.layout === true ||
        (config?.layout as Record<string, any>)?.direction === true ||
        (config?.layout as Record<string, any>)?.direction?.row === true ? (
          <Arrow className={rowSelectedClass} onClick={() => handleSwitchDirection('row')} />
        ) : null}
        <Arrow className={columnSelectedClass} onClick={() => handleSwitchDirection('column')} />
      </div>
    );
  }

  function renderWrapSwitch() {
    const { flexWrap } = value;
    const wrapClass = classNames({
      [styles.selected]: flexWrap === 'wrap',
      [styles.layoutIcon]: true
      // [styles.f20]: true
    });

    const noWrapClass = classNames({
      [styles.selected]: flexWrap === 'nowrap',
      [styles.layoutIcon]: true
      // [styles.f20]: true
    });
    return (
      <div className={styles.wrapContainer}>
        {config?.layout === true ||
        (config?.layout as Record<string, any>)?.wrap === true ||
        (config?.layout as Record<string, any>)?.wrap.wrap === true ? (
          <Wrap className={wrapClass} onClick={() => handleSwitchWrap('wrap')} />
        ) : null}
        {config?.layout === true ||
        (config?.layout as Record<string, any>)?.wrap === true ||
        (config?.layout as Record<string, any>).wrap.nowrap === true ? (
          <NoWrap className={noWrapClass} onClick={() => handleSwitchWrap('nowrap')} />
        ) : null}
      </div>
    );
  }

  function handleClickingFillExpandingBtn() {
    // TODO: 初始化填充值
    // setFillVisible(true);
  }

  function handleClickingFillCollapseBtn() {
    // TODO: 删除当前填充值
    // setFillVisible(false);
    setFillColor(undefined);
    if (onChange) {
      doChange({
        ...value,
        backgroundColor: undefined
      });
    }
  }

  const customPanelRender = (colorPanel: JSX.Element) => {
    const PanelRender: ColorPickerProps['panelRender'] = (_, { components: { Picker } }) => (
      <Row justify="space-between" wrap={false} style={{ overflow: 'auto', maxHeight: document.body.clientHeight / 2 }}>
        <Col span={12}>{colorPanel}</Col>
        <Divider type="vertical" style={{ height: 'auto' }} />
        <Col flex="auto">
          <p className={styles.categoryTitle}>自定义</p>
          <Picker />
        </Col>
      </Row>
    );
    return PanelRender;
  };

  const getShowText = (preset: { name: string; value: string }[]): ColorPickerProps['showText'] => {
    return color => {
      if (!color || color.cleared) return '请选择';
      const item = preset.find(item => tinycolor2.equals(item.value, color.toHexString()));
      if (item) {
        return item.name;
      }
      return `自定义 (${color.toHexString()})`;
    };
  };

  function renderFill() {
    if (!config.backgroundColor) {
      return null;
    }

    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <p className={styles.title}>填充</p>
          {/* {fillVisible ? null : <PlusThin className={styles.icon} onClick={handleClickingFillExpandingBtn} />} */}
        </div>
        {fillVisible ? (
          <div className={styles.fillContainer}>
            <ColorPicker
              allowClear
              open={fillOpen}
              value={fillColor}
              onChangeComplete={color => {
                setFillColor(color);
                if (onChange) {
                  doChange({
                    ...value,
                    backgroundColor: color.cleared ? undefined : color.toHexString()
                  });
                }
              }}
              showText={getShowText(colorPresetList) as any}
              styles={{ popupOverlayInner: { width: 480 } }}
              panelRender={customPanelRender(renderColorPalette(colors, handleSelectingFillColor))}
              onOpenChange={(newOpen: boolean) => {
                setFillOpen(newOpen);
              }}
            ></ColorPicker>
            {/* <Line className={styles.deleteIcon} onClick={handleClickingFillCollapseBtn} /> */}
          </div>
        ) : null}
        <div className={styles.bodySingle}></div>
      </div>
    );
  }

  // function handleClickingBorderExpandingBtn() {
  //   // setBorderVisible(true);
  // }

  // function handleClickingBorderCollapseBtn() {
  //   // setBorderVisible(false);
  // }

  function handleSelectingBorderType(borderType: string) {
    setBorderType(borderType);
  }

  function handleSelectingBorderStyle(val: string) {
    delete value.borderStyle;
    delete value.borderTopStyle;
    delete value.borderRightStyle;
    delete value.borderBottomStyle;
    delete value.borderLeftStyle;

    if (onChange) {
      doChange({
        ...value,
        [`${borderType}Style`]: val
      });
    }
  }

  function handleChangingBorderWidth(val: number) {
    if (!borderType) {
      return;
    }
    delete value.borderWidth;
    delete value.borderTopWidth;
    delete value.borderRightWidth;
    delete value.borderBottomWidth;
    delete value.borderLeftWidth;

    if (onChange) {
      doChange({
        ...value,
        [`${borderType}Width`]: val
      });
    }
  }

  function handleChangeBorderRadius(position: keyof BorderRadiusObj | number, val?: number) {
    if (onChange) {
      if (typeof position === 'number') {
        const borderRadiusVal = position;
        doChange(
          omit(
            {
              ...value,
              borderRadius: borderRadiusVal
            },
            ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']
          )
        );
        return;
      }
      const map: Record<keyof BorderRadiusObj, keyof CSSProperties> = {
        topLeft: 'borderTopLeftRadius',
        topRight: 'borderTopRightRadius',
        bottomLeft: 'borderBottomLeftRadius',
        bottomRight: 'borderBottomRightRadius'
      };
      doChange(
        omit(
          {
            ...value,
            borderTopLeftRadius: borderRadiusObj.topLeft,
            borderTopRightRadius: borderRadiusObj.topRight,
            borderBottomLeftRadius: borderRadiusObj.bottomLeft,
            borderBottomRightRadius: borderRadiusObj.bottomRight,
            [map[position]]: val ?? value.borderRadius
          },
          ['borderRadius']
        )
      );
    }
  }

  function renderBorder() {
    if (!config.border) {
      return null;
    }

    return (
      <div className={styles.p12}>
        <div className={styles.row}>
          <div className={styles.titleWrapper}>
            <p className={styles.title}>线框</p>
            {/* {borderVisible ? null : <PlusThin className={styles.icon} onClick={handleClickingBorderExpandingBtn} />} */}
          </div>
        </div>
        {borderVisible ? (
          <div className={styles.borderContainer}>
            <Space direction="vertical" style={{ flex: 1 }}>
              <Popover
                open={borderOpen}
                trigger={['click']}
                content={renderColorPalette(borderOpt, handleSelectingBorderColor)}
                placement="leftTop"
                arrow={false}
                onOpenChange={(newOpen: boolean) => setBorderOpen(newOpen)}
              >
                <div className={styles.colorResult}>
                  <div
                    className={styles.color}
                    style={{ height: 20, width: 20, backgroundColor: borderColorObj?.value || 'transparent' }}
                  />
                  <p className={styles.colorTitle}>{borderColorObj?.name || '请选择'}</p>
                </div>
              </Popover>
              <div className={styles.borderBar}>
                <Border2
                  className={classNames({ [styles.icon]: true, [styles.iconSelected]: borderType === 'border' })}
                  onClick={() => handleSelectingBorderType('border')}
                />
                <SingleBorder
                  className={classNames({ [styles.icon]: true, [styles.iconSelected]: borderType === 'borderLeft' })}
                  onClick={() => handleSelectingBorderType('borderLeft')}
                />
                <SingleBorder
                  className={classNames({
                    [styles.r90]: true,
                    [styles.icon]: true,
                    [styles.iconSelected]: borderType === 'borderTop'
                  })}
                  onClick={() => handleSelectingBorderType('borderTop')}
                />
                <SingleBorder
                  className={classNames({
                    [styles.r180]: true,
                    [styles.icon]: true,
                    [styles.iconSelected]: borderType === 'borderRight'
                  })}
                  onClick={() => handleSelectingBorderType('borderRight')}
                />
                <SingleBorder
                  className={classNames({
                    [styles.r270]: true,
                    [styles.icon]: true,
                    [styles.iconSelected]: borderType === 'borderBottom'
                  })}
                  onClick={() => handleSelectingBorderType('borderBottom')}
                />
              </div>
              <div className={styles.row}>
                <NumberInput icon={<Thickness />} value={borderWidth as number} onChange={handleChangingBorderWidth} />
                <div className={styles.lineContainer}>
                  <Line
                    className={classNames({
                      [styles.icon]: true,
                      [styles.iconSelected]: borderStyle === 'solid'
                    })}
                    onClick={() => handleSelectingBorderStyle('solid')}
                  />
                  <DashedLine
                    className={classNames({
                      [styles.icon]: true,
                      [styles.iconSelected]: borderStyle === 'dashed'
                    })}
                    onClick={() => handleSelectingBorderStyle('dashed')}
                  />
                </div>
              </div>
              <div className={styles.borderRadius}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                  <div style={{ lineHeight: '30px', width: 80 }}>圆角</div>
                  <div style={{ flex: 1 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Radio.Group
                        block
                        size="middle"
                        value={borderRadiusType}
                        onChange={e => {
                          setBorderRadiusType(e.target.value);
                        }}
                        optionType="button"
                        options={[
                          {
                            label: '固定',
                            value: 'stable'
                          },
                          {
                            label: '分别设置',
                            value: 'separate'
                          }
                        ]}
                      ></Radio.Group>
                      {borderRadiusType === 'stable' ? (
                        <Row align="middle" gutter={12}>
                          <Col span={12}>
                            <Slider min={0} max={30} value={borderRadius} onChange={handleChangeBorderRadius}></Slider>
                          </Col>
                          <Col span={4}>
                            <NumberInput
                              icon={<SingleBorderRadius></SingleBorderRadius>}
                              value={borderRadius}
                              onChange={handleChangeBorderRadius}
                            ></NumberInput>
                          </Col>
                        </Row>
                      ) : (
                        <Row gutter={[0, 12]}>
                          <Col span={12}>
                            <NumberInput
                              value={borderRadiusObj.topLeft}
                              icon={<BorderRadius />}
                              onChange={v => handleChangeBorderRadius('topLeft', v)}
                            />
                          </Col>
                          <Col span={12}>
                            <NumberInput
                              value={borderRadiusObj.topRight}
                              icon={<BorderRadius rotate={90} />}
                              onChange={v => handleChangeBorderRadius('topRight', v)}
                            />
                          </Col>
                          <Col span={12}>
                            <NumberInput
                              value={borderRadiusObj.bottomLeft}
                              icon={<BorderRadius rotate={270} />}
                              onChange={v => handleChangeBorderRadius('bottomLeft', v)}
                            />
                          </Col>
                          <Col span={12}>
                            <NumberInput
                              value={borderRadiusObj.bottomRight}
                              icon={<BorderRadius rotate={180} />}
                              onChange={v => handleChangeBorderRadius('bottomRight', v)}
                            />
                          </Col>
                        </Row>
                      )}
                    </Space>
                  </div>
                </div>
              </div>
            </Space>
            {/* <Line className={styles.deleteIcon} onClick={handleClickingBorderCollapseBtn} /> */}
          </div>
        ) : null}
      </div>
    );
  }

  function handleClickingShadowExpandingBtn() {
    // TODO: 初始化阴影值
    setShadowVisible(true);
  }

  function handleClickingShadowCollapsingBtn() {
    // TODO: 初始化阴影值
    setShadowVisible(false);
  }

  function renderShadow() {
    if (!config.shadow) {
      return null;
    }

    const shadowOptTpl = <div>阴影选项占位符</div>;

    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <p className={styles.title}>阴影</p>
          {shadowVisible ? null : <PlusThin className={styles.icon} onClick={handleClickingShadowExpandingBtn} />}
        </div>
        {shadowVisible ? (
          <div className={styles.shadowContainer}>
            <Popover
              open={shadowOpen}
              trigger={['click']}
              content={shadowOptTpl}
              placement="leftTop"
              arrow={false}
              onOpenChange={(newOpen: boolean) => setShadowOpen(newOpen)}
            >
              <div>占位符</div>
            </Popover>
            <Line className={styles.deleteIcon} onClick={handleClickingShadowCollapsingBtn} />
          </div>
        ) : null}
      </div>
    );
  }

  function handleSelectingTextAlignment(val: 'left' | 'right' | 'center' | 'justify') {
    const newValue = value ? { ...value } : {};
    newValue.textAlign = val;
    if (val === 'justify') {
      newValue.textAlignLast = val;
    } else {
      delete newValue.textAlignLast;
      if (val === 'left') {
        delete newValue.textAlign;
      }
    }
    if (onChange) {
      doChange(newValue);
    }
  }

  function handleSwitchBold() {
    const newValue = value ? { ...value } : {};
    if (Number(newValue.fontWeight) >= 600) {
      delete newValue?.fontWeight;
    } else {
      newValue.fontWeight = 600;
    }
    if (onChange) {
      doChange(newValue);
    }
  }

  function handleSwitchItalic() {
    const newValue = value ? { ...value } : {};

    const { fontStyle } = newValue;
    if (fontStyle) {
      delete newValue.fontStyle;
    } else {
      newValue.fontStyle = 'italic';
    }
    if (onChange) {
      doChange(newValue);
    }
  }

  function handleToggleTextDecoration(val: 'line-through' | 'underline') {
    const newValue = value ? { ...value } : {};
    const { textDecoration } = newValue;
    if (textDecoration) {
      if ((textDecoration as string).indexOf(val) > -1) {
        newValue.textDecoration = (textDecoration as string).replace(val, '');
      } else {
        const arr = (textDecoration as string).split(' ').filter(item => !!item);
        arr.push(val);
        newValue.textDecoration = arr.join(' ');
      }
    } else {
      newValue.textDecoration = val;
    }
    if (onChange) {
      doChange(newValue);
    }
  }

  function renderText() {
    if (!config.text) {
      return null;
    }

    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <p className={styles.title}>文字</p>
        </div>
        <div className={styles.body}>
          <Popover
            open={textOpen}
            trigger={['click']}
            content={renderTextPalette()}
            placement="leftTop"
            arrow={false}
            onOpenChange={(newOpen: boolean) => setTextOpen(newOpen)}
          >
            <div className={styles.textSizeResult}>
              <p
                className={styles.text}
                style={{ fontSize: textSizeObj?.fontSize || 12, lineHeight: textSizeObj?.lineHeight || '20px' }}
              >
                Ag
              </p>
              <p className={styles.colorTitle}>{textSizeObj?.name || '请选择'}</p>
            </div>
          </Popover>
          <div>
            <ColorPicker
              allowClear
              open={textColorOpen}
              value={textColorObj}
              onChangeComplete={color => {
                setFillColor(color);
                if (onChange) {
                  doChange({
                    ...value,
                    color: color.cleared ? undefined : color.toHexString()
                  });
                }
              }}
              showText={getShowText(textColorPresetList) as any}
              styles={{ popupOverlayInner: { width: 480 } }}
              panelRender={customPanelRender(renderColorPalette(textColorOptions, handleSelectingTextColor))}
              onOpenChange={(newOpen: boolean) => {
                setTextColorOpen(newOpen);
              }}
            ></ColorPicker>
          </div>
          <div className={styles.textBtnBar}>
            <TextAlignLeft
              className={classNames({
                [styles.icon]: true,
                [styles.selected]: value?.textAlign === undefined || value?.textAlign === 'left'
              })}
              onClick={alignTextLeft}
            />
            <TextAlignCenter
              className={classNames({ [styles.icon]: true, [styles.selected]: value?.textAlign === 'center' })}
              onClick={alignTextCenter}
            />
            <TextAlignRight
              className={classNames({ [styles.icon]: true, [styles.selected]: value?.textAlign === 'right' })}
              onClick={alignTextRight}
            />
            <TextAlignJustify
              className={classNames({ [styles.icon]: true, [styles.selected]: value?.textAlign === 'justify' })}
              onClick={alignTextJustified}
            />
            <Divider style={{ height: 8, borderRadius: 0.5, margin: 0 }} type="vertical" />
            <Bold
              className={classNames({ [styles.icon]: true, [styles.selected]: Number(value?.fontWeight) >= 600 })}
              onClick={handleSwitchBold}
            />
            <Italic
              className={classNames({ [styles.icon]: true, [styles.selected]: value?.fontStyle === 'italic' })}
              onClick={handleSwitchItalic}
              style={{ opacity: 0, pointerEvents: 'none' }}
            />
            <LineThrough
              className={classNames({
                [styles.icon]: true,
                [styles.selected]: ((value?.textDecoration || '') as string).indexOf('line-through') > -1
              })}
              onClick={toggleLineThrough}
              style={{ opacity: 0, pointerEvents: 'none' }}
            />
            <UnderLine
              className={classNames({
                [styles.icon]: true,
                [styles.selected]: ((value?.textDecoration || '') as string).indexOf('underline') > -1
              })}
              onClick={toggleUnderline}
              style={{ opacity: 0, pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>
    );
  }

  function alignTextLeft() {
    handleSelectingTextAlignment('left');
  }

  function alignTextRight() {
    handleSelectingTextAlignment('right');
  }

  function alignTextCenter() {
    handleSelectingTextAlignment('center');
  }

  function alignTextJustified() {
    handleSelectingTextAlignment('justify');
  }

  function toggleLineThrough() {
    handleToggleTextDecoration('line-through');
  }

  function toggleUnderline() {
    handleToggleTextDecoration('underline');
  }

  function handleSelectingFillColor(val: { name: string; value: string }) {
    setFillColor(new AggregationColor(val.value));
    if (onChange) {
      doChange({
        ...value,
        backgroundColor: val.value
      });
    }
    setFillOpen(false);
  }

  function handleSelectingBorderColor(val: { name: string; value: string }) {
    setBorderColorObj(val);
    if (onChange) {
      doChange({
        ...value,
        borderColor: val.value
      });
    }
    setBorderOpen(false);
  }

  function handleSelectingShadow(val: { name: string; value: string }) {
    setShadowObj(val);
  }

  function handleSelectingTextColor(val: { name: string; value: string }) {
    setTextColorObj(new AggregationColor(val.value));
    if (onChange) {
      doChange({
        ...value,
        color: val.value
      });
    }
    setTextColorOpen(false);
  }

  function renderColorPalette(
    colors: {
      category: string;
      data: {
        name: string;
        value: string;
      }[];
    }[],
    cb: (data: any) => void
  ) {
    return (
      <div className={styles.colorPalette}>
        {colors.map(group => {
          return (
            <div key={group.category} className={styles.categoryContainer}>
              <p className={styles.categoryTitle}>{group.category}</p>
              <div className={styles.colorContainer}>
                {group.data.map(item => {
                  const color = tinycolor2(item.value);
                  return (
                    <Tooltip
                      key={item.name}
                      title={
                        <>
                          <div>{item.name}</div>
                          <div>{color.toRgbString()}</div>
                          <div>{color.toHex8String()}</div>
                        </>
                      }
                    >
                      <div className={styles.color} style={{ backgroundColor: item.value }} onClick={() => cb(item)} />
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function handleSelectingTextSize(size: { fontSize: number; lineHeight: string; name: string }) {
    setTextSizeObj(size);
    const { fontSize, lineHeight } = size;
    if (onChange) {
      doChange({
        ...value,
        fontSize,
        lineHeight
      });
    }
    setTextOpen(false);
  }

  function renderTextPalette() {
    return (
      <>
        {textSizeOptions.map(item => {
          return (
            <p key={item.name} className={styles.textStyle} onClick={() => handleSelectingTextSize(item)}>
              <span className={styles.textPreview} style={{ fontSize: item.fontSize, lineHeight: item.lineHeight }}>
                Ag
              </span>
              <span className={styles.textName}>{item.name}</span>
            </p>
          );
        })}
      </>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div>
      {renderLayout()}
      {renderFill()}
      {renderBorder()}
      {renderShadow()}
      {renderText()}
    </div>
  );
}
