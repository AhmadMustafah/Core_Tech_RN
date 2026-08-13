import React, {
  createContext,
  useCallback,
  useContext,
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

type InputRef = React.RefObject<RNTextInput | null>;

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
};

export const FormScrollView: React.FC<FormScrollViewProps> = ({
  children,
  contentContainerStyle,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 88 : 0,
  style,
  ...scrollProps
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const fieldsRef = useRef<InputRef[]>([]);
  const [revision, setRevision] = useState(0);

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
      if (hadField) {
        bumpRevision();
      }
    },
    [bumpRevision],
  );

  const focusNext = useCallback((index: number) => {
    const nextRef = fieldsRef.current[index + 1];
    if (nextRef?.current) {
      nextRef.current.focus();
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

  const scrollToField = useCallback((_ref: InputRef) => {
    // automaticallyAdjustKeyboardInsets on ScrollView handles most overlap cases.
  }, []);

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
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        {...scrollProps}>
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
});
