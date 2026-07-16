import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import TournamentCard from "../components/home/TournamentCard";

function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tournaments');
        if (response.data.success) {
          setTournaments(response.data.data);
        } else {
          setError(response.data.message || "Failed to load tournaments");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching tournaments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournaments();
  }, []);

  const mockImages = ["/images/tournament-1.png", "/images/tournament-2.png", "/images/tournament-3.png"];
  const mockPositions = ["center 42%", "center 38%", "center 45%"];

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-['Poppins']">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-[#002c21] py-16 md:py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Upcoming Tournaments</h1>
        <p className="text-[#8eb7a7] max-w-2xl mx-auto text-lg">
          Discover and register for the latest upcoming Elle tournaments. Compete with the best and rise through the rankings!
        </p>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-4 md:px-[60px] py-12 md:py-16 max-w-[1450px] mx-auto w-full">
        
        {/* Filters/Search placeholder */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-[28px] font-bold text-[#111513]">All Upcoming Events</h2>
          <div className="flex flex-wrap gap-4">
            <select className="border border-[#d8ddd9] bg-white rounded-md px-4 py-2 text-[#111513] outline-none focus:border-[#C9A227] min-w-[140px]">
              <option>All Regions</option>
              <option>North</option>
              <option>South</option>
              <option>Central</option>
            </select>
            <select className="border border-[#d8ddd9] bg-white rounded-md px-4 py-2 text-[#111513] outline-none focus:border-[#C9A227] min-w-[140px]">
              <option>Sort by Date</option>
              <option>Sort by Prize</option>
            </select>
          </div>
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002c21]"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20 text-red-600">
            {error}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-[#69706c]">
            No upcoming tournaments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments.map((tournament, index) => (
              <TournamentCard
                key={tournament.tournament_id || index}
                id={tournament.tournament_id}
                image={mockImages[index % 3]}
                imagePosition={mockPositions[index % 3]}
                title={tournament.title}
                date={formatDate(tournament.tournament_held_date)}
                prize={tournament.prize_details || "TBD"}
                status={tournament.status || tournament.approval_status || "Upcoming"}
                buttonText="View Details"
              />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default Tournaments;
