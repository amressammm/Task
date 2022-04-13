import logo from "./logo.svg";
import {
  BrowserRouter,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Form from "./pages/Form";
import ShowPage from "./pages/showPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Form />} exact={true}></Route>
          <Route path="/showPage" element={<ShowPage />} exact={true}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
