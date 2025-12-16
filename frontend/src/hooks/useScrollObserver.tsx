import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";

export function useScrollObserver() {
  const [isScrolled, setIsScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const ScrollObserver = useCallback(
    () => <ObserverElement ref={ref} />,
    []
  );

  return { isScrolled, ScrollObserver };
}

// Styled Components

const ObserverElement = styled.div`
  height: 30px;
  margin-bottom: -30px;
  pointer-events: none;
`;
