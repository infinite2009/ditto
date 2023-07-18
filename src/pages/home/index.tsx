import { Button } from 'antd';
import { Link } from 'wouter';

export default function Home() {
  return (
    <div>
      <div>待完成</div>
      <div>
        <Button>
          <Link href="/edit">
            <a>体验 Demo</a>
          </Link>
        </Button>
        <Button>
          <Link href="/preview">
            <a>查看样例</a>
          </Link>
        </Button>
      </div>
    </div>
  );
}
