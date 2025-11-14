import { Select, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import NewFileManager from '@/service/new-file-manager';

// 其他属性和 Antd Select 一样
export interface IInterfaceSelectProps {
  appId: string;
  onChange?: (data: any) => void;

  [key: string]: any;
}

const methodColorDict = {
  GET: '#2db7f5',
  POST: '#87d068',
  PUT: '#2db',
  DELETE: '#f50'
};

export default function InterfaceSelect({ appId, onChange, ...otherProps }: IInterfaceSelectProps) {
  const [interfaceOptions, setInterfaceOptions] = useState<
    { value: string; label: string | React.ReactNode; method: string; path: string; name: string }[]
  >([]);

  useEffect(() => {
    handleAppIdChange(appId);
  }, [appId]);

  function handleAppIdChange(value: string) {
    NewFileManager.fetchInterfacesByAppId(value).then(interfaces => {
      const result = interfaces.map(item => {
        return {
          key: item.id,
          value: item.path,
          label: item.name,
          method: item.method,
          path: item.path,
          name: item.name,
          env: item.env
        };
      });
      setInterfaceOptions(result);
    });
  }

  function handleChangingInterface(data: string) {
    if (onChange) {
      const option = interfaceOptions.find(item => item.value === data);
      onChange(option);
    }
  }

  function optionFilter(
    inputValue: string,
    option: { value: string; label: string; method: string; path: string; name: string }
  ) {
    return (
      option.value.toLowerCase().indexOf(inputValue.toLowerCase().trim()) >= 0 ||
      option.label.toLowerCase().indexOf(inputValue.toLowerCase().trim()) >= 0
    );
  }

  return (
    <Select
      showSearch
      filterOption={optionFilter}
      options={interfaceOptions}
      popupMatchSelectWidth={false}
      optionRender={option => {
        return (
          <div>
            <Tag color={option.data.env.toLowerCase() === 'prod' ? 'green' : 'red'}>{option.data.env}</Tag>
            <Tag color={methodColorDict[option.data.method] || '#red'}>{option.data.method.toUpperCase()}</Tag>
            {option.data.label}
          </div>
        );
      }}
      onChange={handleChangingInterface}
      {...otherProps}
    />
  );
}
