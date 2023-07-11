import React, { useEffect } from 'react';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';
import { Button, Input, Select, Table, Tabs } from 'antd';

function App() {
  const [valueStateOfC6, setValueStateOfC6] = useState<string>('2');
  const [optionsStateOfC6, setOptionsStateOfC6] = useState<any[]>([
    { value: 1, label: '选项1' },
    { value: '2', label: '选项2' }
  ]);
  useEffect(() => {
    console.log('useEffect valueStateOfC6 works!');
  }, [valueStateOfC6]);
  const itemsConstOfC7 = [
    {
      key: '1',
      label: '测试 Tab 1',
      children: (
        <div>
          <Table />
          <Button>测试按钮2</Button>
        </div>
      )
    },
    {
      key: '2',
      label: '测试 Tab 2',
      children: (
        <div>
          <Table />
          <Button>测试按钮3</Button>
        </div>
      )
    }
  ];
  const itemsConstOfC1 = [
    {
      key: '1',
      label: 'Tab 1',
      children: <Tabs items={itemsConstOfC7} />
    },
    {
      key: '2',
      label: 'Tab 2',
      children: <Button>测试按钮3</Button>
    }
  ];
  return (
    <div>
      <div>
        <Input.Search value="1" />
        <Select value={valueStateOfC6} options={optionsStateOfC6} />
      </div>
      <Tabs items={itemsConstOfC1} />
    </div>
  );
}

export default App;
