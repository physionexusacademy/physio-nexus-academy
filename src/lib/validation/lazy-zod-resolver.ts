import { toNestErrors, validateFieldsNatively } from "@hookform/resolvers";
import type { FieldError, FieldValues, Resolver } from "react-hook-form";

type ZodIssue = { path: PropertyKey[]; code: string; message: string };
type ZodLikeSchema = {
  safeParseAsync(values: unknown): Promise<{ success: true; data: unknown } | { success: false; error: { issues: ZodIssue[] } }>;
};

/**
 * A react-hook-form resolver for zod 4 schemas that loads the schema (and zod, ~35 KB
 * gzipped) only when the form is first used — `preload()` on focus, or at the latest on
 * the first validation.
 *
 * It reads zod 4 issues itself: @hookform/resolvers 3.x's zodResolver only understands
 * zod 3 errors and threw instead of showing the field messages.
 */
export function lazyZodResolver<T extends FieldValues>(load: () => Promise<{ schema: unknown }>): Resolver<T> & { preload: () => void } {
  let ready: Promise<ZodLikeSchema> | null = null;
  const get = () => {
    ready ??= load().then(({ schema }) => schema as ZodLikeSchema);
    return ready;
  };

  const resolver = (async (values, _context, options) => {
    const schema = await get();
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      if (options.shouldUseNativeValidation) validateFieldsNatively({}, options);
      return { values: result.data as T, errors: {} };
    }
    // First message per field, in schema order (what the forms show under each input).
    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String).join(".");
      if (!errors[path]) errors[path] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: toNestErrors(errors, options) };
  }) as Resolver<T> & { preload: () => void };

  resolver.preload = () => void get();
  return resolver;
}
