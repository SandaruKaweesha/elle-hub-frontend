import { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Bell } from "lucide-react";

function Matches() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const teams = [
    { name: "Kandy Lions", short: "KL", logo: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&h=150&fit=crop&q=80" },
    { name: "Colombo Strikers", short: "CS", logo: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=150&h=150&fit=crop&q=80" },
    { name: "Jaffna Warriors", short: "JW", logo: "https://images.unsplash.com/photo-1508344928928-7137b29de216?w=150&h=150&fit=crop&q=80" },
    { name: "Southern Sharks", short: "SS", logo: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=150&h=150&fit=crop&q=80" },
    { name: "Gampaha Eagles", short: "GE", logo: "https://images.unsplash.com/photo-1629824637777-62aeb288ecad?w=150&h=150&fit=crop&q=80" },
    { name: "Kurunegala Giants", short: "KG", logo: "https://images.unsplash.com/photo-1550064506-696eb80a459b?w=150&h=150&fit=crop&q=80" },
  ];

  const fixtures = [
    {
      team1: teams[0],
      team2: teams[1],
      stage: "SUMMER CUP - QUARTER FINALS",
      date: "Dec 15, 2026",
      time: "10:30 AM",
      status: "upcoming"
    },
    {
      team1: teams[2],
      team2: teams[3],
      stage: "SUMMER CUP - QUARTER FINALS",
      date: "Dec 15, 2026",
      time: "02:00 PM",
      status: "upcoming"
    },
    {
      team1: teams[4],
      team2: teams[5],
      stage: "WINTER LEAGUE - FINALS",
      date: "Nov 30, 2025",
      time: "09:00 AM",
      status: "past",
      score: "42 - 38"
    }
  ];

  const filteredFixtures = fixtures.filter(f => f.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-['Poppins']">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-[#002c21] py-16 md:py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Matches & Results</h1>
        <p className="text-[#8eb7a7] max-w-2xl mx-auto text-lg">
          Stay up-to-date with all the latest Elle fixtures across the island. Never miss an upcoming match!
        </p>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-4 md:px-[60px] py-12 md:py-16 max-w-[1000px] mx-auto w-full space-y-10">
        
        <div className="flex flex-col md:flex-row justify-center md:items-center gap-4 mb-6">
          <div className="flex bg-[#e8e9e6] rounded-lg p-1 relative overflow-hidden shadow-sm">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 md:flex-none px-10 py-3 text-[14px] font-bold rounded-md transition-all duration-300 relative z-10 ${activeTab === 'upcoming' ? 'bg-[#002c21] text-white shadow-md' : 'text-[#69706c] hover:text-[#111513]'}`}
            >
              Upcoming Matches
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`flex-1 md:flex-none px-10 py-3 text-[14px] font-bold rounded-md transition-all duration-300 relative z-10 ${activeTab === 'past' ? 'bg-[#002c21] text-white shadow-md' : 'text-[#69706c] hover:text-[#111513]'}`}
            >
              Past Results
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {filteredFixtures.length === 0 ? (
             <div className="bg-white border border-[#d8ddd9] border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center gap-3">
               <span className="text-xl font-bold text-[#111513]">
                 {activeTab === 'upcoming' ? "No Upcoming Matches" : "No Past Results"}
               </span>
               <span className="text-[14px] text-[#69706c] max-w-sm">
                 Check back later for more updates.
               </span>
             </div>
          ) : (
            filteredFixtures.map((fixture, index) => (
              <div 
                key={index} 
                className={`group bg-white border ${activeTab === 'past' ? 'border-[#e8e9e6] bg-gray-50/50' : 'border-[#d8ddd9]'} rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg hover:border-[#08733e]/40 transition-all duration-300`}
              >
                
                {/* Team 1 */}
                <div className={`flex items-center gap-4 w-full md:w-[30%] justify-end md:justify-end ${activeTab === 'past' ? 'opacity-90 hover:opacity-100' : ''}`}>
                  <span className={`text-lg md:text-xl font-bold transition-colors ${activeTab === 'past' && fixture.score && parseInt(fixture.score.split('-')[0]) > parseInt(fixture.score.split('-')[1]) ? 'text-[#08733e]' : 'text-[#111513] group-hover:text-[#08733e]'}`}>
                    {fixture.team1.name}
                  </span>
                  <img src={fixture.team1.logo} alt={fixture.team1.name} className={`w-14 h-14 rounded-xl object-cover border-2 shadow-sm ${activeTab === 'past' && fixture.score && parseInt(fixture.score.split('-')[0]) > parseInt(fixture.score.split('-')[1]) ? 'border-[#08733e]' : 'border-[#e8e9e6]'}`} />
                </div>

                {/* Match Details */}
                <div className="flex flex-col items-center justify-center md:border-x border-[#d8ddd9] px-4 md:px-8 w-full md:w-[40%] text-center relative">
                  {activeTab === 'past' && (
                    <span className="absolute -top-3 bg-[#111513] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Full Time
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-[#08733e] tracking-widest uppercase mb-2 bg-[#08733e]/10 px-3 py-1 rounded-full">{fixture.stage}</span>
                  
                  {activeTab === 'upcoming' ? (
                    <span className="text-2xl font-black text-[#111513] mb-2 opacity-60 group-hover:opacity-100 transition-opacity">VS</span>
                  ) : (
                    <div className="flex items-center gap-3 my-2">
                      <span className={`text-3xl font-black ${parseInt(fixture.score.split('-')[0]) > parseInt(fixture.score.split('-')[1]) ? 'text-[#08733e]' : 'text-[#111513]'}`}>{fixture.score.split('-')[0].trim()}</span>
                      <span className="text-xl font-bold text-[#69706c]">-</span>
                      <span className={`text-3xl font-black ${parseInt(fixture.score.split('-')[1]) > parseInt(fixture.score.split('-')[0]) ? 'text-[#08733e]' : 'text-[#111513]'}`}>{fixture.score.split('-')[1].trim()}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-[12px] text-[#69706c] font-medium mt-1">
                    <span>{fixture.date}</span>
                    {activeTab === 'upcoming' && <span className="font-semibold text-[#111513]">{fixture.time}</span>}
                  </div>
                </div>

                {/* Team 2 & Action */}
                <div className="flex items-center gap-4 w-full md:w-[30%] justify-between md:justify-start flex-row-reverse md:flex-row">
                  <div className={`flex items-center gap-4 ${activeTab === 'past' ? 'opacity-90 hover:opacity-100' : ''}`}>
                    <img src={fixture.team2.logo} alt={fixture.team2.name} className={`w-14 h-14 rounded-xl object-cover border-2 shadow-sm ${activeTab === 'past' && fixture.score && parseInt(fixture.score.split('-')[1]) > parseInt(fixture.score.split('-')[0]) ? 'border-[#08733e]' : 'border-[#e8e9e6]'}`} />
                    <span className={`text-lg md:text-xl font-bold transition-colors ${activeTab === 'past' && fixture.score && parseInt(fixture.score.split('-')[1]) > parseInt(fixture.score.split('-')[0]) ? 'text-[#08733e]' : 'text-[#111513] group-hover:text-[#08733e]'}`}>
                      {fixture.team2.name}
                    </span>
                  </div>
                  
                  {activeTab === 'upcoming' ? (
                    <button className="hidden lg:flex items-center justify-center bg-[#f0f2ef] hover:bg-[#002c21] hover:text-white text-[#111513] text-[12px] font-bold px-4 py-2 rounded-md transition-all duration-300 ml-auto whitespace-nowrap shadow-sm">
                      Set Reminder
                    </button>
                  ) : (
                    <button className="hidden lg:flex items-center justify-center bg-[#08733e]/10 hover:bg-[#08733e] text-[#08733e] hover:text-white text-[12px] font-bold px-4 py-2 rounded-md transition-all duration-300 ml-auto whitespace-nowrap">
                      Match Details
                    </button>
                  )}
                </div>
                
                {/* Mobile action button */}
                {activeTab === 'upcoming' ? (
                  <button className="w-full lg:hidden flex items-center justify-center bg-[#f0f2ef] hover:bg-[#002c21] hover:text-white text-[#111513] text-[13px] font-bold px-4 py-3 rounded-md transition-colors mt-2">
                    <Bell size={16} className="mr-2" /> Set Reminder
                  </button>
                ) : (
                  <button className="w-full lg:hidden flex items-center justify-center bg-[#08733e]/10 text-[#08733e] text-[13px] font-bold px-4 py-3 rounded-md mt-2">
                    View Match Details
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Matches;
