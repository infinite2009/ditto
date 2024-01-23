import style from './index.module.less';

export interface IComponentPlaceHolderProps {
  componentDisplayName: string;
}

export default function ComponentPlaceHolder({ componentDisplayName }: IComponentPlaceHolderProps) {
  return <div className={style.componentPlaceHolder}>这是{componentDisplayName}占位符</div>;
}
