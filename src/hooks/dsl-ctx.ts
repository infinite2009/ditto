import { createContext } from 'react';
import DslProcessor from '@/service/dsl-process';

const DSLContext = createContext<DslProcessor>(new DslProcessor());

export default DSLContext;
