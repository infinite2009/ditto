import { ColorPicker, Divider, Form, Input, InputNumber, Select, Switch } from 'antd';
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

    if ((direction as string) === 'row') {
      tpl = (
        <>
          <Start className={styles.icon} />
          <RowSpaceBetween className={styles.icon} />
          <SpaceAround className={styles.icon} />
          <ColumnSpaceBetween className={styles.icon} />
        </>
      );
    } else {
      tpl = (
        <>
          <ColumnLayout className={iconClass} />
          <ColumnSpaceAround className={iconClass} />
        </>
      );
    }
    return <div className={styles.row}>{tpl}</div>;
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

  function handleSelectingWidthSizeMode(val: string) {
    switch (val) {
      case 'fill':
        setValueState({
          ...valueState,
          flexGrow: 1
        });
        break;
      case 'fixed':
        setValueState({
          ...valueState
        });
        break;
    }
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

    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>布局</h3>
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
              onSelect={handleSelectingWidthSizeMode}
              options={[
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
              ]}
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

  function handleSwitchWrap() {
    const newValueState = {
      ...valueState,
      wrap: ((valueState.flexWrap as string) === 'wrap' ? 'noWrap' : 'wrap') as any
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
      <div className={styles.row}>
        <Arrow className={rowSelectedClass} onClick={handleSwitchDirection} /> <Arrow className={columnSelectedClass} />
      </div>
    );
  }

  function renderWrapSwitch() {
    const iconClass = classNames({
      [styles.icon]: true,
      [styles.f20]: true
    });
    return (
      <div className={styles.row}>
        <Wrap className={iconClass} onClick={handleSwitchWrap} />
        <NoWrap className={iconClass} />
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
    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>填充</h3>
          {fillVisible ? null : <PlusThin className={styles.icon} onClick={handleClickingFillExpandingBtn} />}
        </div>
        {fillVisible ? (
          <div className={styles.fillContainer}>
            <div>占位符</div>
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
    return (
      <div className={styles.p12}>
        <div className={styles.row}>
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>线框</h3>
            {borderVisible ? null : <PlusThin className={styles.icon} onClick={handleClickingBorderExpandingBtn} />}
          </div>
        </div>
        {borderVisible ? (
          <div className={styles.borderContainer}>
            <div>
              <div className={styles.row}>占位符</div>
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
    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>阴影</h3>
          {shadowVisible ? null : <PlusThin className={styles.icon} onClick={handleClickingShadowExpandingBtn} />}
        </div>
        {shadowVisible ? (
          <div className={styles.shadowContainer}>
            <div>占位符</div>
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
    return (
      <div className={styles.p12}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>文字</h3>
        </div>
        <div className={styles.body}>
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
