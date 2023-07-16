import React, { useEffect } from 'react';
import { useState } from 'react';
import * as dsl from '@/mock/tab-case.json';
import IPageSchema from '@/types/page.schema';

import './App.css';
import PageRenderer from '@/pages/components/page-renderer';
import { Button, Input, Select, Space, Table, Tabs } from 'antd';

function App() {
  const [dslState, setDslState] = useState<IPageSchema>();

  useEffect(() => {
    fetchDSL().then(data => {
      setDslState(data);
    });
  }, []);

  async function fetchDSL(): Promise<IPageSchema> {
    return new Promise<IPageSchema>(resolve => {
      resolve(dsl as unknown as IPageSchema);
    });
  }

  const [dataSourceStateOfC2, setDataSourceStateOfC2] = useState<any[]>([
    {
      key: '1',
      firstName: 'John',
      lastName: 'Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer']
    },
    { key: '2', name: 'Jim', lastName: 'Green', age: 42, address: 'London No. 1 Lake Park', tags: ['loser'] },
    { key: '3', name: 'Joe', lastName: 'Black', age: 32, address: 'Sydney No. 1 Lake Park', tags: ['cool', 'teacher'] }
  ]);
  const [valueStateOfC6, setValueStateOfC6] = useState<string>('2');
  const [optionsStateOfC6, setOptionsStateOfC6] = useState<any[]>([
    { value: 1, label: '选项1' },
    { value: '2', label: '选项2' }
  ]);
  useEffect(() => {
    console.log('useEffect valueStateOfC6 works!');
  }, [valueStateOfC6]);
  const columnsConstOfC2 = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: () => {
        return <a>text</a>;
      }
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age'
    },
    {
      title: 'Action',
      key: 'action',
      render: () => {
        return (
          <Space>
            <a>Invite Lida</a>
            <a>Delete</a>
          </Space>
        );
      }
    }
  ];
  const itemsConstOfC7 = [
    {
      key: '1',
      label: '测试 Tab 1',
      children: (
        <div>
          <Table columns={columnsConstOfC2} dataSource={dataSourceStateOfC2} />
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
      {dslState ? <PageRenderer dsl={dslState} /> : null}
      <div>+++++++++++++++++++++++++++++++++分割线++++++++++++++++++++++++++++++++++++++++++++++++</div>
      <div>
        <div>
          <Input.Search value="1" />
          <Select value={valueStateOfC6} options={optionsStateOfC6} />
        </div>
        <Tabs items={itemsConstOfC1} />
      </div>
    </div>
  );
}

export default App;
