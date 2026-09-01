/*!
 * Defines API endpoints from the app client.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import { modCmd } from './mod-cmd';
import { init } from './init';
import { comments } from './comments';

export const api = new Hono();

api.route('/', modCmd);
api.route('/', init);
api.route('/', comments);
