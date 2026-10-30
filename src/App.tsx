import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <h1>LunchGo</h1>
      <p>Nền tảng React + TypeScript đã sẵn sàng.</p>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Số lần bấm: {count}
      </button>
    </main>
  )
}

export default App
