import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CmsProvider } from "./context/CmsContext.jsx";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <CmsProvider>
        <AppRouter />
        <Toaster />
      </CmsProvider>
    </BrowserRouter>
  );
}

export default App;
