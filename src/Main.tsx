import { useAtom } from "jotai";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { initListener } from "./backend-listener";
import DashLayout from "./components/layouts/DashLayout";
import DialogLayout from "./components/layouts/DialogLayout";
import Dashboard from "./components/screens/Dashboard";
import PromptDetailsScreen from "./components/screens/PromptDetailsScreen";
import StartDialog from "./components/screens/StartDialog";
import { signInAtom } from "./jotai";

const Main = () => {
  const [signIn] = useAtom(signInAtom);
  initListener();

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DialogLayout />}>
          <Route
            path="/"
            element={
              signIn.signedIn ? <Navigate to="/home" /> : <StartDialog />
            }
          />
        </Route>
        <Route path="/home" element={<DashLayout />}>
          <Route path="/home" element={<Dashboard />} />
          <Route
            path="/home/details/:promptId"
            element={<PromptDetailsScreen />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default Main;
