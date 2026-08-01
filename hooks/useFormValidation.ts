import { useState, useCallback } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
  };
};

type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  rules: ValidationRules<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());

  const validateField = useCallback(
    (name: keyof T, value: unknown): string | null => {
      const fieldRules = rules[name];
      if (!fieldRules) return null;

      const str = String(value || '');

      if (fieldRules.required && !str.trim()) {
        return fieldRules.required;
      }
      if (fieldRules.minLength && str.trim().length < fieldRules.minLength.value) {
        return fieldRules.minLength.message;
      }
      if (fieldRules.maxLength && str.trim().length > fieldRules.maxLength.value) {
        return fieldRules.maxLength.message;
      }
      return null;
    },
    [rules]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: FieldErrors<T> = {};
    let valid = true;

    for (const key of Object.keys(rules) as Array<keyof T>) {
      const err = validateField(key, values[key]);
      if (err) {
        newErrors[key] = err;
        valid = false;
      }
    }
    setErrors(newErrors);
    setTouched(new Set(Object.keys(rules) as Array<keyof T>));
    return valid;
  }, [rules, values, validateField]);

  const handleChange = useCallback(
    (name: keyof T, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if already touched
      if (touched.has(name)) {
        const err = validateField(name, value);
        setErrors((prev) => {
          const next = { ...prev };
          if (err) next[name] = err;
          else delete next[name];
          return next;
        });
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => new Set(prev).add(name));
      const err = validateField(name, values[name]);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[name] = err;
        else delete next[name];
        return next;
      });
    },
    [values, validateField]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched(new Set());
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setValues,
    reset,
  };
}
