import './FormFieldError.css';

export default function FormFieldError({ id, children }) {
  if (!children) return null;
  return <small id={id} className="form-field-error" role="alert">{children}</small>;
}
