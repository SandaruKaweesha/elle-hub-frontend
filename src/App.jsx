import { Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Rankings from "./pages/Rankings";
import OrganizerLayout from "./components/organizer/OrganizerLayout";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerRequests from "./pages/organizer/OrganizerRequests";
import CreateTournament from "./pages/organizer/CreateTournament";
import OrganizerSettings from "./pages/organizer/OrganizerSettings";
import OrganizerNotifications from "./pages/organizer/OrganizerNotifications";
import OrganizerTeams from "./pages/organizer/OrganizerTeams";
import OrganizerReferees from "./pages/organizer/OrganizerReferees";
import OrganizerPlaygrounds from "./pages/organizer/OrganizerPlaygrounds";
import OrganizerSponsors from "./pages/organizer/OrganizerSponsors";
import ManagementTools from "./pages/organizer/ManagementTools";
import MatchDraw from "./pages/organizer/MatchDraw";
import UpdateResults from "./pages/organizer/UpdateResults";
import LiveBroadcastHub from "./pages/organizer/LiveBroadcastHub";
import CertificateQR from "./pages/organizer/CertificateQR";
import ErrorBoundary from "./ErrorBoundary";
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
       <Route path="requests" element={<OrganizerRequests />} />
       <Route path="tournaments/create" element={
         <ErrorBoundary>
           <CreateTournament />
         </ErrorBoundary>
       } />
       <Route path="teams" element={<OrganizerTeams />} />
       <Route path="referees" element={<OrganizerReferees />} />
       <Route path="playgrounds" element={<OrganizerPlaygrounds />} />
       <Route path="sponsors" element={<OrganizerSponsors />} />
       <Route path="settings" element={<OrganizerSettings />} />
       <Route path="notifications" element={<OrganizerNotifications />} />
       <Route path="management-tools" element={<ManagementTools />}>
         <Route path="draw" element={<MatchDraw />} />
         <Route path="results" element={<UpdateResults />} />
         <Route path="broadcast" element={<LiveBroadcastHub />} />
         <Route path="certificate-qr" element={<CertificateQR />} />
       </Route>
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