import { useState } from 'react';
import { Button } from './components/ui/button';

export function TestSimple() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4">
      <h1>Simple Test</h1>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment
      </Button>
    </div>
  );
}

export default TestSimple;
