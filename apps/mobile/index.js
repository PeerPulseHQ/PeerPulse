// Globals patch MUST be first — before React, before libp2p, before everything.
import './shims/globals.js';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
