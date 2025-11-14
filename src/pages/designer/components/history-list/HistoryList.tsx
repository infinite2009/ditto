/** 历史列表 */

import { twMerge } from 'tailwind-merge';
import { Tooltip } from 'antd';
import { useHistoryList, useHistoryListStore } from './services';
import dayjs from 'dayjs';
import { useContext } from 'react';
import { DSLStoreContext } from '@/hooks/context';

export function HistoryList() {
  return (
    <>
      <svg className="hidden">
        <symbol width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" id="select">
          <path
            d="M8.00016 2.33325C4.87055 2.33325 2.3335 4.87031 2.3335 7.99992C2.3335 11.1295 4.87055 13.6666 8.00016 13.6666C11.1298 13.6666 13.6668 11.1295 13.6668 7.99992C13.6668 4.87031 11.1298 2.33325 8.00016 2.33325ZM1.3335 7.99992C1.3335 4.31802 4.31826 1.33325 8.00016 1.33325C11.6821 1.33325 14.6668 4.31802 14.6668 7.99992C14.6668 11.6818 11.6821 14.6666 8.00016 14.6666C4.31826 14.6666 1.3335 11.6818 1.3335 7.99992Z"
            fill="#61666D"
          />
          <path
            d="M4.81637 7.93303C5.01163 7.73777 5.32821 7.73777 5.52347 7.93303L6.84694 9.2565C6.89704 9.30663 6.97834 9.30663 7.02844 9.2565L10.4732 5.81173C10.6685 5.61647 10.9851 5.61647 11.1803 5.81173C11.3756 6.00699 11.3756 6.32357 11.1803 6.51883L7.70371 9.99543C7.28067 10.4185 6.59472 10.4185 6.17165 9.99543L4.81637 8.64017C4.62111 8.44487 4.62111 8.12833 4.81637 7.93303Z"
            fill="#61666D"
          />
        </symbol>
        <symbol width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" id="remove">
          <path
            d="M5 3.24992C5 2.32945 5.74619 1.58325 6.66667 1.58325H9.33333C10.2538 1.58325 11 2.32945 11 3.24992V3.83325C11 4.10939 10.7761 4.33325 10.5 4.33325C10.2239 4.33325 10 4.10939 10 3.83325V3.24992C10 2.88173 9.70153 2.58325 9.33333 2.58325H6.66667C6.29847 2.58325 6 2.88173 6 3.24992V3.83325C6 4.10939 5.77614 4.33325 5.5 4.33325C5.22386 4.33325 5 4.10939 5 3.83325V3.24992Z"
            fill="#61666D"
          />
          <path
            d="M1.3335 4.16675C1.3335 3.89061 1.55736 3.66675 1.8335 3.66675H14.1668C14.443 3.66675 14.6668 3.89061 14.6668 4.16675C14.6668 4.44289 14.443 4.66675 14.1668 4.66675H1.8335C1.55736 4.66675 1.3335 4.44289 1.3335 4.16675Z"
            fill="#61666D"
          />
          <path
            d="M3.1665 5.75C3.44264 5.75 3.6665 5.97386 3.6665 6.25V11.6031C3.6665 12.4422 4.2844 13.1308 5.09454 13.1985C5.95042 13.27 6.9932 13.3333 7.99984 13.3333C9.00647 13.3333 10.0492 13.27 10.9051 13.1985C11.7153 13.1308 12.3332 12.4422 12.3332 11.6031V6.25C12.3332 5.97386 12.557 5.75 12.8332 5.75C13.1093 5.75 13.3332 5.97386 13.3332 6.25V11.6031C13.3332 12.9358 12.3426 14.0818 10.9884 14.195C10.1172 14.2678 9.0444 14.3333 7.99984 14.3333C6.95527 14.3333 5.88246 14.2678 5.01124 14.195C3.65706 14.0818 2.6665 12.9358 2.6665 11.6031V6.25C2.6665 5.97386 2.89036 5.75 3.1665 5.75Z"
            fill="#61666D"
          />
          <path
            d="M6.3335 7C6.60964 7 6.8335 7.22387 6.8335 7.5V9.83333C6.8335 10.1095 6.60964 10.3333 6.3335 10.3333C6.05736 10.3333 5.8335 10.1095 5.8335 9.83333V7.5C5.8335 7.22387 6.05736 7 6.3335 7Z"
            fill="#61666D"
          />
          <path
            d="M9.6665 7C9.94264 7 10.1665 7.22387 10.1665 7.5V9.83333C10.1665 10.1095 9.94264 10.3333 9.6665 10.3333C9.39037 10.3333 9.1665 10.1095 9.1665 9.83333V7.5C9.1665 7.22387 9.39037 7 9.6665 7Z"
            fill="#61666D"
          />
        </symbol>
      </svg>
      <div className="flex h-full w-[260px] flex-col bg-white">
        <div className="flex gap-2 px-12 py-[10px] text-[#18191C] text-xs font-medium">
          <div>版本记录</div>
          <ListCount />
        </div>
        <div className="h-0 flex-1 overflow-y-auto">
          <List />
        </div>
      </div>
    </>
  );
}

function ListCount() {
  const len = useHistoryListStore(state => state.versionList.length);
  return <div>({len})</div>;
}

function List() {
  const versionList = useHistoryList();
  const currentVersionId = useHistoryListStore(state => state.currentVersionId);
  return (
    <>
      {versionList.map((item, index) => {
        return (
          <HistoryItem
            key={index}
            versionId={item.versionId}
            order={item.versionNumber}
            time={dayjs(item.ctime).format('YYYY-MM-DD HH:mm')}
            author={item.versionId.slice(0, 8) || '未知用户'}
            isCurrent={item.versionId === currentVersionId}
          />
        );
      })}
    </>
  );
}

function HistoryItem({
  order,
  time,
  author,
  isCurrent,
  versionId
}: {
  order: number;
  time: string;
  author: string;
  isCurrent?: boolean;
  versionId: string;
}) {
  const dslStore = useContext(DSLStoreContext);
  return (
    <div className={twMerge('flex flex-col gap-4 p-12 group', isCurrent ? 'bg-[#4C6DE41A]' : 'hover:bg-[#4C6DE41A]')}>
      <div className="flex gap-1 text-[#18191C] text-xs font-medium">
        <div>{order}.</div>
        <div>{time}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>{author}</div>
        <div className="flex gap-[10px]">
          <div className="">
            <Tooltip title={isCurrent ? '当前为该版本' : null}>
              <svg
                className={twMerge(
                  'h-[16px] w-[16px] group-hover:visible',
                  isCurrent ? 'opacity-50 cursor-not-allowed' : 'invisible cursor-pointer'
                )}
                onClick={() => {
                  useHistoryListStore.getState().setCurrentVersionId(versionId, content => {
                    dslStore.overrideDSL(content);
                  });
                }}
              >
                <use href="#select" />
              </svg>
            </Tooltip>
          </div>
          <div>
            <Tooltip title={isCurrent ? '不可删除' : null}>
              <svg
                className={twMerge(
                  'h-[16px] w-[16px] group-hover:visible',
                  isCurrent ? 'opacity-50 cursor-not-allowed' : 'invisible cursor-pointer'
                )}
                onClick={() => {
                  useHistoryListStore.getState().deleteVersion(versionId);
                }}
              >
                <use href="#remove" />
              </svg>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
