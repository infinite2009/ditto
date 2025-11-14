import developmentList from './developer_list.json';

export function isDeveloperList() {
  // 从cookie里获取 username
  const username = document.cookie
    .split('; ')
    .find(row => row.startsWith('username='))
    ?.split('=')[1];
  return developmentList.developer_list.includes(username);
}
