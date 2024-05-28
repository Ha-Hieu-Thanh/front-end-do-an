import { useEffect, useRef, useState } from 'react';
import styles from './CollapsibleContentStyle.module.scss';

const CollapsibleContent = ({ content }: { content: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkHeight = () => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setShouldShowToggle(contentHeight > 100);
    }
  };

  useEffect(() => {
    checkHeight();
    const images = contentRef.current?.getElementsByTagName('img');
    if (images) {
      Array.from(images).forEach((img) => {
        img.addEventListener('load', checkHeight);
      });
    }
    return () => {
      if (images) {
        Array.from(images).forEach((img) => {
          img.removeEventListener('load', checkHeight);
        });
      }
    };
  }, [content]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          maxHeight: expanded ? 'none' : '100px',
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {shouldShowToggle && (
        <span onClick={toggleExpanded} className={styles.toggle}>
          {expanded ? 'Show less' : '...Show more'}
        </span>
      )}
    </div>
  );
};
export default CollapsibleContent;
