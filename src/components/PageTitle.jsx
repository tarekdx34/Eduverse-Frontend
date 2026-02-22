import { useEffect } from 'react';

export function PageTitle({ title, children }) {
  useEffect(() => {
    document.title = `${title} | EduVerse`;
  }, [title]);

  return children;
}
