/*!
 * Landing for viewing comments.
 *
 * Author:  u/Beach-Brews
 * License: BSD-3-Clause
 */

import '../index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Hub } from '../hub/hub';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Hub />
    </StrictMode>
);
