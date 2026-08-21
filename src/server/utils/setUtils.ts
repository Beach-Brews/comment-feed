/*!
 * Various helper methods.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

type Primitive = string | number;

export const toDistinct = <T extends Primitive>(items: readonly T[]): T[] => {
    return [...new Set(items)];
};