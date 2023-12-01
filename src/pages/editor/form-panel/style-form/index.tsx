import { ColorPicker, Divider, Form, Input, InputNumber, Popover, Select, Switch, Tooltip } from 'antd';
import { useForm } from 'antd/es/form/Form';
import classNames from 'classnames';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { isDifferent, typeOf } from '@/util';
import { FormItemSchema } from '@/types/form-config';
import NumberInput from '@/pages/editor/form-panel/style-form/components/number-input';

import {
  AlignCenter,
  AlignStart,
  Arrow,
  Bold,
  Border2,
  ColumnLayout,
  ColumnSpaceAround,
  ColumnSpaceBetween,
  Compact,
  DashedLine,
  Fixed,
  Gap,
  Grow,
  Height,
  Italian,
  Line,
  LineThrough,
  LongBar,
  NoWrap,
  Padding,
  PlusThin,
  RowSpaceBetween,
  ShortBar,
  SingleBorder,
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
import { toJS } from 'mobx';

export interface IStyleFormProps {
  config?: {
    [key: string]: FormItemSchema | boolean;
  };
  onChange: (style: CSSProperties) => void;
  value?: CSSProperties;
}

export default function StyleForm({ onChange, value, config }: IStyleFormProps) {
  const [fillVisible, setFillVisible] = useState<boolean>();
  const [borderVisible, setBorderVisible] = useState<boolean>();
  const [shadowVisible, setShadowVisible] = useState<boolean>(false);
  const [fillColorObj, setFillColorObj] = useState<{
    name: string;
    value: string;
  }>();
  const [borderColorObj, setBorderColorObj] = useState<{
    name: string;
    value: string;
  }>();
  const [shadowObj, setShadowObj] = useState<{
    name: string;
    value: string;
  }>();
  const [textColorObj, setTextColorObj] = useState<{
    name: string;
    value: string;
  }>();

  const [textSizeObj, setTextSizeObj] = useState<{
    fontSize: number;
    lineHeight: string;
    name: string;
  }>();

  const [form] = useForm();

  const [valueState, setValueState] = useState<CSSProperties>({});

  const styleNames = [
    'width',
    'height',
    'padding',
    // 'margin',
    'backgroundColor',
    'backgroundImage',
    'color',
    'fontSize',
    'fontWeight',
    'textAlign',
    'flexGrow',
    'flexShrink',
    'alignItems',
    'alignSelf',
    'justifyContent',
    'flexDirection',
    'flexWrap',
    'flexBasis'
  ];

  const indicatingColors = [
    {
      category: '主色',
      data: [
        {
          name: '主色/colorPrimary',
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
          name: '成功/colorSuccess',
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
          name: '警示/colorWarning',
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
          value: '#2ac86414'
        }
      ]
    },
    {
      category: '错误',
      data: [
        {
          name: '错误/colorError',
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

  const defaultStyleConfig: Record<
    string,
    {
      name: string;
      label: string;
      component: FC<any>;
    }
  > = {
    width: { name: 'width', label: '宽度', component: InputNumber },
    height: { name: 'height', label: '高度', component: InputNumber },
    padding: { name: 'padding', label: '内边距', component: InputNumber },
    // margin: { name: 'margin', label: '外边距', component: InputNumber },
    backgroundColor: { name: 'backgroundColor', label: '背景色', component: ColorPicker },
    backgroundImage: { name: 'backgroundImage', label: '背景图片', component: Input },
    color: { name: 'color', label: '字体颜色', component: InputNumber },
    fontSize: { name: 'fontSize', label: '字号', component: InputNumber },
    fontWeight: { name: 'fontWeight', label: '字重', component: InputNumber },
    textAlign: { name: 'textAlign', label: '文字对齐', component: Select },
    flexGrow: { name: 'flexGrow', label: '伸展', component: Switch },
    flexShrink: { name: 'flexShrink', label: '收缩', component: Switch },
    alignItems: { name: 'alignItems', label: '子元素主轴对齐', component: Select },
    alignSelf: { name: 'alignSelf', label: '主轴对齐', component: Select },
    justifyContent: { name: 'justifyContent', label: '交叉轴对齐', component: Select },
    flexDirection: { name: 'flexDirection', label: '方向', component: Select },
    flexWrap: { name: 'flexWrap', label: '换行', component: Switch },
    flexBasis: { name: 'flexBasis', label: '基准宽度', component: InputNumber }
  };

  const componentRegDict: Record<string, FC> = {
    Select: Select,
    Switch: Switch,
    Input: Input,
    ColorPicker: ColorPicker
  };

  useEffect(() => {
    form.setFieldsValue(value);
    setValueState({ ...value });
  }, [value]);

  useEffect(() => {
    if (onChange && isDifferent(valueState, value)) {
      onChange(valueState);
    }
  }, [valueState]);

  const widthSizeMode = useMemo(() => {
    const { flexGrow, flexBasis, width } = valueState;
    if (flexGrow > 0) {
      return 'fill';
    }
    if (width > 0 && flexBasis > 0) {
      return 'fixed';
    }
    return 'hug';
  }, [valueState]);

  const styleConfig = useMemo(() => {
    if (config && Object.keys(config).length > 0) {
      return Object.entries(config);
    }
    return [];
  }, [config]);

  function handleChangingStyle() {
    if (onChange) {
      const originalValueObj = form.getFieldsValue();
      Object.entries(originalValueObj).forEach(([key, val]) => {
        if (val === undefined) {
          delete originalValueObj[key];
          return;
        }
        const config = styleConfig.find(item => item[0] === key);
        if (config) {
          if (typeOf(config[1]) === 'object') {
            if ((config[1] as FormItemSchema).type === 'number') {
              originalValueObj[key] = {
                value: +(val as string)
              };
            } else {
              originalValueObj[key] = {
                value: val
              };
            }
            // 如果该配置项是某个props的一个属性，则把这个 props 的名字写进去
            if ((config[1] as FormItemSchema).propsToCompose) {
              originalValueObj[key].propsToCompose = (config[1] as FormItemSchema).propsToCompose;
            }
          } else {
            // 如果配置项是 boolean 值，则默认为 style 的一个属性
            originalValueObj[key] = {
              value: val,
              propsToCompose: 'style'
            };
          }
        }
      });
      onChange(originalValueObj);
    }
  }

  function renderFormItems() {
    return styleConfig.map(([key, val]) => {
      let Component: FC<any>;
      let label;
      let componentProps = {};
      // 如果不是对象
      if (typeOf(val).toLowerCase() === 'boolean' && styleNames.includes(key)) {
        Component = defaultStyleConfig[key].component;
        label = defaultStyleConfig[key].label;
      } else {
        Component = componentRegDict[(val as FormItemSchema).component] || Input;
        label = (val as FormItemSchema).title;
        componentProps = (val as FormItemSchema).componentProps || {};
      }
      return (
        <Form.Item key={key} label={label} name={key}>
          <Component {...componentProps} />
        </Form.Item>
      );
    });
  }

  function handleChangeStyle(value: number | string, key: string) {
    const newValueState = {
      ...valueState,
      [key]: value
    };
    setValueState(newValueState);
  }

  function renderLayoutAdjustment() {
    const { direction } = valueState;
    let tpl: JSX.Element;

    const iconClass = classNames({
      [styles.icon]: true,
      [styles.f20]: true
    });

    if ((direction as string) !== 'row') {
      tpl = (
        <>
          <Start className={iconClass} />
          <RowSpaceBetween className={iconClass} />
          <SpaceAround className={iconClass} />
        </>
      );
    } else {
      tpl = (
        <>
          <ColumnLayout className={iconClass} />
          <ColumnSpaceAround className={iconClass} />
          <ColumnSpaceBetween className={iconClass} />
        </>
      );
    }
    return <div className={styles.adjustmentContainer}>{tpl}</div>;
  }

  function isStart(key: string) {
    return valueState[key] === 'start' || valueState[key] === 'flex-start';
  }

  function isEnd(key: string) {
    return valueState[key] === 'end' || valueState[key] === 'flex-end';
  }

  function isCenter(key: string) {
    return valueState[key] === 'center';
  }

  function renderAlignmentPreview(direction: 'row' | 'column') {
    const alignmentClass = classNames({
      [styles.rDiagonal180]: direction === 'column',
      [styles.alignmentGrid]: true
    });

    const iconClass = classNames({
      [styles.icon]: true,
      [styles.alignEnd]: true
    });

    return (
      <div className={alignmentClass}>
        {isStart('alignItems') && isStart('justifyContent') ? (
          <AlignStart className={styles.icon} />
        ) : (
          <div className={styles.dot} />
        )}
        {isStart('alignItems') && isCenter('justifyContent') ? (
          <AlignStart className={styles.icon} />
        ) : (
          <div className={styles.dot} />
        )}
        {isStart('alignItems') && isEnd('justifyContent') ? (
          <AlignStart className={styles.icon} />
        ) : (
          <div className={styles.dot} />
        )}
        {isCenter('alignItems') && isStart('justifyContent') ? (
          <AlignCenter className={styles.icon} />
        ) : (
          <div className={styles.dot} />
        )}
        {isCenter('alignItems') && isCenter('justifyContent') ? (
          <AlignCenter className={styles.icon} />
        ) : (
          <div className={styles.dot} />
        )}
        {isCenter('alignItems') && isEnd('justifyContent') ? (
          <AlignCenter className={styles.icon} />
        ) : (
          <div className={styles.dot} />
        )}
        {isEnd('alignItems') && isStart('justifyContent') ? (
          <AlignStart className={iconClass} />
        ) : (
          <div className={styles.dot} />
        )}
        {isEnd('alignItems') && isCenter('justifyContent') ? (
          <AlignStart className={iconClass} />
        ) : (
          <div className={styles.dot} />
        )}
        {isEnd('alignItems') && isEnd('justifyContent') ? (
          <AlignStart className={iconClass} />
        ) : (
          <div className={styles.dot} />
        )}
      </div>
    );
  }

  function handleSwitchAlignment() {
    // TODO
  }

  function renderSpaceAssignmentPreview(direction: 'row' | 'column') {
    const alignmentClass = classNames({
      [styles.rDiagonal180]: direction === 'column',
      [styles.alignmentGrid]: true
    });

    return (
      <div className={alignmentClass}>
        {isStart('alignItems') ? <LongBar className={styles.icon} /> : <div className={styles.dot} />}
        {isStart('alignItems') ? <ShortBar className={styles.icon} /> : <div className={styles.dot} />}
        {isStart('alignItems') ? <LongBar className={styles.icon} /> : <div className={styles.dot} />}
        {isCenter('alignItems') ? <LongBar className={styles.icon} /> : <div className={styles.dot} />}
        {isCenter('alignItems') ? <ShortBar className={styles.icon} /> : <div className={styles.dot} />}
        {isCenter('alignItems') ? <LongBar className={styles.icon} /> : <div className={styles.dot} />}
        {isEnd('alignItems') ? <LongBar className={styles.icon} /> : <div className={styles.dot} />}
        {isEnd('alignItems') ? <ShortBar className={styles.icon} /> : <div className={styles.dot} />}
        {isEnd('alignItems') ? <LongBar className={styles.icon} /> : <div className={styles.dot} />}
      </div>
    );
  }

  function handleSelectingSizeMode(val: string, type: 'width' | 'height') {
    const { direction } = valueState;
    const newValueState = { ...valueState };

    if (val === 'fill') {
      if ((direction as string) === 'row') {
        if (type === 'width') {
          newValueState.flexGrow = 1;
        } else {
          newValueState.alignSelf = 'stretch';
        }
      } else {
        if (type === 'width') {
          newValueState.alignSelf = 'stretch';
        } else {
          newValueState.flexGrow = 1;
        }
      }
    } else {
      if ((direction as string) === 'row') {
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
    }

    setValueState(newValueState);
  }

  function renderLayout() {
    if (!config.layout) {
      return null;
    }

    const { direction } = valueState;

    const iconClass = classNames({
      [styles.r90]: true,
      [styles.icon]: true
    });

    const options = [
      {
        value: 'fill',
        label: (
          <div className={styles.option}>
            <Grow />
            <span>Fill·撑满容器宽度</span>
          </div>
        ),
        tag: (
          <span>
            <Grow />
            Fill
          </span>
        )
      },
      {
        value: 'fixed',
        label: (
          <div className={styles.option}>
            <Fixed />
            <span>Fixed·固定宽度</span>
          </div>
        ),
        tag: (
          <span>
            <Fixed />
            Fixed
          </span>
        )
      },
      {
        value: 'hug',
        label: (
          <div className={styles.option}>
            <Compact />
            <span>Hug·紧凑内容</span>
          </div>
        ),
        tag: (
          <span>
            <Compact />
            Hug
          </span>
        )
      }
    ];

    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <p className={styles.title}>布局</p>
        </div>
        <div className={styles.body}>
          <div className={styles.row}>
            <NumberInput
              value={value.width as number}
              icon={<Width className={styles.numberIcon} />}
              onChange={data => handleChangeStyle(data, 'width')}
            />
            <NumberInput
              value={value.height as number}
              icon={<Height />}
              onChange={data => handleChangeStyle(data, 'height')}
            />
          </div>
          <div className={styles.sizeSelector}>
            <Select
              bordered={false}
              value={widthSizeMode}
              optionLabelProp="tag"
              popupMatchSelectWidth={false}
              onSelect={(val: string) => handleSelectingSizeMode(val, 'width')}
              options={options}
            />
            <Select
              bordered={false}
              value={widthSizeMode}
              optionLabelProp="tag"
              popupMatchSelectWidth={false}
              onSelect={(val: string) => handleSelectingSizeMode(val, 'height')}
              options={options}
            />
          </div>
          <div className={styles.row} style={{ height: 'auto' }}>
            <div className={styles.left}>
              <div className={styles.row}>
                {renderDirectionSwitch()}
                <Divider type="vertical" style={{ height: 8, borderRadius: 0.5, margin: 0 }} />
                {renderWrapSwitch()}
              </div>
              {renderLayoutAdjustment()}
            </div>
            <div className={styles.right}>
              {isStart('justifyContent')
                ? renderAlignmentPreview(direction as 'row' | 'column')
                : renderSpaceAssignmentPreview(direction as 'row' | 'column')}
            </div>
          </div>
          <div className={styles.row}>
            <NumberInput icon={<Gap className={styles.icon} />} />
            <NumberInput icon={<Gap className={iconClass} />} />
          </div>
          <div className={styles.row}>
            <NumberInput icon={<Padding className={styles.icon} />} />
            <NumberInput icon={<Padding className={iconClass} />} />
          </div>
        </div>
      </div>
    );
  }

  function handleSwitchDirection() {
    const newValueState = {
      ...valueState,
      direction: ((valueState.direction as string) === 'row' ? 'column' : 'row') as any
    };
    setValueState(newValueState);
  }

  function handleSwitchWrap(val: string) {
    const newValueState = {
      ...valueState,
      wrap: val
    };
    setValueState(newValueState);
  }

  function renderDirectionSwitch() {
    const { direction } = valueState;
    const rowSelectedClass = classNames({
      [styles.iconSelected]: (direction as string) === 'row',
      [styles.icon]: true
    });
    const columnSelectedClass = classNames({
      [styles.iconSelected]: (direction as string) === 'column',
      [styles.icon]: true,
      [styles.r90]: true
    });
    return (
      <div className={styles.directionContainer}>
        <Arrow className={rowSelectedClass} onClick={handleSwitchDirection} /> <Arrow className={columnSelectedClass} />
      </div>
    );
  }

  function renderWrapSwitch() {
    const { flexWrap } = valueState;
    const wrapClass = classNames({
      [styles.iconSelected]: (flexWrap as string) === 'wrap',
      [styles.icon]: true,
      [styles.f20]: true
    });

    const noWrapClass = classNames({
      [styles.iconSelected]: flexWrap === 'nowrap',
      [styles.icon]: true,
      [styles.f20]: true
    });
    return (
      <div className={styles.wrapContainer}>
        <Wrap className={wrapClass} onClick={() => handleSwitchWrap('wrap')} />
        <NoWrap className={noWrapClass} onClick={() => handleSwitchWrap('nowrap')} />
      </div>
    );
  }

  function handleClickingFillExpandingBtn() {
    // TODO: 初始化填充值
    setFillVisible(true);
  }

  function handleClickingFillCollapseBtn() {
    // TODO: 删除当前填充值
    setFillVisible(false);
  }

  function renderFill() {
    if (!config.fill) {
      return null;
    }

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

    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <p className={styles.title}>填充</p>
          {fillVisible ? null : <PlusThin className={styles.icon} onClick={handleClickingFillExpandingBtn} />}
        </div>
        {fillVisible ? (
          <div className={styles.fillContainer}>
            <Popover trigger={['click']} content={renderColorPalette(colors)} placement="leftTop" arrow={false}>
              <div className={styles.colorResult}>
                <div
                  className={styles.color}
                  style={{ height: 20, width: 20, backgroundColor: fillColorObj?.value || 'transparent' }}
                />
                <p className={styles.colorTitle}>{fillColorObj?.name || '请选择'}</p>
              </div>
            </Popover>
            <Line className={styles.deleteIcon} onClick={handleClickingFillCollapseBtn} />
          </div>
        ) : null}
        <div className={styles.bodySingle}></div>
      </div>
    );
  }

  function handleClickingBorderExpandingBtn() {
    setBorderVisible(true);
  }

  function handleClickingBorderCollapseBtn() {
    setBorderVisible(false);
  }

  function renderBorder() {
    if (!config.border) {
      return null;
    }

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

    return (
      <div className={styles.p12}>
        <div className={styles.row}>
          <div className={styles.titleWrapper}>
            <p className={styles.title}>线框</p>
            {borderVisible ? null : <PlusThin className={styles.icon} onClick={handleClickingBorderExpandingBtn} />}
          </div>
        </div>
        {borderVisible ? (
          <div className={styles.borderContainer}>
            <div>
              <Popover trigger={['click']} content={renderColorPalette(borderOpt)} placement="leftTop" arrow={false}>
                <div className={styles.colorResult}>
                  <div
                    className={styles.color}
                    style={{ height: 20, width: 20, backgroundColor: borderColorObj?.value || 'transparent' }}
                  />
                  <p className={styles.colorTitle}>{borderColorObj?.name || '请选择'}</p>
                </div>
              </Popover>
              <div className={styles.borderBar}>
                <Border2 className={styles.icon} />
                <SingleBorder className={styles.icon} />
                <SingleBorder className={classNames({ [styles.r90]: true, [styles.icon]: true })} />
                <SingleBorder className={classNames({ [styles.r180]: true, [styles.icon]: true })} />
                <SingleBorder className={classNames({ [styles.r270]: true, [styles.icon]: true })} />
              </div>
              <div className={styles.row}>
                <NumberInput icon={<Thickness />} />
                <div className={styles.lineContainer}>
                  <Line className={styles.icon} />
                  <DashedLine className={styles.icon} />
                </div>
              </div>
            </div>
            <Line className={styles.deleteIcon} onClick={handleClickingBorderCollapseBtn} />
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
            <Popover trigger={['click']} content={shadowOptTpl} placement="leftTop" arrow={false}>
              <div>占位符</div>
            </Popover>
            <Line className={styles.deleteIcon} onClick={handleClickingShadowCollapsingBtn} />
          </div>
        ) : null}
      </div>
    );
  }

  function renderText() {
    if (!config.text) {
      return null;
    }

    const textOpt = [
      {
        category: '',
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
      }
    ];

    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <p className={styles.title}>文字</p>
        </div>
        <div className={styles.body}>
          <Popover trigger={['click']} content={renderTextPalette()} placement="leftTop" arrow={false}>
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
          <Popover trigger={['click']} content={renderColorPalette(textOpt)} placement="leftTop" arrow={false}>
            <div className={styles.colorResult}>
              <div
                className={styles.color}
                style={{ height: 20, width: 20, backgroundColor: borderColorObj?.value || 'transparent' }}
              />
              <p className={styles.colorTitle}>{borderColorObj?.name || '请选择'}</p>
            </div>
          </Popover>
          <div className={styles.textBtnBar}>
            <TextAlignLeft className={styles.icon} />
            <TextAlignCenter className={styles.icon} />
            <TextAlignRight className={styles.icon} />
            <TextAlignJustify className={styles.icon} />
            <Divider style={{ height: 8, borderRadius: 0.5, margin: 0 }} type="vertical" />
            <Bold className={styles.icon} />
            <Italian className={styles.icon} />
            <LineThrough className={styles.icon} />
            <UnderLine className={styles.icon} />
          </div>
        </div>
      </div>
    );
  }

  function handleSelectingFillColor(val: { name: string; value: string }) {
    setFillColorObj(val);
  }

  function handleSelectingBorderColor(val: { name: string; value: string }) {
    setBorderColorObj(val);
  }

  function handleSelectingShadow(val: { name: string; value: string }) {
    setShadowObj(val);
  }

  function handleSelectingTextColor(val: { name: string; value: string }) {
    setTextColorObj(val);
  }

  function renderColorPalette(
    colors: {
      category: string;
      data: {
        name: string;
        value: string;
      }[];
    }[]
  ) {
    return (
      <div className={styles.colorPalette}>
        {colors.map(group => {
          return (
            <div key={group.category} className={styles.categoryContainer}>
              <p className={styles.categoryTitle}>{group.category}</p>
              <div className={styles.colorContainer}>
                {group.data.map(item => {
                  return (
                    <Tooltip key={item.name} title={item.name}>
                      <div
                        className={styles.color}
                        style={{ backgroundColor: item.value }}
                        onClick={() => handleSelectingFillColor(item)}
                      />
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
  }

  function renderTextPalette() {
    const options = [
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

    return (
      <>
        {options.map(item => {
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

  console.log('config: ', toJS(config));

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
