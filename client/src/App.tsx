import './App.css'
import axios from 'axios'

function App() {

  const fetchingData = async () => {
    const res = axios.post("http://localhost:8080/email", {
      "from_email": "devmode073@yopmail.com",
      "to_emails": ["aatuchal@yopmail.com"],
      "subject": "H2O",
      "mail": "<h2>H<sub>2</sub>O is most important Element.</h2>",
      "isHTMLMail": true
    })
    const data = (await res).data
    console.log(data);
  }

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={fetchingData}>
          Send Mail
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
