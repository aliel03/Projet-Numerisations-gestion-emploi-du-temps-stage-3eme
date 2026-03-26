import "../style/App.css";
import Navbar from "./Navbar/Navbar";
import axiosInstance from "../config/axiosConfig";
import { useState, useEffect } from "react";
import Rootes from "./Routes";

function App() {
  const personne = localStorage.getItem("personne");
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [semaine, setSemaine] = useState(() => {
    return localStorage.getItem("semaineStage") || "";
  });

  useEffect(() => {
    if (personne && userId) {
      axiosInstance
        .get(`/${personne}/${userId}`)
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("userRole", res.data.role);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("semaineStage", semaine);
  }, [semaine]);

  return (
    <div className="App">
      <Navbar user={user} setUser={setUser} personne={personne} />
      <Rootes
        user={user}
        setUser={setUser}
        semaine={semaine}
        setSemaine={setSemaine}
      />
      <img src="/fleurs.png" alt="fleurs" className="image-fixed-bottom" />
    </div>
  );
}

export default App;
