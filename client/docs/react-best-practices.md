# React Best Practices and Common Pitfalls

## Infinite Render Loops

React's reactive nature can sometimes lead to infinite render loops, often resulting in the "maximum update depth exceeded" error. Here are the most common causes and their solutions:

### 1. Calling a Function Instead of Passing a Reference

**Problem:**
```jsx
function App() {
  const [terms, setTerms] = useState(false);

  const acceptTerms = () => {
    setTerms(true);
  };

  return (
    <label>
      <input type="checkbox" onChange={acceptTerms()} /> Accept the Terms
    </label>
  );
}
```

**Solution:**
```jsx
function App() {
  const [terms, setTerms] = useState(false);

  const acceptTerms = () => {
    setTerms(true);
  };

  return (
    <label>
      <input type="checkbox" onChange={acceptTerms} /> Accept the Terms
    </label>
  );
}
```

### 2. Effect Updating Its Own Dependency

**Problem:**
```jsx
function App() {
  const [views, setViews] = useState(0);

  useEffect(() => {
    setViews(views + 1);
  }, [views]);

  return <>Some content</>;
}
```

**Solution 1 - Using Callback:**
```jsx
function App() {
  const [views, setViews] = useState(0);

  useEffect(() => {
    setViews((v) => v + 1);
  }, []);

  return <>Some content</>;
}
```

**Solution 2 - Using Initial Render Flag:**
```jsx
function App() {
  const [views, setViews] = useState(0);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      setViews(v => v + 1);
    }
  }, [views, isInitialRender]);

  return <>Some content</>;
}
```

### 3. Effect Depending on Component Function

**Problem:**
```jsx
function App() {
  const [views, setViews] = useState(0);

  const incrementViews = () => {
    setViews((v) => v + 1);
  };

  useEffect(() => {
    incrementViews();
  }, [incrementViews]);

  return <>Some content</>;
}
```

**Solution 1 - Moving Function Inside Effect:**
```jsx
function App() {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const incrementViews = () => {
      setViews((v) => v + 1);
    };
    incrementViews();
  }, []);

  return <>Some content</>;
}
```

**Solution 2 - Using useCallback:**
```jsx
function App() {
  const [views, setViews] = useState(0);

  const incrementViews = useCallback(() => {
    setViews((v) => v + 1);
  }, []);

  useEffect(() => {
    incrementViews();
  }, [incrementViews]);

  return <>Some content</>;
}
```

## Best Practices

1. Always pass function references to event handlers, not function calls
2. Use callback functions with state setters when the new state depends on the previous state
3. Be careful with effect dependencies - only include what's necessary
4. Use `useCallback` for functions that are used in effect dependencies
5. Consider moving functions inside effects when they're only used there
6. Use the initial render flag pattern when you need to run an effect only once but can't remove dependencies

## Common Patterns

### State Updates Based on Previous State
```jsx
// Good
setState(prevState => prevState + 1);

// Bad
setState(state + 1);
```

### Event Handlers
```jsx
// Good
<button onClick={handleClick}>Click me</button>

// Bad
<button onClick={handleClick()}>Click me</button>
```

### Effect Dependencies
```jsx
// Good
useEffect(() => {
  // effect code
}, [necessaryDependency]);

// Bad
useEffect(() => {
  // effect code
}, []); // Missing dependencies
``` 