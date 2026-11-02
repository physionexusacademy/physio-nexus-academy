import { cloneElement, isValidElement, useId } from "react";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactElement;
}) {
  const generatedId = useId();
  const childId = (children.props as { id?: string }).id ?? generatedId;
  const errorId = error ? `${childId}-error` : undefined;

  const child = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: childId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": errorId,
      })
    : children;

  return (
    <div>
      <label htmlFor={childId} className="mb-1.5 block text-sm font-medium text-navy-700">
        {label}
      </label>
      {child}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
