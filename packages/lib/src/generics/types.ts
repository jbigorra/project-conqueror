/**
 * Utility type that makes a value optionally undefined.
 *
 * @example
 * ```ts
 * import type { Undefinedable } from "@prj-conq/lib/generics";
 *
 * function findUser(id: string): Undefinedable<User> {
 *   return users.get(id); // User | undefined
 * }
 * ```
 */
export type Undefinedable<T> = T | undefined;
