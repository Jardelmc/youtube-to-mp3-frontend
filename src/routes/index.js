import React from 'react';
import { Switch } from 'react-router-dom';

import Route from './Route';
import Index from '../pages/Index';

export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={Index} />

      <Route path="/" component={() => <h1>404</h1>} />
    </Switch>
  );
}
