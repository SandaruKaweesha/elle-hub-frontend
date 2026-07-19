import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, MapPin, Calendar, Users, Star, Shield, 
  BadgeDollarSign, Map, Save, CheckSquare, AlertCircle, 
  CheckCircle2, ArrowLeft, Lock, Info 
} from 'lucide-react';
import api from '../../services/api';

export default function ManageTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Selection options from directory
  const [sponsors, setSponsors] = useState([]);
  const [referees, setReferees] = useState([]);
  const [playgrounds, setPlaygrounds] = useState([]);
  const [teams, setTeams] = useState([]);

  // Selected values
  const [selectedSponsor, setSelectedSponsor] = useState('');
  const [selectedReferees, setSelectedReferees] = useState([]);
  const [selectedPlayground, setSelectedPlayground] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);

  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    if (id) {
      loadTournamentData();
    }
  }, [id]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch tournament details and existing assignments
      const [detailsRes, assignmentsRes, directoryRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournament/${id}/assignments`),
        api.get('/user/getAllUsers')
      ]);

      if (detailsRes.data && detailsRes.data.success) {
        setTournament(detailsRes.data.data);
      } else {
        throw new Error(detailsRes.data.message || "Failed to load tournament details.");
      }

      // Parse current assignments
      if (assignmentsRes.data && assignmentsRes.data.success) {
        const assigns = assignmentsRes.data.data;
        setSelectedSponsor(assigns.sponsorUserId || '');
        setSelectedReferees(assigns.refereeUserIds || []);
        setSelectedPlayground(assigns.playgroundUserId || '');
        setSelectedTeams(assigns.teamUserIds || []);
      }

      // Parse system directory resources
      if (directoryRes.data && directoryRes.data.success) {
        const users = directoryRes.data.data || [];
        setSponsors(users.filter(u => u.role.toUpperCase() === 'SPONSOR' && u.status.toUpperCase() === 'APPROVED'));
        setReferees(users.filter(u => u.role.toUpperCase() === 'REFEREE' && u.status.toUpperCase() === 'APPROVED'));
        setPlaygrounds(users.filter(u => u.role.toUpperCase() === 'PLAYGROUND' && u.status.toUpperCase() === 'APPROVED'));
        setTeams(users.filter(u => u.role.toUpperCase() === 'TEAM' && u.status.toUpperCase() === 'APPROVED'));
      }

    } catch (err) {
      console.error("Error loading tournament details:", err);
      setError(err.message || "Failed to query tournament management details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefereeToggle = (refereeId) => {
    if (tournament?.status === 'ONGOING') return; // Read-only if finalized
    setSelectedReferees(prev => 
      prev.includes(refereeId) 
        ? prev.filter(uid => uid !== refereeId) 
        : [...prev, refereeId]
    );
  };

  const handleTeamToggle = (teamId) => {
    if (tournament?.status === 'ONGOING') return; // Read-only if finalized
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(uid => uid !== teamId) 
        : [...prev, teamId]
    );
  };

  const handleSaveAssignments = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        sponsorUserId: selectedSponsor === '' ? null : parseInt(selectedSponsor, 10),
        refereeUserIds: selectedReferees.map(uid => parseInt(uid, 10)),
        playgroundUserId: selectedPlayground === '' ? null : parseInt(selectedPlayground, 10),
        teamUserIds: selectedTeams.map(uid => parseInt(uid, 10))
      };

      const response = await api.post(`/tournament/${id}/assignments`, payload);
      if (response.data && response.data.success) {
        setSuccessMsg(response.data.message || "Assignments updated successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error(response.data.message || "Failed to save assignments.");
      }
    } catch (err) {
      console.error("Error saving assignments:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizeTournament = async () => {
    if (!window.confirm("Are you sure you want to finalize this tournament? Once finalized, teams can no longer opt out or leave the tournament.")) {
      return;
    }

    try {
      setFinalizing(true);
      setError(null);
      setSuccessMsg(null);

      // First save current assignments
      const payload = {
        sponsorUserId: selectedSponsor === '' ? null : parseInt(selectedSponsor, 10),
        refereeUserIds: selectedReferees.map(uid => parseInt(uid, 10)),
        playgroundUserId: selectedPlayground === '' ? null : parseInt(selectedPlayground, 10),
        teamUserIds: selectedTeams.map(uid => parseInt(uid, 10))
      };
      await api.post(`/tournament/${id}/assignments`, payload);

      // Then finalize
      const response = await api.post(`/tournament/${id}/finalize`);
      if (response.data && response.data.success) {
        setSuccessMsg("Tournament setup finalized successfully! Tournament status is now ONGOING.");
        // Reload details
        const detailsRes = await api.get(`/tournaments/${id}`);
        if (detailsRes.data && detailsRes.data.success) {
          setTournament(detailsRes.data.data);
        }
      } else {
        throw new Error(response.data.message || "Failed to finalize tournament.");
      }
    } catch (err) {
      console.error("Error finalising tournament:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
        Loading tournament console details...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Tournament Not Found</h3>
        <p className="text-gray-500 mt-2">The requested tournament was not found or is inaccessible.</p>
        <Link to="/organizer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#08733e] hover:underline uppercase tracking-wider">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
      </div>
    );
  }

  const isFinalized = tournament.status.toUpperCase() === 'ONGOING';

  return (
    <div className="max-w-5xl mx-auto pb-16 font-['Poppins'] animate-in fade-in duration-300 font-medium">
      
      {/* Back button */}
      <Link 
        to="/organizer" 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to console
      </Link>

      {/* Header Info */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] text-emerald-200/90 font-black uppercase tracking-wider bg-[#00382D] px-2.5 py-1 rounded-md flex items-center gap-1 border border-emerald-500/20 shadow-sm shrink-0">
              <Trophy size={11} />
              Tournament Manage Console
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${
              isFinalized 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isFinalized ? 'ONGOING / FINALIZED' : 'ACTIVE / SETUP'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111111] leading-tight">{tournament.title}</h2>
          <p className="text-gray-500 text-sm max-w-2xl">{tournament.description || 'No description provided.'}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 pt-2">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-gray-400" />
              {tournament.location}
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-gray-400" />
              Event Date: {new Date(tournament.tournament_held_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {isFinalized && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm mb-6 flex items-start gap-2.5 font-semibold">
          <Lock size={16} className="mt-0.5 text-blue-600 shrink-0" />
          <div>
            <p className="font-bold">Setup Finalized</p>
            <p className="text-xs text-blue-700/90 font-medium mt-0.5">This tournament is currently ONGOING. Dropdowns, selections, and invitations are locked in read-only mode. Participating teams can no longer drop out of the roster.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2 font-semibold">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-200 flex items-center gap-2 font-semibold animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Main Assignment Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Left Side: Playground & Sponsors */}
        <div className="space-y-8">
          
          {/* Playground selection */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Map size={18} className="text-[#00382D]" />
              <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">Playground Assignment</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">Select the playground venue where matches for this tournament will be held.</p>
              
              <select
                disabled={isFinalized}
                value={selectedPlayground}
                onChange={(e) => setSelectedPlayground(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#e5e5e5] rounded-xl text-sm font-semibold outline-none focus:border-[#00382D] transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">-- No Playground Selected --</option>
                {playgrounds.map(p => (
                  <option key={p.user_id} value={p.user_id}>{p.display_name} ({p.location})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sponsor selection */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <BadgeDollarSign size={18} className="text-[#00382D]" />
              <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">Tournament Sponsor</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">Assign the official sponsor providing corporate endorsement for the tournament event.</p>
              
              <select
                disabled={isFinalized}
                value={selectedSponsor}
                onChange={(e) => setSelectedSponsor(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#e5e5e5] rounded-xl text-sm font-semibold outline-none focus:border-[#00382D] transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">-- No Sponsor Selected --</option>
                {sponsors.map(s => (
                  <option key={s.user_id} value={s.user_id}>{s.display_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Referees Selection */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Shield size={18} className="text-[#00382D]" />
              <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">Referees Assignments</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">Assign one or more certified referees to govern matches throughout the tournament lifecycle.</p>
              
              {referees.length === 0 ? (
                <div className="text-xs font-semibold text-gray-400 p-4 bg-gray-50 rounded-xl border border-[#e5e5e5] text-center">
                  No approved referees registered in system.
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {referees.map(ref => {
                    const isChecked = selectedReferees.includes(ref.user_id);
                    return (
                      <label 
                        key={ref.user_id} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-[#f0fdf4] border-emerald-200 text-[#00382D]' 
                            : 'bg-white border-[#e5e5e5] text-gray-700 hover:bg-gray-50'
                        } ${isFinalized ? 'cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            disabled={isFinalized}
                            checked={isChecked}
                            onChange={() => handleRefereeToggle(ref.user_id)}
                            className="w-4 h-4 accent-[#00382D] cursor-pointer disabled:cursor-not-allowed"
                          />
                          <span className="text-xs font-bold">{ref.display_name}</span>
                        </div>
                        {ref.rating && (
                          <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold shrink-0">
                            <Star size={10} className="fill-amber-600 text-amber-600" />
                            {parseFloat(ref.rating).toFixed(1)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Participating Teams Selection */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <Users size={18} className="text-[#00382D]" />
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">Participating Teams</h3>
          </div>
          
          <div className="space-y-4 flex-grow">
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">Select which teams are registered to participate in the matches. Make sure squad limits are respected.</p>
            
            {teams.length === 0 ? (
              <div className="text-xs font-semibold text-gray-400 p-8 bg-gray-50 rounded-xl border border-[#e5e5e5] text-center">
                No active teams registered in system.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {teams.map(team => {
                  const isChecked = selectedTeams.includes(team.user_id);
                  return (
                    <label 
                      key={team.user_id} 
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-[#f0fdf4] border-emerald-200 text-[#00382D]' 
                          : 'bg-white border-[#e5e5e5] text-gray-700 hover:bg-gray-50'
                      } ${isFinalized ? 'cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={isFinalized}
                          checked={isChecked}
                          onChange={() => handleTeamToggle(team.user_id)}
                          className="w-4 h-4 accent-[#00382D] cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{team.display_name}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{team.district || 'Location N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {team.rating && (
                          <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold shrink-0">
                            <Star size={9} className="fill-amber-600 text-amber-600" />
                            {parseFloat(team.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Action Footers */}
      <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
          <Info size={14} className="text-gray-400 shrink-0" />
          <span>Save updates progressively. Click Finalize only when all details are correct.</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isFinalized && (
            <>
              <button
                type="button"
                disabled={saving || finalizing}
                onClick={handleSaveAssignments}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 border border-[#e5e5e5] hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Selection'}
              </button>
              <button
                type="button"
                disabled={saving || finalizing}
                onClick={handleFinalizeTournament}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <CheckSquare size={14} />
                {finalizing ? 'Finalising...' : 'Finalise'}
              </button>
            </>
          )}
          {isFinalized && (
            <button
              disabled
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider cursor-not-allowed"
            >
              <Lock size={14} />
              Setup Finalized
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
