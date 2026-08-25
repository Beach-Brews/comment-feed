import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort } from '@devvit/web/server';
import { api } from './routes/api';
import { menu } from './routes/menu';
import { jobs } from './routes/jobs';
import { triggers } from './routes/triggers';
import { settings } from './routes/settings';

const app = new Hono();
const internal = new Hono();

internal.route('/menu', menu);
internal.route('/jobs', jobs);
internal.route('/settings', settings);
internal.route('/triggers', triggers);

app.route('/api', api);
app.route('/internal', internal);

serve({
    fetch: app.fetch,
    createServer,
    port: getServerPort(),
});
