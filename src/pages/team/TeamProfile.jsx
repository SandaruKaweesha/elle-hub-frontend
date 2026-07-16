import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Users, Shield, Save, Edit2, Plus, Trash2, Key, CheckCircle, AlertCircle, X } from "lucide-react";
import api from "../../services/api";

export default function TeamProfile() {
  // Navigation tabs state
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  // Authentication & User state
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id;

  // Global status/feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Section 1: Profile Details State
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    teamName: "",
    address: "",
    district: "",
    contactNumber: "",
    description: "",
  });
  const [originalProfileData, setOriginalProfileData] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Section 2: Player Details State
  const [players, setPlayers] = useState([]);
  const [playerAlert, setPlayerAlert] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerFormData, setPlayerFormData] = useState({
    playerName: "",
    age: "",
    position: "Striker",
    contactNumber: "",
  });
  const [isSavingPlayer, setIsSavingPlayer] = useState(false);

  // Section 3: Security State
  const [securityEditMode, setSecurityEditMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Load team profile and players
  const fetchProfile = async () => {
    try {
      const response = await api.get(`/user/${userId}`);
      if (response.data.success) {
        const data = response.data.data;
        const mappedData = {
          teamName: data.teamName || data.team_name || "",
          address: data.address || "",
          district: data.district || "",
          contactNumber: data.contactNumber || data.contact_number || "",
          description: data.description || "",
        };
        setProfileData(mappedData);
        setOriginalProfileData(mappedData);
        setPlayers(data.players || []);
      } else {
        setError(response.data.message || "Failed to load team profile.");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Unable to connect to the server to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("User session not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [userId]);

  // Handle Section 1 Save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.put("/user/update", profileData);
      if (response.data.success) {
        setOriginalProfileData(profileData);
        setProfileEditMode(false);
        showFeedback("Profile details updated successfully!", "success");
        
        // Update user name in localStorage if changed
        const updatedUser = { ...currentUser, teamName: profileData.teamName };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        showFeedback(response.data.message || "Failed to update profile.", "error");
      }
    } catch (err) {
      console.error("Profile save error:", err);
      showFeedback(err.response?.data?.message || "An error occurred while saving profile changes.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Cancel Section 1 Edit
  const handleProfileCancel = () => {
    setProfileData(originalProfileData);
    setProfileEditMode(false);
  };

  // Handle Section 3 Save
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      showFeedback("Password cannot be empty.", "error");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showFeedback("Passwords do not match.", "error");
      return;
    }

    setIsSavingPassword(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.put("/user/updatePassword", {
        password: passwordData.newPassword
      });
      if (response.data.success) {
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setSecurityEditMode(false);
        showFeedback("Password updated successfully!", "success");
      } else {
        showFeedback(response.data.message || "Failed to update password.", "error");
      }
    } catch (err) {
      console.error("Password update error:", err);
      showFeedback(err.response?.data?.message || "An error occurred while updating the password.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Feedback helper
  const showFeedback = (msg, type) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }
  };

  const triggerPlayerAlert = () => {
    setPlayerAlert(true);
    setTimeout(() => setPlayerAlert(false), 4000);
  };

  const handleOpenAddModal = () => {
    setPlayerFormData({
      playerName: "",
      age: "",
      position: "Striker",
      contactNumber: "",
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (player) => {
    setSelectedPlayer(player);
    setPlayerFormData({
      playerName: player.player_name || "",
      age: player.age || "",
      position: player.position || "Striker",
      contactNumber: player.contact_number || "",
    });
    setShowEditModal(true);
  };

  const handleOpenDeleteConfirm = (player) => {
    setSelectedPlayer(player);
    setShowDeleteConfirm(true);
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setIsSavingPlayer(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.post("/player", playerFormData);
      if (response.data.success) {
        setShowAddModal(false);
        showFeedback("Player added to squad successfully!", "success");
        fetchProfile();
      } else {
        showFeedback(response.data.message || "Failed to add player.", "error");
      }
    } catch (err) {
      console.error("Add player error:", err);
      showFeedback(err.response?.data?.message || "An error occurred while adding the player.", "error");
    } finally {
      setIsSavingPlayer(false);
    }
  };

  const handleEditPlayer = async (e) => {
    e.preventDefault();
    setIsSavingPlayer(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.put(`/player/${selectedPlayer.player_id}`, playerFormData);
      if (response.data.success) {
        setShowEditModal(false);
        showFeedback("Player updated successfully!", "success");
        fetchProfile();
      } else {
        showFeedback(response.data.message || "Failed to update player.", "error");
      }
    } catch (err) {
      console.error("Update player error:", err);
      showFeedback(err.response?.data?.message || "An error occurred while updating the player.", "error");
    } finally {
      setIsSavingPlayer(false);
    }
  };

  const handleDeletePlayer = async () => {
    setIsSavingPlayer(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.delete(`/player/${selectedPlayer.player_id}`);
      if (response.data.success) {
        setShowDeleteConfirm(false);
        showFeedback("Player removed from squad successfully!", "success");
        fetchProfile();
      } else {
        showFeedback(response.data.message || "Failed to delete player.", "error");
      }
    } catch (err) {
      console.error("Delete player error:", err);
      showFeedback(err.response?.data?.message || "An error occurred while deleting the player.", "error");
    } finally {
      setIsSavingPlayer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#08733e] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm mt-4 font-medium">Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-['Poppins'] pb-12">
      {/* Toast Feedbacks */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full">
        {successMsg && (
          <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right-5">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X size={16} />
            </button>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-between bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right-5">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}
        {playerAlert && (
          <div className="flex items-center justify-between bg-amber-50 text-amber-800 border border-amber-200 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right-5">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <span className="text-sm font-semibold">Player management options will be implemented in the next phase!</span>
            </div>
            <button onClick={() => setPlayerAlert(false)} className="text-amber-500 hover:text-amber-700">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#111111] tracking-tight font-['Poppins']">Team Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your team information, players squad list, and portal password security.</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm mb-8 flex overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setSearchParams({ tab: "profile" })}
          className={`flex-1 min-w-[150px] sm:min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
            activeTab === "profile"
              ? "border-[#00382D] text-[#00382D] bg-[#00382D]/5"
              : "border-transparent text-gray-500 hover:text-[#111111] hover:bg-gray-50/50"
          }`}
        >
          <User size={16} strokeWidth={2.5} /> Profile Details
        </button>
        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>
        <button
          onClick={() => setSearchParams({ tab: "players" })}
          className={`flex-1 min-w-[150px] sm:min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
            activeTab === "players"
              ? "border-[#00382D] text-[#00382D] bg-[#00382D]/5"
              : "border-transparent text-gray-500 hover:text-[#111111] hover:bg-gray-50/50"
          }`}
        >
          <Users size={16} strokeWidth={2.5} /> Player Details
        </button>
        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>
        <button
          onClick={() => setSearchParams({ tab: "security" })}
          className={`flex-1 min-w-[150px] sm:min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
            activeTab === "security"
              ? "border-[#00382D] text-[#00382D] bg-[#00382D]/5"
              : "border-transparent text-gray-500 hover:text-[#111111] hover:bg-gray-50/50"
          }`}
        >
          <Shield size={16} strokeWidth={2.5} /> Security & Password
        </button>
      </div>

      <div className="space-y-8">
        
        {/* SECTION 1: PROFILE DETAILS */}
        {activeTab === "profile" && (
          <section className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8 transition-all hover:shadow-[0_4px_20px_rgb(0,0,0,0.02)] animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-[#eaf1ec] text-[#08733e] rounded-xl">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111111]">Profile Details</h2>
                <p className="text-xs text-gray-500">Edit your public team identifiers and general details</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Name */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wider">Team Name</label>
                  <input
                    type="text"
                    value={profileData.teamName}
                    disabled={!profileEditMode}
                    onChange={(e) => setProfileData({ ...profileData, teamName: e.target.value })}
                    placeholder="e.g. Colombo Titans"
                    className={`w-full h-11 px-4 border rounded-xl text-sm font-medium outline-none transition-all ${
                      profileEditMode
                        ? "bg-white border-[#08733e] focus:ring-1 focus:ring-[#08733e]"
                        : "bg-[#f8f7f4] border-[#e5e5e5] text-gray-500 cursor-not-allowed"
                    }`}
                    required
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wider">District</label>
                  <input
                    type="text"
                    value={profileData.district}
                    disabled={!profileEditMode}
                    onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                    placeholder="e.g. Colombo"
                    className={`w-full h-11 px-4 border rounded-xl text-sm font-medium outline-none transition-all ${
                      profileEditMode
                        ? "bg-white border-[#08733e] focus:ring-1 focus:ring-[#08733e]"
                        : "bg-[#f8f7f4] border-[#e5e5e5] text-gray-500 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wider">Contact Number</label>
                  <input
                    type="text"
                    value={profileData.contactNumber}
                    disabled={!profileEditMode}
                    onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                    placeholder="e.g. +94 77 123 4567"
                    className={`w-full h-11 px-4 border rounded-xl text-sm font-medium outline-none transition-all ${
                      profileEditMode
                        ? "bg-white border-[#08733e] focus:ring-1 focus:ring-[#08733e]"
                        : "bg-[#f8f7f4] border-[#e5e5e5] text-gray-500 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wider">Address</label>
                  <input
                    type="text"
                    value={profileData.address}
                    disabled={!profileEditMode}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="e.g. 120 Galle Road, Colombo"
                    className={`w-full h-11 px-4 border rounded-xl text-sm font-medium outline-none transition-all ${
                      profileEditMode
                        ? "bg-white border-[#08733e] focus:ring-1 focus:ring-[#08733e]"
                        : "bg-[#f8f7f4] border-[#e5e5e5] text-gray-500 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wider">Description</label>
                <textarea
                  rows="4"
                  value={profileData.description}
                  disabled={!profileEditMode}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  placeholder="Write a brief overview about your team history and milestones..."
                  className={`w-full p-4 border rounded-xl text-sm font-medium outline-none transition-all resize-none ${
                    profileEditMode
                      ? "bg-white border-[#08733e] focus:ring-1 focus:ring-[#08733e]"
                      : "bg-[#f8f7f4] border-[#e5e5e5] text-gray-500 cursor-not-allowed"
                  }`}
                />
              </div>

              {/* Profile Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                {!profileEditMode ? (
                  <button
                    type="button"
                    onClick={() => setProfileEditMode(true)}
                    className="flex items-center gap-2 bg-[#00382D] hover:bg-[#002a22] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                  >
                    <Edit2 size={15} /> Edit Details
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleProfileCancel}
                      className="px-5 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                  </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex items-center gap-2 bg-[#08733e] hover:bg-[#065b31] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-75"
                    >
                      <Save size={15} /> {isSavingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </section>
        )}

        {/* SECTION 2: PLAYER DETAILS */}
        {activeTab === "players" && (
          <section className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8 transition-all hover:shadow-[0_4px_20px_rgb(0,0,0,0.02)] animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#eaf1ec] text-[#08733e] rounded-xl">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">Player Details</h2>
                  <p className="text-xs text-gray-500">Manage registered team athletes squad list</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-[#eaf1ec] text-[#08733e] px-3 py-1.5 rounded-full border border-[#08733e]/10">
                  Total Squad: {players.length}
                </span>
              </div>
            </div>

            {/* Editable Players Table */}
            <div className="border border-[#e5e5e5] rounded-xl overflow-hidden mb-6 bg-[#f8f7f4]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-[#e5e5e5]">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Player Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {players.length > 0 ? (
                      players.map((player, idx) => (
                        <tr key={player.player_id || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4 text-sm font-bold text-[#111111]">{player.player_name}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600">
                            <span className="inline-block bg-[#f0f0f1] text-[#333] px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                              {player.position || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600">{player.age || "N/A"}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600">{player.contact_number || "N/A"}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(player)}
                              className="text-[#00382D] hover:text-[#065b31] p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer inline-flex"
                              title="Edit Player"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteConfirm(player)}
                              className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer inline-flex"
                              title="Delete Player"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                          No players currently registered. Add players to showcase your squad.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Add Action */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 bg-[#00382D] hover:bg-[#002a22] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus size={15} /> Add Player
              </button>
            </div>
          </section>
        )}

        {/* SECTION 3: SECURITY & PASSWORD */}
        {activeTab === "security" && (
          <section className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8 transition-all hover:shadow-[0_4px_20px_rgb(0,0,0,0.02)] animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-[#eaf1ec] text-[#08733e] rounded-xl">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111111]">Security & Password</h2>
                <p className="text-xs text-gray-500">Secure your access parameters with a strong password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    placeholder={securityEditMode ? "Enter new password" : "••••••••"}
                    value={passwordData.newPassword}
                    disabled={!securityEditMode}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full h-11 px-4 border rounded-xl text-sm font-medium outline-none transition-all ${
                      securityEditMode
                        ? "bg-white border-[#08733e] focus:ring-1 focus:ring-[#08733e]"
                        : "bg-[#f8f7f4] border-[#e5e5e5] text-gray-400 cursor-not-allowed tracking-widest"
                    }`}
                    required={securityEditMode}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder={securityEditMode ? "Re-enter new password" : "••••••••"}
                    value={passwordData.confirmPassword}
                    disabled={!securityEditMode}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full h-11 px-4 border rounded-xl text-sm font-medium outline-none transition-all ${
                      securityEditMode
                        ? "bg-white border-[#08733e] focus:ring-1 focus:ring-[#08733e]"
                        : "bg-[#f8f7f4] border-[#e5e5e5] text-gray-400 cursor-not-allowed tracking-widest"
                    }`}
                    required={securityEditMode}
                  />
                </div>
              </div>

              {/* Password Actions */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                {!securityEditMode ? (
                  <button
                    type="button"
                    onClick={() => setSecurityEditMode(true)}
                    className="flex items-center gap-2 bg-[#00382D] hover:bg-[#002a22] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                  >
                    <Key size={15} /> Change Password
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSecurityEditMode(false);
                        setPasswordData({ newPassword: "", confirmPassword: "" });
                      }}
                      className="px-5 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="flex items-center gap-2 bg-[#08733e] hover:bg-[#065b31] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-75"
                    >
                      <Save size={15} /> {isSavingPassword ? "Saving..." : "Save Password"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </section>
        )}

      </div>

      {/* ADD PLAYER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <Plus size={20} className="text-[#08733e]" />
              Add New Player
            </h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">Player Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sunil Perera"
                  value={playerFormData.playerName}
                  onChange={(e) => setPlayerFormData({ ...playerFormData, playerName: e.target.value })}
                  className="w-full h-11 px-4 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    placeholder="24"
                    value={playerFormData.age}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, age: e.target.value })}
                    className="w-full h-11 px-4 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">Position</label>
                  <select
                    value={playerFormData.position}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, position: e.target.value })}
                    className="w-full h-11 px-3 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all"
                  >
                    <option value="Striker">Striker</option>
                    <option value="Fielder">Fielder</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Captain">Captain</option>
                    <option value="Vice Captain">Vice Captain</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">Contact Number</label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={playerFormData.contactNumber}
                  onChange={(e) => setPlayerFormData({ ...playerFormData, contactNumber: e.target.value })}
                  className="w-full h-11 px-4 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all"
                />
              </div>
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlayer}
                  className="flex-1 bg-[#08733e] hover:bg-[#065b31] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-75 cursor-pointer"
                >
                  {isSavingPlayer ? "Saving..." : "Add Player"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAYER MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <Edit2 size={20} className="text-[#08733e]" />
              Update Player Details
            </h2>
            <form onSubmit={handleEditPlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">Player Name</label>
                <input
                  type="text"
                  required
                  value={playerFormData.playerName}
                  onChange={(e) => setPlayerFormData({ ...playerFormData, playerName: e.target.value })}
                  className="w-full h-11 px-4 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={playerFormData.age}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, age: e.target.value })}
                    className="w-full h-11 px-4 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">Position</label>
                  <select
                    value={playerFormData.position}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, position: e.target.value })}
                    className="w-full h-11 px-3 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all"
                  >
                    <option value="Striker">Striker</option>
                    <option value="Fielder">Fielder</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Captain">Captain</option>
                    <option value="Vice Captain">Vice Captain</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">Contact Number</label>
                <input
                  type="text"
                  value={playerFormData.contactNumber}
                  onChange={(e) => setPlayerFormData({ ...playerFormData, contactNumber: e.target.value })}
                  className="w-full h-11 px-4 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all"
                />
              </div>
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlayer}
                  className="flex-1 bg-[#08733e] hover:bg-[#065b31] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-75 cursor-pointer"
                >
                  {isSavingPlayer ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#111111] mb-2">Remove Player</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to remove <span className="font-bold text-[#111111]">{selectedPlayer?.player_name}</span> from the squad? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlayer}
                disabled={isSavingPlayer}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-75 cursor-pointer"
              >
                {isSavingPlayer ? "Deleting..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
