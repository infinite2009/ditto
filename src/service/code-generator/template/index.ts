export function generateFunction({
  funcName = '',
  args = [],
  body = '',
  comments = '',
  exportStr = '',
  useAsync = false,
  useArrow = false
}) {
  const argsStr = args.map(arg => `${arg}: any`);
  const head = useArrow ? `(${argsStr.join(', ')}) =>` : `function ${funcName}(${argsStr.join(', ')})`;
  return `${exportStr} ${useAsync ? 'async' : ''} ${head}  {
    // TODO(Voltron)：请实现该函数, Voltron 暂时无法为你生成它
    ${comments}
    ${body}
  }`;
}
