import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  type TextInput as RNTextInput,
} from 'react-native';
import { spacing } from '@/theme';

type MeasureInWindowCallback = (x: number, y: number, width: number, height: number) => void;

export type FormFieldHandle = {
  focus: () => void;
  measureInWindow?: (callback: MeasureInWindowCallback) => void;
};

type InputRef = React.RefObject<RNTextInput | FormFieldHandle | null>;

type FormFocusContextValue = {
  register: (ref: InputRef) => number;
  unregister: (ref: InputRef) => void;
  focusNext: (index: number) => void;
  getFieldMeta: (index: number) => { isLast: boolean };
  getIndex: (ref: InputRef) => number;
  scrollToField: (ref: InputRef) => void;
};

const FormFocusContext = createContext<FormFocusContextValue | null>(null);
const FormFocusRevisionContext = createContext(0);

export const useFormFocus = () => useContext(FormFocusContext);

type FormScrollViewProps = ScrollViewProps & {
  keyboardVerticalOffset?: number;
  centerContent?: boolean;
};

const FOCUS_GAP = 20;
const ACTION_GAP = 88;
const MEASURE_DELAY = Platform.OS === 'ios' ? 48 : 100;

const measureNodeInWindow = (node: unknown, callback: MeasureInWindowCallback) => {
  const measurable = node as { measureInWindow?: (cb: MeasureInWindowCallback) => void } | null;
  if (measurable && typeof measurable.measureInWindow === 'function') {
    measurable.measureInWindow(callback);
  }
};

export const FormScrollView: React.FC<FormScrollViewProps> = ({
  children,
  contentContainerStyle,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 88 : 0,
  centerContent = false,
  onScroll,
  style,
  ...scrollProps
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const fieldsRef = useRef<InputRef[]>([]);
  const focusedRef = useRef<InputRef | null>(null);
  const scrollYRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [revision, setRevision] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const bumpRevision = useCallback(() => {
    setRevision(value => value + 1);
  }, []);

  const register = useCallback(
    (ref: InputRef) => {
      if (!fieldsRef.current.includes(ref)) {
        fieldsRef.current.push(ref);
        bumpRevision();
      }
      return fieldsRef.current.indexOf(ref);
    },
    [bumpRevision],
  );

  const unregister = useCallback(
    (ref: InputRef) => {
      const hadField = fieldsRef.current.includes(ref);
      fieldsRef.current = fieldsRef.current.filter(fieldRef => fieldRef !== ref);
      if (focusedRef.current === ref) {
        focusedRef.current = null;
      }
      if (hadField) {
        bumpRevision();
      }
    },
    [bumpRevision],
  );

  const focusNext = useCallback((index: number) => {
    const nextRef = fieldsRef.current[index + 1];
    const nextField = nextRef?.current;
    if (nextField && typeof nextField.focus === 'function') {
      nextField.focus();
      return;
    }
    Keyboard.dismiss();
  }, []);

  const getFieldMeta = useCallback(
    (index: number) => ({
      isLast: index >= 0 && index === fieldsRef.current.length - 1,
    }),
    [],
  );

  const getIndex = useCallback((ref: InputRef) => fieldsRef.current.indexOf(ref), []);

  const scrollFocusedIntoView = useCallback(() => {
    const input = focusedRef.current?.current;
    const scroll = scrollRef.current;
    if (!input || !scroll) {
      return;
    }

    const run = () => {
      measureNodeInWindow(scroll, (_sx, sy, _sw, sh) => {
        measureNodeInWindow(input, (_ix, iy, _iw, ih) => {
          const visibleTop = sy + FOCUS_GAP;
          const visibleBottom = sy + sh - FOCUS_GAP - ACTION_GAP;
          const inputBottom = iy + ih;
          let delta = 0;

          if (inputBottom > visibleBottom) {
            delta = inputBottom - visibleBottom;
          } else if (iy < visibleTop) {
            delta = iy - visibleTop;
          }

          if (Math.abs(delta) < 8) {
            return;
          }

          scroll.scrollTo({
            y: Math.max(0, scrollYRef.current + delta),
            animated: true,
          });
        });
      });
    };

    requestAnimationFrame(run);
  }, []);

  const scheduleScroll = useCallback(() => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = setTimeout(() => {
      scrollFocusedIntoView();
    }, MEASURE_DELAY);
  }, [scrollFocusedIntoView]);

  const scrollToField = useCallback(
    (ref: InputRef) => {
      focusedRef.current = ref;
      scheduleScroll();
    },
    [scheduleScroll],
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: { endCoordinates?: { height?: number } }) => {
      const height = event.endCoordinates?.height ?? 0;
      keyboardHeightRef.current = height;
      setKeyboardHeight(height);
      scheduleScroll();
    };

    const onHide = () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    const didShowSub =
      Platform.OS === 'ios' ? Keyboard.addListener('keyboardDidShow', scheduleScroll) : null;

    return () => {
      showSub.remove();
      hideSub.remove();
      didShowSub?.remove();
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [scheduleScroll]);

  const handleScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
    event => {
      scrollYRef.current = event.nativeEvent.contentOffset.y;
      onScroll?.(event);
    },
    [onScroll],
  );

  const focusValue = useMemo(
    () => ({
      register,
      unregister,
      focusNext,
      getFieldMeta,
      getIndex,
      scrollToField,
    }),
    [register, unregister, focusNext, getFieldMeta, getIndex, scrollToField],
  );

  const keyboardPadding =
    keyboardHeight > 0
      ? Platform.OS === 'ios'
        ? ACTION_GAP
        : keyboardHeight + spacing.md
      : 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        {...scrollProps}
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.content,
          centerContent && styles.centeredContent,
          contentContainerStyle,
          keyboardHeight > 0 && { paddingBottom: spacing.xxl + keyboardPadding },
        ]}>
        <FormFocusContext.Provider value={focusValue}>
          <FormFocusRevisionContext.Provider value={revision}>
            {children}
          </FormFocusRevisionContext.Provider>
        </FormFocusContext.Provider>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const useFormInputFocus = (ref: InputRef) => {
  const focusCtx = useFormFocus();
  const revision = useContext(FormFocusRevisionContext);

  useLayoutEffect(() => {
    if (!focusCtx) {
      return undefined;
    }
    focusCtx.register(ref);
    return () => focusCtx.unregister(ref);
  }, [focusCtx, ref]);

  const fieldIndex = focusCtx ? focusCtx.getIndex(ref) : -1;
  const isLast =
    focusCtx && fieldIndex >= 0 ? focusCtx.getFieldMeta(fieldIndex).isLast : true;

  const onFocus = useCallback(() => {
    focusCtx?.scrollToField(ref);
  }, [focusCtx, ref]);

  const onSubmitEditing = useCallback(() => {
    if (!focusCtx || fieldIndex < 0 || isLast) {
      Keyboard.dismiss();
      return;
    }
    focusCtx.focusNext(fieldIndex);
  }, [focusCtx, fieldIndex, isLast]);

  const returnKeyType =
    focusCtx && fieldIndex >= 0 && revision >= 0 ? (isLast ? 'done' : 'next') : undefined;

  return {
    onFocus,
    onSubmitEditing,
    returnKeyType,
    blurOnSubmit: returnKeyType === 'done',
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
