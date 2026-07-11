import { Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Rankings from "./pages/Rankings";
import OrganizerLayout from "./components/organizer/OrganizerLayout";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import RefereeLayout from "./components/referee/RefereeLayout";
import RefereeDashboard from "./pages/referee/RefereeDashboard";

function App() {
  return (
    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/rankings" element={<Rankings/>}/>
     <Route path="/register" element={<Register/>}/>
     <Route path="/login" element={<Login/>}/>
     
     {/* Organizer Routes */}
     <Route path="/organizer" element={<OrganizerLayout />}>
       <Route index element={<OrganizerDashboard />} />
       <Route path="dashboard" element={<OrganizerDashboard />} />
     </Route>

     {/* Referee Routes */}
     <Route path="/referee" element={<RefereeLayout />}>
       <Route index element={<RefereeDashboard />} />
       <Route path="dashboard" element={<RefereeDashboard />} />
     </Route>
    </Routes>
  );
}

export default App;