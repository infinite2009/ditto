import { Input } from 'antd';

export default function ComponentPanel() {
  function handleSearching() {
    console.log('handle searching component');
  }

  function renderComponentList() {
    return <div>component list works!</div>;
  }

  return (
    <div>
      <Input.Search placeholder="请输入组件名" onSearch={handleSearching} />
      {renderComponentList()}
    </div>
  );
}
