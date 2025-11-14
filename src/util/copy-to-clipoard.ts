import React from 'react';
import copyToClipboard from 'copy-to-clipboard';
import DSLStore from '@/service/dsl-store';
import DynamicObject from '@/types/dynamic-object';
import IPropsSchema from '@/types/props.schema';
import {message} from 'antd';

/**
 * 获取当前节点的末级节点的current值
 * @param componentId
 */
function bfsAnalysisComponentIndexesChildren(dslStore: DSLStore, componentId: string) {
  const { componentIndexes } = dslStore.dsl;
  const curComponentIndex = componentIndexes[componentId];
  let curColRowLabel = '';
  if (curComponentIndex) {
    // 存在子节点
    if (curComponentIndex?.children?.length) {
      curComponentIndex?.children?.forEach(v => {
        const isChildComponentExist = componentIndexes[v?.current];
        // 子节点依然存在孙节点
        if (isChildComponentExist) {
          curColRowLabel += `${curColRowLabel ? ' ' : ''}${bfsAnalysisComponentIndexesChildren(dslStore, v?.current)}`;
        } else {
          curColRowLabel += `${v?.current}`;
        }
      });
    } else {
      // 不存在children，则使用displayName兜底
      curColRowLabel += `${curComponentIndex?.displayName}`;
    }
  }
  return curColRowLabel;
}

/**
 * 获取表格行列信息，构造行列二维数组
 */
function analysisTable(dslStore: DSLStore, targetTableProps: DynamicObject<IPropsSchema>) {
  const { columns } = targetTableProps;
  // 二维数组：一维为列，二维为行
  const colRowList = [];
  (columns?.value as any[])?.forEach((cv, colIndex) => {
    // 处理每一列的第一项（即第一行）
    colRowList[colIndex] = [cv.title];
    // 处理每一列的第2->n行
    if (cv.render?.length) {
      cv.render?.forEach(rv => {
        const rowData = bfsAnalysisComponentIndexesChildren(dslStore, rv.current) || '';
        colRowList[colIndex].push(rowData);
      });
    }
  });

  // 矩阵翻转，将数组的以为转换为行，二维项代表列
  const rotateColRowList = colRowList[0]?.map((_, colIndex) => colRowList?.map(row => row?.[colIndex]));
  return rotateColRowList;
}

/**
 * 获取html-tr
 */
function getTableTr(rowList: string[], rowIndex: number) {
  let tdHtmlList = '';
  rowList?.forEach(col => {
    if (!rowIndex) {
      tdHtmlList += `<th>${col}</th>`;
    } else {
      tdHtmlList += `<td>${col}</td>`;
    }
  });
  return `<tr>${tdHtmlList}</tr>`;
}

/**
 * 获取html-table
 */
function handleTableHtml(analysisTableRes: string[][]) {
  let trHtmlList = '';
  analysisTableRes?.forEach((rowList, rowIndex) => {
    trHtmlList += getTableTr(rowList, rowIndex);
  });
  const tableHtml = `<table border="1" cellpadding="5" cellspacing="0" width="100%">${trHtmlList}</table>`;
  return tableHtml;
}

/**
 * 将表格组件html-table注入clipboard
 */
export function handleTableToClipboard(dslStore: DSLStore) {
  const analysisTableRes = analysisTable(dslStore, dslStore.dsl.props[dslStore.selectedComponent?.id]);
  const tableHtml = handleTableHtml(analysisTableRes);
  copyToClipboard(tableHtml, {
    format: 'text/html'
  });
}

/**
 * 递归获取 ReactNode 里面的文字值
 */
export const analysisReactNodeText = node => {
  if (typeof node === 'string') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.reduce((acc, child) => acc + analysisReactNodeText(child), '');
  }

  if (React.isValidElement(node) && (node.props as any)?.children) {
    // 传入子节点，第二个参数为回调函数
    return React.Children?.map((node.props as any)?.children, child => {
      return analysisReactNodeText(child);
    }).join('');
  }

  return '';
};

/**
 * 解析字段信息表格，构造行列二维数组
 */
function analysisFieldTable(fieldColumns, fieldDataSource) {
  // 构造标题行信息
  const colTitle = fieldColumns?.map(fieldColumn => analysisReactNodeText(fieldColumn?.title));

  // 构造内容行信息
  const colContent = fieldDataSource?.map(curField => {
    // 其余行为内容行信息
    const curColRow = fieldColumns?.map(fieldColumn => {
      return curField[fieldColumn.key]?.replace(/\n/g, '<br/>') || '';
    });
    return curColRow;
  });

  const result = [].concat([colTitle], colContent);
  return result;
}

/**
 * 将字段信息表格解析后获取到的html-table注入clipboard
 */
export function handleFieldTableToClipboard(fieldColumns, fieldDataSource) {
  const analysisTableRes = analysisFieldTable(fieldColumns, fieldDataSource);
  const tableHtml = handleTableHtml(analysisTableRes);
  copyToClipboard(tableHtml, {
    format: 'text/html'
  });
  message.success('字段信息已复制，请至外部应用粘贴').then();
}
