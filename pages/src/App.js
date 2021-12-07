import React from "react";
import './App.css';
import {
  BrowserRouter as Router,
  useLocation
} from "react-router-dom";
import LoomOembed from './views/loomOembed';

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function QueryParams() {
  const query = useQuery();
  const sharedUrl = query.get("sharedUrl");

  if (!sharedUrl) {
    return (
      <p>ERROR: Not set query param "sharedUrl"</p>
    )
  }

  return (
    <LoomOembed 
      sharedUrl={sharedUrl}
    />
  );
}

export default function App() {
  return (
    <Router>
      <QueryParams />
    </Router>
  );
};
