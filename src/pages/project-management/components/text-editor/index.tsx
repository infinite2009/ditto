import { useState } from 'react';
import { Input } from 'antd';

export interface ITextEditorProps {
  text: string;
  onChange: (val: string) => void;
}

export default function TextEditor({ text, onChange }: ITextEditorProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  function handleClicking() {
    setIsEditing(true);
  }

  function changeText(e: any) {
    if (onChange) {
      onChange(e.target.value.trim());
    }
  }

  return isEditing ? <Input value={text} onPressEnter={changeText} onBlur={changeText} /> : <p>{text}</p>;
}
