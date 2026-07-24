import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  User, 
  Users, 
  Shield, 
  Save, 
  CheckCircle, 
  Camera, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Star, 
  Lock,
  Search,
  UserPlus
} from "lucide-react";
import api from "../../services/api";

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

function TeamSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Edit mode state for Profile Details
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Account Deletion state
  const [accountStatus, setAccountStatus] = useState("ACTIVE");
  const [showDeletionConfirmModal, setShowDeletionConfirmModal] = useState(false);
  const [isSubmittingDeletion, setIsSubmittingDeletion] = useState(false);

  // UI feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(null);
  const [showError, setShowError] = useState(null);
  
  // Photo preview
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // User Profile Form
  const [profileForm, setProfileForm] = useState({
    teamName: '',
    email: '',
    district: 'Sri Lanka',
    contactNumber: '',
    address: '',
    description: ''
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Players State & CRUD
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [searchPlayer, setSearchPlayer] = useState('');
  
  // Player Modal states
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerForm, setPlayerForm] = useState({
    playerName: '',
    age: '',
    position: 'Player',
    contactNumber: ''
  });
  const [isSavingPlayer, setIsSavingPlayer] = useState(false);

  // Delete Modal
  const [deletingPlayer, setDeletingPlayer] = useState(null);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  // User Session Target ID
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === 'profile' || tab === 'players' || tab === 'security')) {
      setActiveTab(tab);
    }
    
    // Read local user & fetch from DB
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const u = JSON.parse(userString);
        const targetId = u.userId || u.user_id || u.id;
        setUserId(targetId);

        setProfileForm({
          teamName: u.teamName || u.team_name || u.organizationName || u.displayName || u.display_name || '',
          email: u.email || '',
          district: u.district || 'Sri Lanka',
          contactNumber: u.contactNumber || u.contact_number || '',
          address: u.address || '',
          description: u.description || ''
        });

        const imgUrl = u.profilePicture || u.profile_picture || u.image_url;
        if (imgUrl) setPhotoPreview(imgUrl);

        if (targetId) {
          loadUserData(targetId);
        }
      } catch (e) {
        console.error("Session parse error:", e);
      }
    }
  }, [searchParams]);

  const loadUserData = async (targetId) => {
    try {
      setLoadingPlayers(true);
      const res = await api.get(`/user/${targetId}`);
      if (res.data && res.data.success !== false) {
        const data = res.data.data || res.data;
        
        setProfileForm({
          teamName: data.teamName || data.team_name || data.display_name || '',
          email: data.email || '',
          district: data.district || 'Sri Lanka',
          contactNumber: data.contactNumber || data.contact_number || '',
          address: data.address || '',
          description: data.description || ''
        });

        if (data.status === 'DELETION_PENDING') {
          setAccountStatus('DELETION_PENDING');
        }

        const playerList = Array.isArray(data.players) ? data.players : [];
        setPlayers(playerList);

        if (data.profile_picture || data.profilePicture) {
          setPhotoPreview(data.profile_picture || data.profilePicture);
        }
      }
    } catch (err) {
      console.error("Error loading user profile & players:", err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSave = async () => {
    if (!profilePhoto) return;
    setIsSavingPhoto(true);
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      user.profilePicture = photoPreview;
      localStorage.setItem('user', JSON.stringify(user));
      
      setShowSuccess("Profile photo updated successfully!");
      setTimeout(() => setShowSuccess(null), 3000);
    } catch (error) {
      console.error("Failed to save profile photo:", error);
      setShowError("Failed to update profile photo.");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setShowSuccess(null);
    setShowError(null);

    try {
      const payload = {
        teamName: profileForm.teamName,
        district: profileForm.district,
        contactNumber: profileForm.contactNumber,
        address: profileForm.address,
        description: profileForm.description
      };

      const res = await api.put("/user/update", payload);
      if (res.data && res.data.success !== false) {
        setShowSuccess("Team profile details updated successfully!");
        setIsEditingProfile(false);
        
        // Update local session user object
        const userObj = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...userObj, ...payload, team_name: profileForm.teamName, contact_number: profileForm.contactNumber };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setTimeout(() => setShowSuccess(null), 3000);
      } else {
        throw new Error(res.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setShowError(err.response?.data?.message || err.message || "Could not save profile changes.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      setShowError("Please enter a new password.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setShowError("New password and confirm password do not match.");
      return;
    }

    setIsSavingPassword(true);
    setShowSuccess(null);
    setShowError(null);

    try {
      const res = await api.put("/user/updatePassword", { password: passwordForm.newPassword });
      if (res.data && res.data.success !== false) {
        setShowSuccess("Password updated successfully!");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setShowSuccess(null), 3000);
      } else {
        throw new Error(res.data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Update password error:", err);
      setShowError(err.response?.data?.message || err.message || "Could not update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeletionRequestSubmit = async () => {
    try {
      setIsSubmittingDeletion(true);
      setShowError(null);
      const response = await api.post('/user/request-deletion');
      if (response.data && response.data.success !== false) {
        setShowSuccess("Your account deletion request has been submitted successfully to system administrators.");
        setAccountStatus("DELETION_PENDING");
        setShowDeletionConfirmModal(false);
        setTimeout(() => setShowSuccess(null), 4000);
      } else {
        throw new Error(response.data.message || "Failed to submit deletion request.");
      }
    } catch (err) {
      console.error("Deletion request error:", err);
      setShowError(err.response?.data?.message || err.message || "Failed to submit deletion request.");
      setShowDeletionConfirmModal(false);
    } finally {
      setIsSubmittingDeletion(false);
    }
  };

  // --- PLAYER CRUD HANDLERS ---
  const getAvailableRoles = (currentEditingPlayer = editingPlayer) => {
    const hasCaptain = players.some(p => 
      (p.position || '').toLowerCase() === 'captain' && 
      (!currentEditingPlayer || String(p.player_id) !== String(currentEditingPlayer.player_id))
    );
    const hasViceCaptain = players.some(p => 
      (p.position || '').toLowerCase() === 'vice captain' && 
      (!currentEditingPlayer || String(p.player_id) !== String(currentEditingPlayer.player_id))
    );

    const roles = [];
    if (!hasCaptain) roles.push("Captain");
    if (!hasViceCaptain) roles.push("Vice Captain");
    roles.push("Player");

    return roles;
  };

  const handleOpenAddPlayer = () => {
    setEditingPlayer(null);
    const available = getAvailableRoles(null);
    setPlayerForm({
      playerName: '',
      age: '',
      position: available[0] || 'Player',
      contactNumber: ''
    });
    setShowPlayerModal(true);
  };

  const handleOpenEditPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerForm({
      playerName: player.player_name || '',
      age: player.age || '',
      position: player.position || 'Player',
      contactNumber: player.contact_number || ''
    });
    setShowPlayerModal(true);
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!playerForm.playerName.trim()) {
      setShowError("Player Name is required.");
      return;
    }

    setIsSavingPlayer(true);
    setShowSuccess(null);
    setShowError(null);

    try {
      const payload = {
        teamUserId: userId,
        playerName: playerForm.playerName.trim(),
        age: playerForm.age ? parseInt(playerForm.age, 10) : null,
        position: playerForm.position,
        contactNumber: playerForm.contactNumber.trim()
      };

      let res;
      if (editingPlayer) {
        // UPDATE existing player
        res = await api.put(`/player/${editingPlayer.player_id}`, payload);
      } else {
        // CREATE new player
        res = await api.post("/player", payload);
      }

      if (res.data && res.data.success !== false) {
        setShowSuccess(editingPlayer ? "Player record updated successfully!" : "New player added to team squad!");
        setShowPlayerModal(false);
        if (userId) loadUserData(userId);
        setTimeout(() => setShowSuccess(null), 3000);
      } else {
        throw new Error(res.data.message || "Failed to save player record.");
      }
    } catch (err) {
      console.error("Save player error:", err);
      setShowError(err.response?.data?.message || err.message || "Could not save player record.");
    } finally {
      setIsSavingPlayer(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!deletingPlayer) return;
    setIsDeletingPlayer(true);
    setShowSuccess(null);
    setShowError(null);

    try {
      const res = await api.delete(`/player/${deletingPlayer.player_id}`);
      if (res.data && res.data.success !== false) {
        setShowSuccess("Player removed from team squad!");
        setDeletingPlayer(null);
        if (userId) loadUserData(userId);
        setTimeout(() => setShowSuccess(null), 3000);
      } else {
        throw new Error(res.data.message || "Failed to delete player.");
      }
    } catch (err) {
      console.error("Delete player error:", err);
      setShowError(err.response?.data?.message || err.message || "Could not delete player record.");
    } finally {
      setIsDeletingPlayer(false);
    }
  };

  // Filter players list
  const filteredPlayers = players.filter(p => {
    if (!searchPlayer.trim()) return true;
    const query = searchPlayer.toLowerCase();
    return (
      (p.player_name || '').toLowerCase().includes(query) ||
      (p.position || '').toLowerCase().includes(query) ||
      (p.contact_number || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-5xl mx-auto font-sans">
      
      {/* Header */}
      <div className="mb-8 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Account Settings</h1>
          <p className="text-[#666666] text-sm mt-1">Manage your team profile, players roster, and security.</p>
        </div>

        {/* Global Notifications Banners */}
        {showSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-bold border border-emerald-200 shadow-xs animate-in fade-in">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{showSuccess}</span>
          </div>
        )}
        {showError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 shadow-xs animate-in fade-in">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span>{showError}</span>
            <button onClick={() => setShowError(null)} className="ml-2 text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Tabs: Profile Details | Team Players Details | Security & Password */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex overflow-x-auto hide-scrollbar">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'profile' 
              ? 'border-[#00382D] text-[#00382D] bg-[#00382D]/5 font-bold' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <User size={18} strokeWidth={activeTab === 'profile' ? 2.5 : 1.5} /> Profile Details
        </button>

        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>

        <button
          onClick={() => handleTabChange('players')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'players' 
              ? 'border-[#00382D] text-[#00382D] bg-[#00382D]/5 font-bold' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Users size={18} strokeWidth={activeTab === 'players' ? 2.5 : 1.5} /> Team Players Details
        </button>

        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>

        <button
          onClick={() => handleTabChange('security')}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'security' 
              ? 'border-[#00382D] text-[#00382D] bg-[#00382D]/5 font-bold' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Shield size={18} strokeWidth={activeTab === 'security' ? 2.5 : 1.5} /> Security & Password
        </button>
      </div>

      {/* Settings Content Container */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8">
          
          {/* --- TAB 1: PROFILE DETAILS --- */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              
              {/* Profile Details Title */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Profile Details</h2>
                <p className="text-xs text-[#666666] mt-0.5">View and manage your official team profile information.</p>
              </div>
              
              {/* Profile Photo Upload Section */}
              <div className="mb-8 flex items-center gap-6 p-4 rounded-xl bg-[#f8f7f4] border border-[#e5e5e5]">
                <div className="w-20 h-20 rounded-full bg-white border-2 border-[#e5e5e5] shadow-xs overflow-hidden shrink-0 relative group flex items-center justify-center text-gray-400">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#111111] text-[15px]">Profile Photo</h3>
                  <p className="text-[12px] text-[#666666] mb-3">PNG/JPG files, max 2MB</p>
                  <div className="flex gap-3">
                    <label className="cursor-pointer inline-block bg-white border border-[#e5e5e5] px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#333333] hover:bg-gray-50 transition-colors shadow-2xs">
                      Upload New Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                    {profilePhoto && (
                      <button 
                        onClick={handlePhotoSave}
                        disabled={isSavingPhoto}
                        className="bg-[#00382D] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#002a22] transition-colors shadow-2xs disabled:opacity-70 cursor-pointer"
                      >
                        {isSavingPhoto ? "Saving..." : "Save Photo"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Team Name</label>
                    <input 
                      type="text" 
                      value={profileForm.teamName}
                      onChange={(e) => setProfileForm({ ...profileForm, teamName: e.target.value })}
                      required
                      disabled={!isEditingProfile}
                      placeholder="e.g. Elite Strikers FC" 
                      className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:ring-1 focus:ring-[#00382D] focus:border-[#00382D] outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" 
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Email Address (Account ID)</label>
                    <input 
                      type="email" 
                      value={profileForm.email}
                      disabled
                      className="w-full h-11 px-4 bg-gray-100 border border-[#e5e5e5] rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-[#333333] mb-2 uppercase tracking-wide">District / Region</label>
                    <select 
                      value={profileForm.district}
                      onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:ring-1 focus:ring-[#00382D] focus:border-[#00382D] outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      <option value="Sri Lanka">Sri Lanka (All)</option>
                      {SRI_LANKA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Contact Phone Number</label>
                    <input 
                      type="text" 
                      value={profileForm.contactNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                      disabled={!isEditingProfile}
                      placeholder="e.g. 0771234567" 
                      className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:ring-1 focus:ring-[#00382D] focus:border-[#00382D] outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Team Location / Address</label>
                  <input 
                    type="text" 
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    disabled={!isEditingProfile}
                    placeholder="e.g. Main Street, Badulla" 
                    className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:ring-1 focus:ring-[#00382D] focus:border-[#00382D] outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" 
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Team Description & Bio</label>
                  <textarea 
                    rows="4" 
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    disabled={!isEditingProfile}
                    placeholder="Briefly describe your team history, achievements, or squad bio..." 
                    className="w-full p-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#00382D] focus:border-[#00382D] outline-none transition-all resize-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end gap-3">
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-[#f8f7f4] hover:bg-[#e5e5e5] border border-[#e5e5e5] text-[#111111] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit size={14} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSavingProfile} 
                        className="flex items-center gap-2 bg-[#00382D] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#002a22] transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
                      >
                        {isSavingProfile ? "Saving..." : <><Save size={15} /> Save Profile Changes</>}
                      </button>
                    </>
                  )}
                </div>
              </form>

              {/* Danger Zone: Account Deletion Request */}
              <div className="mt-10 pt-8 border-t border-[#e5e5e5]">
                <h3 className="text-xs font-extrabold text-red-600 uppercase tracking-wider mb-4">Danger Zone</h3>
                
                <div className="p-4 bg-red-50/50 border border-red-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                      <span>Current Account Status:</span>
                      {accountStatus === 'DELETION_PENDING' ? (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-extrabold text-[11px]">
                          Deletion Request Pending Review
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[11px]">
                          Active & Verified Team Account
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#666666]">
                      {accountStatus === 'DELETION_PENDING'
                        ? "Your request for account deletion is currently being reviewed by system administrators."
                        : "Your team account is active and eligible to participate in official Sri Lanka tournaments."}
                    </p>
                  </div>

                  {accountStatus === 'DELETION_PENDING' ? (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold shrink-0 cursor-not-allowed opacity-80"
                    >
                      Deletion Pending
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeletionConfirmModal(true)}
                      className="px-4 py-2.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Trash2 size={14} /> Request Account Deletion
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* --- TAB 2: TEAM PLAYERS DETAILS (CRUD) --- */}
          {activeTab === 'players' && (
            <div className="animate-in fade-in duration-300">
              
              {/* Top Bar Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#111111]">Team Players & Squad Details</h2>
                  <p className="text-xs text-[#666666] mt-0.5">Manage your official team players roster (Add, Edit, and Delete players).</p>
                </div>

                <button
                  onClick={handleOpenAddPlayer}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00382D] hover:bg-[#002b22] text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0 cursor-pointer"
                >
                  <UserPlus size={16} />
                  Add New Player
                </button>
              </div>

              {/* Search Roster Filter */}
              <div className="mb-6 relative max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search player by name, role, or contact..."
                  value={searchPlayer}
                  onChange={(e) => setSearchPlayer(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                />
              </div>

              {/* Players List Table */}
              {loadingPlayers ? (
                <div className="py-16 text-center text-gray-400 font-medium">
                  <div className="w-8 h-8 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Loading squad players roster...
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="bg-[#f8f7f4] rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xs text-gray-400">
                    <Users size={28} />
                  </div>
                  <h3 className="text-base font-bold text-[#111111] mb-1">No Players Found</h3>
                  <p className="text-xs text-[#666666] max-w-sm mx-auto mb-4">
                    {searchPlayer ? "No squad player matches your search query." : "You haven't added any players to your squad roster yet."}
                  </p>
                  <button
                    onClick={handleOpenAddPlayer}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00382D] text-white rounded-xl text-xs font-bold hover:bg-[#002b22] transition-colors"
                  >
                    <Plus size={14} /> Add First Player
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#e5e5e5]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8f7f4] border-b border-[#e5e5e5] text-[#333333] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">#</th>
                        <th className="py-3.5 px-4">Player Name</th>
                        <th className="py-3.5 px-4">Position / Role</th>
                        <th className="py-3.5 px-4">Age</th>
                        <th className="py-3.5 px-4">Contact Number</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5e5] text-[#111111] font-medium bg-white">
                      {filteredPlayers.map((player, idx) => (
                        <tr key={player.player_id || idx} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-400">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-bold text-[#111111]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#00382D]/10 text-[#00382D] flex items-center justify-center font-bold text-xs shrink-0">
                                {(player.player_name || 'P')[0].toUpperCase()}
                              </div>
                              <span>{player.player_name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {player.position || 'Player'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 font-semibold">{player.age ? `${player.age} yrs` : 'N/A'}</td>
                          <td className="py-3.5 px-4 text-gray-600 font-semibold">{player.contact_number || 'N/A'}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditPlayer(player)}
                                title="Edit Player"
                                className="p-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingPlayer(player)}
                                title="Delete Player"
                                className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* --- TAB 3: SECURITY & PASSWORD --- */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Security & Password</h2>
              <form onSubmit={handleSavePassword} className="space-y-6">
                
                <div>
                  <label className="block text-[12px] font-bold text-[#333333] mb-2 uppercase tracking-wide">New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    placeholder="Enter new account password" 
                    className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#00382D] focus:border-[#00382D] outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    placeholder="Re-enter new account password" 
                    className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#00382D] focus:border-[#00382D] outline-none transition-all" 
                  />
                </div>

                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSavingPassword} 
                    className="flex items-center gap-2 bg-[#00382D] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#002a22] transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
                  >
                    {isSavingPassword ? "Updating..." : <><Lock size={15} /> Update Password</>}
                  </button>
                </div>
              </form>
            </div>
          )}

      </div>

      {/* --- ADD / EDIT PLAYER MODAL --- */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e5e5e5] relative">
            <button 
              onClick={() => setShowPlayerModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-[#e5e5e5]">
              <div className="p-2 bg-[#00382D]/10 rounded-xl text-[#00382D]">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  {editingPlayer ? "Edit Player Details" : "Add New Player"}
                </h3>
                <p className="text-xs text-[#666666]">Fill player info for your team squad roster.</p>
              </div>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1 uppercase tracking-wide">Player Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={playerForm.playerName}
                  onChange={(e) => setPlayerForm({ ...playerForm, playerName: e.target.value })}
                  className="w-full h-10 px-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00382D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1 uppercase tracking-wide">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 24"
                    value={playerForm.age}
                    onChange={(e) => setPlayerForm({ ...playerForm, age: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00382D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1 uppercase tracking-wide">Position / Role</label>
                  <select
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                    className="w-full h-10 px-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00382D] cursor-pointer"
                  >
                    {getAvailableRoles().map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1 uppercase tracking-wide">Contact Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0771234567"
                  value={playerForm.contactNumber}
                  onChange={(e) => setPlayerForm({ ...playerForm, contactNumber: e.target.value })}
                  className="w-full h-10 px-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00382D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setShowPlayerModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlayer}
                  className="px-5 py-2 bg-[#00382D] hover:bg-[#002b22] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSavingPlayer ? "Saving..." : (editingPlayer ? "Save Changes" : "Add Player")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE PLAYER CONFIRMATION MODAL --- */}
      {deletingPlayer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#e5e5e5] text-center relative">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 size={24} />
            </div>

            <h3 className="text-base font-bold text-[#111111] mb-1">Remove Player?</h3>
            <p className="text-xs text-[#666666] mb-6">
              Are you sure you want to remove <span className="font-bold text-[#111111]">{deletingPlayer.player_name}</span> from your squad roster? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingPlayer(null)}
                disabled={isDeletingPlayer}
                className="w-1/2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlayer}
                disabled={isDeletingPlayer}
                className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isDeletingPlayer ? "Deleting..." : "Delete Player"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ACCOUNT DELETION REQUEST CONFIRMATION MODAL --- */}
      {showDeletionConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#111111]">Request Account Deletion</h3>
              <p className="text-xs text-[#666666]">
                Are you sure you want to request account deletion? Your request will be sent to system administrators for review.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeletionConfirmModal(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletionRequestSubmit}
                disabled={isSubmittingDeletion}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmittingDeletion ? "Submitting..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TeamSettings;