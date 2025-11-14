import { useRef } from 'react';

const useAddSelf = (prefix: string) => {
  const idx = useRef(0);
  const generateNewName = (newPrefix) => {
    idx.current++;
    return `${newPrefix || prefix}${idx.current}`;
  };
  return {
    generateNewName
  };
};

export default useAddSelf;
