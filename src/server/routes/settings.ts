/*!
 * Defines API endpoints for settings validation.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import type {
    SettingsValidationRequest,
    SettingsValidationResponse,
} from '@devvit/web/shared';
import { Logger } from '../utils/Logger';

export const settings = new Hono();

settings.post('/validate-comment-count', async (c) => {
    const logger = await Logger.Create('Setting Validation - Comment Count');
    try {
        const { value } = await c.req.json<SettingsValidationRequest<number>>();
        logger.debug(`Received value: ${value}`);

        if (value === undefined || isNaN(value) || value < 5) {
            logger.error(`${value} is less than 5, undefined, or NaN`);
            return c.json<SettingsValidationResponse>({
                success: false,
                error: 'Value should be greater or equal to 5'
            });
        }

        if (value > 5000) {
            logger.error(`${value} is greater than 5000`);
            return c.json<SettingsValidationResponse>({
                success: false,
                error: 'Value should be less than or equal to 5000'
            });
        }

        logger.info(`updated to ${value}`);
        return c.json<SettingsValidationResponse>({ success: true }, 200);

    } catch (error) {
        logger.error(`Error validating comment count: `, error);
        return c.json<SettingsValidationResponse>(
            {
                success: false,
                error: 'Failed validate comment count value',
            },
            500
        );
    }
});
