import { useNavigate } from "react-router-dom";
import AppRoutes from "./appRoutes";

import "./assets/css/app.css";
import "./assets/css/siww.css";

export default function AppRouter(props) {
  const navigate = useNavigate();

  const onRedirect = (_route) => {
    navigate(_route);
  }

  return (
      <>     
        <AppRoutes 
          onSoftRedirect = {onRedirect}
        />
      </>
  );
}
