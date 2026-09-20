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

const FOCUS_GAP = 24;
const KEYBOARD_CONTENT_PADDING = 120;
const MEASURE_DELAY = Platform.OS === 'ios' ? 16 : 80;

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
  const [revision, setRevision] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

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
          const visibleBottom = sy + sh - FOCUS_GAP;
          const inputBottom = iy + ih;

          if (inputBottom > visibleBottom) {
            scroll.scrollTo({
              y: Math.max(0, scrollYRef.current + (inputBottom - visibleBottom)),
              animated: true,
            });
          } else if (iy < visibleTop) {
            scroll.scrollTo({
              y: Math.max(0, scrollYRef.current - (visibleTop - iy)),
              animated: true,
            });
          }
        });
      });
    };

    requestAnimationFrame(() => {
      setTimeout(run, MEASURE_DELAY);
    });
  }, []);

  const scrollToField = useCallback(
    (ref: InputRef) => {
      focusedRef.current = ref;
      scrollFocusedIntoView();
    },
    [scrollFocusedIntoView],
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardOpen(true);
      scrollFocusedIntoView();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOpen(false);
    });
    const didShowSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardDidShow', () => {
            scrollFocusedIntoView();
          })
        : null;
    const frameSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardDidChangeFrame', () => {
            scrollFocusedIntoView();
          })
        : null;

    return () => {
      showSub.remove();
      hideSub.remove();
      didShowSub?.remove();
      frameSub?.remove();
    };
  }, [scrollFocusedIntoView]);

  useEffect(() => {
    if (keyboardOpen) {
      scrollFocusedIntoView();
    }
  }, [keyboardOpen, scrollFocusedIntoView]);

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

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        {...scrollProps}
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.content,
          centerContent && !keyboardOpen && styles.centeredContent,
          contentContainerStyle,
          keyboardOpen && styles.keyboardContent,
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
  keyboardContent: {
    paddingBottom: spacing.xxl + KEYBOARD_CONTENT_PADDING,
  },
});
