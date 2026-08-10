import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import TournamentCard from "../components/home/TournamentCard";

function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("DATE");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tournaments');
        if (response.data.success) {
          const raw = response.data.data || [];
          const activeOnly = raw.filter(t => {
            const s = (t.status || '').toUpperCase();
            const appS = (t.approval_status || '').toUpperCase();
            return appS !== 'REJECTED' && s !== 'COMPLETED' && s !== 'FINISHED';
          });
          setTournaments(activeOnly);
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

  const regionOptions = useMemo(() => {
    const regions = new Set();
    tournaments.forEach((t) => {
      const region = (t.location || t.district || t.region || 'Unknown').trim();
      if (region) regions.add(region);
    });
    return ["ALL", ...Array.from(regions).sort()];
  }, [tournaments]);

  const statusOptions = useMemo(() => {
    const statuses = new Set();
    tournaments.forEach((t) => {
      const status = (t.status || t.approval_status || 'Active').trim();
      if (status) statuses.add(status);
    });
    return ["ALL", ...Array.from(statuses).sort()];
  }, [tournaments]);

  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter((t) => {
        const regionValue = (t.location || t.district || t.region || '').toUpperCase();
        const statusValue = (t.status || t.approval_status || '').toUpperCase();

        const matchesRegion = regionFilter === "ALL" || regionValue === regionFilter.toUpperCase();
        const matchesStatus = statusFilter === "ALL" || statusValue === statusFilter.toUpperCase();
        return matchesRegion && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOption === "PRIZE") {
          const prizeA = parseFloat((a.prize_details || '').replace(/[^0-9.]/g, '')) || 0;
          const prizeB = parseFloat((b.prize_details || '').replace(/[^0-9.]/g, '')) || 0;
          return prizeB - prizeA;
        }

        const dateA = a.tournament_held_date ? new Date(a.tournament_held_date).getTime() : 0;
        const dateB = b.tournament_held_date ? new Date(b.tournament_held_date).getTime() : 0;
        return dateA - dateB;
      });
  }, [tournaments, regionFilter, statusFilter, sortOption]);

  const mockImages = ["/images/elle1.jpeg", "/images/elle2.jpeg", "/images/elle3.jpeg", "/images/elle4.jpeg", "/images/elle5.jpeg"];
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
          <div>
            <h2 className="text-[28px] font-bold text-[#111513]">All Upcoming Events</h2>
            <p className="text-sm text-[#666666] mt-2 max-w-2xl">
              Filter tournaments by region and status, then sort results by date or prize.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="border border-[#d8ddd9] bg-white rounded-md px-4 py-2 text-[#111513] outline-none focus:border-[#C9A227] min-w-[170px]"
            >
              <option value="ALL">All Regions</option>
              {regionOptions.map((region) => (
                region === 'ALL' ? null : <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#d8ddd9] bg-white rounded-md px-4 py-2 text-[#111513] outline-none focus:border-[#C9A227] min-w-[170px]"
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((status) => (
                status === 'ALL' ? null : <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-[#d8ddd9] bg-white rounded-md px-4 py-2 text-[#111513] outline-none focus:border-[#C9A227] min-w-[170px]"
            >
              <option value="DATE">Sort by Date</option>
              <option value="PRIZE">Sort by Prize</option>
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
            {filteredTournaments.map((tournament, index) => (
              <TournamentCard
                key={tournament.tournament_id || index}
                id={tournament.tournament_id}
                image={mockImages[index % 3]}
                imagePosition={mockPositions[index % 3]}
                title={tournament.title}
                date={formatDate(tournament.tournament_held_date)}
                prize={tournament.prize_details || "TBD"}
                status={tournament.status || tournament.approval_status || "Active"}
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
