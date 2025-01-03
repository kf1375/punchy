import './App.css';
import Button from './Components/Button/Button';
function App() {
  return (
    <>
      Im here!
      <Button title={"Test"} disabled={false} onClick={() => console.log("Button clicked!")}/>
    </>      
  );
}

export default App;
