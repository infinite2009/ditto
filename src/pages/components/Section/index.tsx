import React from 'react';
import Card from './Card';
import styles from './index.module.less';

export interface SectionProps {
  title: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

type CompoundedComponent = { Card: typeof Card };

const Section: React.FC<SectionProps> & CompoundedComponent = props => {
  const { title, extra, children } = props;
  return (
    <div className={styles['section']}>
      <div className={styles['header']}>
        <span className={styles['title']}>{title}</span>
        {extra}
      </div>
      <div className={styles['body']}>{children}</div>
    </div>
  );
};

Section.Card = Card;

export default Section;
