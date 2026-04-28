---
name: react-dashboard
description: Build modern React dashboards with data visualization, tables, charts, and interactive components. Use when creating admin panels, analytics dashboards, or data-heavy user interfaces.
---

# React Dashboard Development

Build professional dashboards with React.

## Project Setup

```bash
npm create vite@latest dashboard -- --template react
cd dashboard
npm install
npm install recharts lucide-react
```

## Dashboard Layout Pattern

```jsx
// App.jsx
function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />
        <DashboardContent />
      </main>
    </div>
  );
}
```

## Common Components

### Data Table
```jsx
function DataTable({ columns, data, onRowClick }) {
  return (
    <table className="data-table">
      <thead>
        <tr>{columns.map(col => <th key={col.key}>{col.title}</th>)}</tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id} onClick={() => onRowClick(row)}>
            {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Chart Component
```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

function MetricChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#00f0ff" />
    </LineChart>
  );
}
```

### Status Badge
```jsx
function StatusBadge({ status }) {
  const styles = {
    active: { bg: '#00ff88', color: '#000' },
    warning: { bg: '#ffaa00', color: '#000' },
    error: { bg: '#ff4444', color: '#fff' },
  };
  return (
    <span className="badge" style={styles[status]}>
      {status}
    </span>
  );
}
```

## State Management

```jsx
import { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <DataTable 
        data={data} 
        onRowClick={setSelectedItem}
      />
      {selectedItem && <DetailPanel item={selectedItem} />}
    </div>
  );
}
```

## Styling (Dark Theme)

```css
:root {
  --bg: #050505;
  --bg-elevated: #0a0a0a;
  --border: #1a1a1a;
  --text: #ffffff;
  --text-secondary: #888888;
  --accent: #00f0ff;
}

.app {
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
```

## Best Practices

1. **Use functional components** with hooks
2. **Lift state up** when needed
3. **Memoize expensive calculations** with `useMemo`
4. **Use CSS variables** for theming
5. **Handle loading/error states**
