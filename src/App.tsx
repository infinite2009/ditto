import { useEffect } from 'react';
import { Route, useLocation } from 'wouter';
import Editor from '@/pages/editor';
import Home from '@/pages/home';
import Preview from '@/pages/preview';
import { initAppData } from '@/service/file';

function App() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    init().then(() => {
      setLocation('/home');
    });
  }, []);

  async function init() {
    await initAppData();
  }

  return (
    <div>
      <Route path="/edit">
        <Editor />
      </Route>
      <Route path="/home">
        <Home />
      </Route>
      <Route path="/preview">
        <Preview />
      </Route>
    </div>
  );
}

export default App;
