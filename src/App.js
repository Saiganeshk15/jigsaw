import './App.css';
import { BrowserRouter} from 'react-router-dom';
import { Pages} from "./pages/Pages";

function App() {

  return (
    <BrowserRouter>
        <Pages />
    </BrowserRouter>
  );
}

export default App;
