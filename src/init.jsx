import * as React from 'react';
import { render } from 'react-dom';
import App from './App';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './assets/application.sass';

render(
  <App />,
  document.getElementById('container'),
);
