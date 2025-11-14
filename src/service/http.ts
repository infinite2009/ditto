import { http } from '@tauri-apps/api';
import { Body } from '@tauri-apps/api/http';

/**
 * 获取登录态，先用密钥获取 code，用 code 去换取登录 session（前端只需要拿到 accountId 即可）
 *
 * code: dashboard 返回的 code，用于换取登录态
 */
export async function loginWithCode(
  code: string
): Promise<http.Response<{ code: number; message: string; data: Record<string, string> }>> {
  // 危险的硬编码，谨防泄露
  const clientSecret =
    process.env.NODE_ENV === 'prod'
      ? 'UVcxCpqTiEkd3r2lOxI5peAZn6kY17BKsvcTqJAkqotUVYZA'
      : 'Mt2TL0SDNSy0klMAlNn9x5unhPrjl6g8';
  // const clientSecret = 'UVcxCpqTiEkd3r2lOxI5peAZn6kY17BKsvcTqJAkqotUVYZA';
  const url =
    process.env.NODE_ENV === 'prod'
      ? 'https://dashboard-mng.bilibili.co/api/v4/client/user_session'
      : 'http://alpha.dashboard.bilibili.co/api/v4/client/user_session';
  // const url = 'https://dashboard-mng.bilibili.co/api/v4/client/user_session';
  const res: http.Response<{ code: number; message: string; data: Record<string, string> }> = await http.fetch(
    // 目前先用 uat 环境登录，以方便访问 uat 上的高达服务
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: Body.json({
        ClientName: 'voltron',
        ClientSecret: clientSecret,
        Code: code
      })
    }
  );
  console.log('login with code: ');
  return res;
}
