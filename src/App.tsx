import { useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'wouter';
import Editor from '@/pages/editor';
import Home from '@/pages/home';
import Preview from '@/pages/preview';
import { initAppData } from '@/service/file';
import CustomTitleBar from '@/components/custom-title-bar';

function App() {
  const [showUI, setShowUI] = useState<boolean>(false);
  useEffect(() => {
    init();
  }, []);

  async function init() {
    await initAppData();
    setShowUI(true);
  }

  return showUI ? (
    <div>
      <CustomTitleBar />
      <Switch>
        <Route path="/">
          <Redirect to="/home" />
        </Route>
        <Route path="/edit/:projectId">
          <Editor />
        </Route>
        <Route path="/home">
          <Home />
        </Route>
        <Route path="/preview/:pageId">
          <Preview />
        </Route>
        <Route>404</Route>
      </Switch>
    </div>
  ) : null;
}

export default App;
