import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('entered');
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevLocation.current) {
      setTransitionStage('exiting');

      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('entering');
        prevLocation.current = location.pathname;

        // Small delay then mark as entered
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionStage('entered');
          });
        });
      }, 150);

      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  const style = {
    exiting: {
      opacity: 0,
      transform: 'translateY(-4px)',
      filter: 'blur(2px)',
      transition: 'all 0.15s cubic-bezier(0.4, 0, 1, 1)',
    },
    entering: {
      opacity: 0,
      transform: 'translateY(8px)',
      filter: 'blur(4px)',
    },
    entered: {
      opacity: 1,
      transform: 'translateY(0)',
      filter: 'blur(0)',
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    },
  };

  return (
    <div style={style[transitionStage]}>
      {displayChildren}
    </div>
  );
}
