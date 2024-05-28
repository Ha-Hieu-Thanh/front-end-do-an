import RootWrapper from '@wrappers/RootWrapper';
import { BrowserRouter as Router, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserHistory } from 'history';
import * as React from 'react';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      cacheTime: 24 * 3600 * 1000, // cache for 1 day
      retry: false,
    },
  },
});
export const history = require('history').createBrowserHistory();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HistoryRouter history={history}>
        <RootWrapper />
      </HistoryRouter>
    </QueryClientProvider>
  );
}

export default App;
