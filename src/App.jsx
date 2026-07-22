import { Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Rankings from "./pages/Rankings";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import Matches from "./pages/Matches";
import TeamLayout from "./components/team/TeamLayout";
import TeamDashboard from "./pages/team/TeamDashboard";
import JoinTournamentRequest from "./pages/team/JoinTournamentRequest";
import TeamSettings from "./pages/team/TeamSettings";
import TeamNotifications from "./pages/team/TeamNotifications";
import TeamProfile from "./pages/team/TeamProfile";
import TeamTournaments from "./pages/team/TeamTournaments";
import TeamRequests from "./pages/team/TeamRequests";
import TeamMatches from "./pages/team/TeamMatches";
import OrganizerLayout from "./components/organizer/OrganizerLayout";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerRequests from "./pages/organizer/OrganizerRequests";
import CreateTournament from "./pages/organizer/CreateTournament";
import OrganizerSettings from "./pages/organizer/OrganizerSettings";
import OrganizerNotifications from "./pages/organizer/OrganizerNotifications";
import OrganizerTeams from "./pages/organizer/OrganizerTeams";
import ManageTournament from "./pages/organizer/ManageTournament";
import OrganizerReferees from "./pages/organizer/OrganizerReferees";
import OrganizerPlaygrounds from "./pages/organizer/OrganizerPlaygrounds";
import OrganizerSponsors from "./pages/organizer/OrganizerSponsors";
import MatchDraw from "./pages/organizer/MatchDraw";
import UpdateResults from "./pages/organizer/UpdateResults";
import LiveBroadcastHub from "./pages/organizer/LiveBroadcastHub";
import CertificateQR from "./pages/organizer/CertificateQR";
import ErrorBoundary from "./ErrorBoundary";
import RefereeLayout from "./components/referee/RefereeLayout";
import RefereeDashboard from "./pages/referee/RefereeDashboard";
import RefereeSettings from "./pages/referee/RefereeSettings";
import RefereeTournaments from "./pages/referee/RefereeTournaments";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminUsers from "./pages/admin/AdminUsers";
import SponsorLayout from "./components/sponsor/SponsorLayout";
import SponsorDashboard from "./pages/sponsor/SponsorDashboard";
import RefereeAvailability from "./pages/referee/RefereeAvailability";
import RefereeSchedule from "./pages/referee/RefereeSchedule";
import RefereeRequests from "./pages/referee/RefereeRequests";
import RefereeHistory from "./pages/referee/RefereeHistory";
import VerifyCertificate from "./pages/public/VerifyCertificate";
import PlaygroundLayout from "./components/playground/PlaygroundLayout";
import PlaygroundDashboard from "./pages/playground/PlaygroundDashboard";
import PlaygroundTournaments from "./pages/playground/PlaygroundTournaments";
import PlaygroundDetails from "./pages/playground/PlaygroundDetails";
import PlaygroundSchedule from "./pages/playground/PlaygroundSchedule";
import PlaygroundAvailability from "./pages/playground/PlaygroundAvailability";
import PlaygroundRequests from "./pages/playground/PlaygroundRequests";
import PlaygroundHistory from "./pages/playground/PlaygroundHistory";
import PlaygroundSettings from "./pages/playground/PlaygroundSettings";

function App() {
  return (
    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/tournaments" element={<Tournaments/>}/>
     <Route path="/tournaments/:id" element={<TournamentDetails/>}/>
     <Route path="/matches" element={<Matches/>}/>
     <Route path="/rankings" element={<Rankings/>}/>
     <Route path="/register" element={<Register/>}/>
     <Route path="/login" element={
       <ErrorBoundary>
         <Login />
       </ErrorBoundary>
     }/>
     <Route path="/verify/:id" element={<VerifyCertificate/>}/>
     
     {/* Organizer Routes */}
     <Route path="/organizer" element={
       <ErrorBoundary>
         <OrganizerLayout />
       </ErrorBoundary>
     }>
       <Route index element={<OrganizerDashboard />} />
       <Route path="dashboard" element={<OrganizerDashboard />} />
       <Route path="requests" element={<OrganizerRequests />} />
       <Route path="tournaments/create" element={
         <ErrorBoundary>
           <CreateTournament />
         </ErrorBoundary>
       } />
       <Route path="tournaments/manage/:id" element={<ManageTournament />}>
         <Route path="draw" element={<MatchDraw />} />
         <Route path="results" element={<UpdateResults />} />
         <Route path="broadcast" element={<LiveBroadcastHub />} />
         <Route path="certificate-qr" element={<CertificateQR />} />
       </Route>
       <Route path="teams" element={<OrganizerTeams />} />
       <Route path="referees" element={<OrganizerReferees />} />
       <Route path="playgrounds" element={<OrganizerPlaygrounds />} />
       <Route path="sponsors" element={<OrganizerSponsors />} />
       <Route path="settings" element={<OrganizerSettings />} />
       <Route path="notifications" element={<OrganizerNotifications />} />
     </Route>

     {/* Admin Routes */}
     <Route path="/admin" element={<AdminLayout />}>
       <Route index element={<AdminDashboard />} />
       <Route path="dashboard" element={<AdminDashboard />} />
       <Route path="requests" element={<AdminRequests />} />
       <Route path="tournaments" element={<AdminTournaments />} />
       <Route path="users" element={<AdminUsers />} />
     </Route>

     {/* Team Routes */}
      <Route path="/team" element={<TeamLayout />}>
        <Route index element={<TeamDashboard />} />
        <Route path="dashboard" element={<TeamDashboard />} />
        <Route path="tournaments" element={<TeamTournaments />} />
        <Route path="requests" element={<TeamRequests />} />
        <Route path="matches" element={<TeamMatches />} />
        <Route path="join-tournament/:id" element={<JoinTournamentRequest />} />
        <Route path="settings" element={<TeamSettings />} />
        <Route path="notifications" element={<TeamNotifications />} />
        <Route path="profile" element={<TeamProfile />} />
      </Route>

     {/* Referee Routes */}
     <Route path="/referee" element={<RefereeLayout />}>
       <Route index element={<RefereeDashboard />} />
       <Route path="dashboard" element={<RefereeDashboard />} />
       <Route path="tournaments" element={<RefereeTournaments />} />
       <Route path="availability" element={<RefereeAvailability />} />
       <Route path="schedule" element={<RefereeSchedule />} />
       <Route path="requests" element={<RefereeRequests />} />
       <Route path="history" element={<RefereeHistory />} />
       <Route path="log" element={<RefereeHistory />} />
       <Route path="settings" element={<RefereeSettings />} />
     </Route>

     {/* Playground Routes */}
     <Route path="/playground" element={<PlaygroundLayout />}>
       <Route index element={<PlaygroundDashboard />} />
       <Route path="dashboard" element={<PlaygroundDashboard />} />
       <Route path="tournaments" element={<PlaygroundTournaments />} />
       <Route path="details" element={<PlaygroundDetails />} />
       <Route path="schedule" element={<PlaygroundSchedule />} />
       <Route path="availability" element={<PlaygroundAvailability />} />
       <Route path="requests" element={<PlaygroundRequests />} />
       <Route path="history" element={<PlaygroundHistory />} />
       <Route path="settings" element={<PlaygroundSettings />} />
     </Route>

     {/* Sponsor Routes */}
     <Route path="/sponsor" element={<SponsorLayout />}>
       <Route index element={<SponsorDashboard />} />
       <Route path="dashboard" element={<SponsorDashboard />} />
     </Route>
    </Routes>
  );
}

export default App;
