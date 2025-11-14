import { Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { postVoltronCommonProxy } from '@/api';

export interface IAppSelect {
  defaultValue?: string;
  onChange?: (value: string, opt: { value: string; label: string }) => void;
  placeholder?: string;
  value?: string;
}

export default function AppSelect(props: IAppSelect) {
  const [appIds, setAppIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAppIds().then();
  }, []);

  async function fetchAppIds() {
    if (window.location.hostname.startsWith('uat-')) {
      setAppIds(['informatization.purchase.pur-center', 'ops.fin-api.payproxy', 'informatization.legal-fe.data-report-server']);
    } else {
      const res = await postVoltronCommonProxy({
        url: 'https://cloud.bilibili.co/akaling/v1/helper/apps/all',
        method: 'GET',
      });
      setAppIds(res.data.items.map((app: { path: string }) => app.path));
    }
  }

  const appOptions = useMemo(() => {
    return (appIds || []).map(appId => {
      return {
        value: appId,
        label: appId
      };
    });
  }, [appIds]);

  return <Select showSearch optionFilterProp="label" options={appOptions} {...props} />;
}
