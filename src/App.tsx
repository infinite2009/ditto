import { useEffect } from 'react';
import { Route, useLocation } from 'wouter';
import Editor from '@/pages/editor';
import Home from '@/pages/home';
import Preview from '@/pages/preview';
import DSLContext from '@/hooks/dsl-ctx';
import DslProcessor from '@/service/dsl-process';

function App() {
  const [, setLocation] = useLocation();
  const dslProcessor = new DslProcessor();
  useEffect(() => {
    setLocation('/home');
  }, []);
  return (
    <div>
      <Route path="/edit">
        <DSLContext.Provider value={dslProcessor}>
          <Editor />
        </DSLContext.Provider>
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
