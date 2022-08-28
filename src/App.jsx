import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import ControlRoom from "./pages/ControlRoom/ControlRoom";
import DataCollectionProcess from "./pages/ControlRoom/DataCollectionProcess";
import ManualNavigation from "./pages/ControlRoom/ManualNavigation";
import PatientsData from "./pages/ControlRoom/PatientsData";
import PreparationSetup from "./pages/ControlRoom/PreparationSetup";
import RobotMonitoring from "./pages/ControlRoom/RobotMonitoring";
import Login from "./pages/Login";
import PatientRoom from "./pages/PatientRoom/PatientRoom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="patient-room" element={<PatientRoom/>}/>
        <Route path="control-room" element={<ControlRoom/>}>
          <Route path="data-colection-process" element={<DataCollectionProcess/>}/>
          <Route path="manual-navigation" element={<ManualNavigation/>}/>
          <Route path="patients-data" element={<PatientsData/>}/>
          <Route path="preparation-setup" element={<PreparationSetup/>}/>
          <Route path="robot-monitoring" element={<RobotMonitoring/>}/>
        </Route>
      </Routes>
    </>
  );
}

export default App;
