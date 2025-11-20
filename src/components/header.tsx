import Logo from '@/assets/logo.png';
import DefaultAvatar from '@/assets/default_avatar.png';
import { getVoltronCommonUserInfo } from '@/api';
import { useCallback, useEffect, useState } from 'react';
import ROUTE_NAMES from '@/enum';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <Link to={ROUTE_NAMES.PROJECT_MANAGEMENT}>
      <div className="w-screen h-36 border-b border-solid border-line-light px-8 flex items-center justify-between box-border shrink-0">
        <img src={Logo} alt="logo" width={72.21} />
        <CurrentUserAvatar />
      </div>
    </Link>
  );
}

export function CurrentUserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string>(DefaultAvatar);
  const [username, serUsername] = useState<string>('未知用户');
  const init = useCallback(async () => {
    try {
      const {
        data: { avatarUrl }
      } = await getVoltronCommonUserInfo();
        serUsername('foo');
      if (avatarUrl) {
        setAvatarUrl(avatarUrl);
      } else {
        console.warn('user avatar is empty, use default avatar');
      }
    } catch (error) {
      console.error('error_in_avatar_init', error);
    }
  }, []);

  useEffect(() => {
    init();
  }, []);

  return <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full" title={username} />;
}
