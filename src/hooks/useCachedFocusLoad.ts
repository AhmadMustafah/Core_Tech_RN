import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@/redux/hooks';

const FRESH_MS = 12000;

export const useCachedFocusLoad = (load: () => void, queryKey = '') => {
  const revision = useAppSelector(state => state.dataSync.revision);
  const cache = useRef({ revision: -1, queryKey: '', at: 0 });
  const loadRef = useRef(load);
  loadRef.current = load;

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (
        cache.current.revision === revision &&
        cache.current.queryKey === queryKey &&
        now - cache.current.at < FRESH_MS
      ) {
        return;
      }
      cache.current = { revision, queryKey, at: now };
      loadRef.current();
    }, [queryKey, revision]),
  );
};
