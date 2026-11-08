export function validateValues(values, rules) {
  return Object.entries(rules).reduce((errors, [field, validate]) => {
    const message = validate(values[field], values);
    if (message) errors[field] = message;
    return errors;
  }, {});
}

export function focusFirstInvalid(form, errors) {
  const firstField = Object.keys(errors)[0];
  if (!firstField) return;
  const element = form.elements.namedItem(firstField)
    || form.querySelector(`#${firstField}`);
  element?.focus();
  element?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
}

export function requiredText(value, label) {
  return String(value ?? '').trim() ? '' : `${label} không được để trống.`;
}

export function validEmail(value, optional = false) {
  const email = String(value ?? '').trim();
  if (!email && optional) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? ''
    : 'Vui lòng nhập địa chỉ email hợp lệ.';
}

export function validVietnamesePhone(value) {
  return /^\d{10}$/.test(String(value ?? '').trim())
    ? ''
    : 'Số điện thoại phải gồm đúng 10 chữ số.';
}

export function clearFieldError(setErrors, field) {
  setErrors((current) => {
    if (!current[field]) return current;
    const next = { ...current };
    delete next[field];
    return next;
  });
}
