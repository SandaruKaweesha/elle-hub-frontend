import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Shield, Bell, Save, Edit2, Key, CheckCircle, AlertCircle, X, Trash2, Building, MapPin, Phone, Mail } from "lucide-react";
import api from "../../services/api";

export default function OrganizerSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  // Current User Session
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  // Global Status & Feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Profile Details State
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    organizationName: "",
    address: "",
    contactNumber: "",
    email: "",
  });
  const [originalProfileData, setOriginalProfileData] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [accountStatus, setAccountStatus] = useState("");
  const [showDeletionConfirmModal, setShowDeletionConfirmModal] = useState(false);

  // Security & Password State
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Notifications State
  const [notificationsData, setNotificationsData] = useState({
    emailAlerts: true,
    smsAlerts: false,
    tournamentUpdates: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Fetch real organizer profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/user/${userId}`);
      if (response.data && response.data.success !== false) {
        const data = response.data.data;
        const mappedData = {
          organizationName: data.organizationName || data.organization_name || data.display_name || "",
          address: data.address || "",
          contactNumber: data.contactNumber || data.contact_number || "",
          email: data.email || "",
        };
        setProfileData(mappedData);
        setOriginalProfileData(mappedData);
        setAccountStatus(data.status || "APPROVED");
      } else {
        setError(response.data.message || "Failed to load organizer profile.");
      }
    } catch (err) {
      console.error("Fetch organizer profile error:", err);
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

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const showFeedback = (msg, type = "success") => {
    if (type === "success") {
      setSuccessMsg(msg);
      setError(null);
    } else {
      setError(msg);
      setSuccessMsg(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        organizationName: profileData.organizationName,
        address: profileData.address,
        contactNumber: profileData.contactNumber,
      };

      const response = await api.put("/user/update", payload);
      if (response.data && response.data.success !== false) {
        setOriginalProfileData(profileData);
        setProfileEditMode(false);
        showFeedback("Organizer profile details updated successfully!", "success");

        // Update localStorage user object
        const updatedUser = {
          ...currentUser,
          organizationName: profileData.organizationName,
          organization_name: profileData.organizationName,
          displayName: profileData.organizationName,
          display_name: profileData.organizationName,
        };
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

  const handleCancelProfileEdit = () => {
    setProfileData(originalProfileData);
    setProfileEditMode(false);
  };

  // Handle Password Update
  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (!passwordData.newPassword) {
      showFeedback("Please enter a new password.", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showFeedback("Password must be at least 6 characters long.", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showFeedback("New passwords do not match. Please re-enter.", "error");
      return;
    }

    setIsSavingPassword(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.post("/user/update-password", {
        newPassword: passwordData.newPassword,
      });

      if (response.data && response.data.success !== false) {
        setPasswordData({ newPassword: "", confirmPassword: "" });
        showFeedback("Password changed successfully!", "success");
      } else {
        showFeedback(response.data.message || "Failed to update password.", "error");
      }
    } catch (err) {
      console.error("Password update error:", err);
      showFeedback(err.response?.data?.message || "Failed to update password.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle Account Deletion Request
  const handleDeletionRequestSubmit = async () => {
    try {
      setIsSavingProfile(true);
      setError(null);
      setSuccessMsg(null);
      const response = await api.post("/user/request-deletion");
      if (response.data && response.data.success !== false) {
        setSuccessMsg("Your account deletion request has been submitted successfully to the administrator.");
        setAccountStatus("DELETION_PENDING");
        setShowDeletionConfirmModal(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(response.data.message || "Failed to submit deletion request.");
      }
    } catch (err) {
      console.error("Deletion request error:", err);
      setError(err.response?.data?.message || err.message || "Failed to submit deletion request.");
      setShowDeletionConfirmModal(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Notification Preferences Save
  const handleNotificationsSave = (e) => {
    e.preventDefault();
    setIsSavingNotifications(true);
    setTimeout(() => {
      setIsSavingNotifications(false);
      showFeedback("Notification preferences saved successfully!", "success");
    }, 600);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center font-['Poppins']">
        <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#666666] font-medium text-sm">Loading organizer account settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Account Settings</h1>
          <p className="text-[#666666] text-sm mt-1">Manage your organizer profile, security, and account preferences.</p>
        </div>
      </div>

      {/* Notifications Banners */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleTabChange("profile")}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "profile" 
              ? "border-[#00382D] text-[#00382D] bg-[#00382D]/5" 
              : "border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50"
          }`}
        >
          <User size={18} strokeWidth={activeTab === "profile" ? 2 : 1.5} /> Profile Details
        </button>
        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>
        <button
          onClick={() => handleTabChange("security")}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "security" 
              ? "border-[#00382D] text-[#00382D] bg-[#00382D]/5" 
              : "border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50"
          }`}
        >
          <Shield size={18} strokeWidth={activeTab === "security" ? 2 : 1.5} /> Security & Password
        </button>
      </div>

      {/* Main Settings Body */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8">
        
        {/* --- TAB 1: PROFILE DETAILS --- */}
        {activeTab === "profile" && (
          <div className="animate-in fade-in duration-300">
            
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#e5e5e5]">
              <div>
                <h2 className="text-xl font-bold text-[#111111]">Organizer Profile Details</h2>
                <p className="text-xs text-[#666666] mt-0.5">Manage organization details and official contact numbers.</p>
              </div>

              {!profileEditMode ? (
                <button
                  type="button"
                  onClick={() => setProfileEditMode(true)}
                  className="px-4 py-2 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelProfileEdit}
                  className="px-4 py-2 bg-gray-100 text-[#555555] text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Organization Name */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Organization Name</label>
                  <div className="relative">
                    <Building size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="text"
                      disabled={!profileEditMode}
                      value={profileData.organizationName}
                      onChange={(e) => setProfileData({ ...profileData, organizationName: e.target.value })}
                      placeholder="e.g. National Elle Sports Association"
                      className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] disabled:text-[#666666] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Account Email (Read-only) */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full pl-11 pr-4 py-3 bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#666666] cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-[#888888] mt-1">Email address is read-only for system security.</p>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="text"
                      disabled={!profileEditMode}
                      value={profileData.contactNumber}
                      onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                      placeholder="e.g. 0771234567"
                      className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] disabled:text-[#666666] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Headquarters Address / Location */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Headquarters / Location Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="text"
                      disabled={!profileEditMode}
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      placeholder="e.g. Colombo 03, Sri Lanka"
                      className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] disabled:text-[#666666] transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Edit Mode Actions */}
              {profileEditMode && (
                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelProfileEdit}
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 bg-gray-100 text-[#555555] text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Account Status & Danger Zone */}
            <div className="mt-12 pt-8 border-t border-[#e5e5e5]">
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-4">Account Status & Actions</h3>
              <div className="bg-[#f8f7f4] p-5 rounded-2xl border border-[#e5e5e5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#333333]">Current Status:</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      accountStatus === "DELETION_PENDING" 
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}>
                      {accountStatus === "DELETION_PENDING" ? "Deletion Pending Approval" : "Active & Verified Organizer"}
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] mt-1">
                    {accountStatus === "DELETION_PENDING" 
                      ? "Your request to delete this organizer account is under review by system administrators." 
                      : "Your organizer account is active and verified for creating official tournaments."}
                  </p>
                </div>

                {accountStatus !== "DELETION_PENDING" && (
                  <button
                    type="button"
                    onClick={() => setShowDeletionConfirmModal(true)}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 size={14} /> Request Account Deletion
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: SECURITY & PASSWORD --- */}
        {activeTab === "security" && (
          <div className="animate-in fade-in duration-300">
            <div className="pb-6 mb-6 border-b border-[#e5e5e5]">
              <h2 className="text-xl font-bold text-[#111111]">Security & Password</h2>
              <p className="text-xs text-[#666666] mt-0.5">Update your password regularly to secure your organizer account.</p>
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-6 max-w-md">
              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter minimum 6 characters"
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5e5e5]">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="w-full py-3 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSavingPassword ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* --- ACCOUNT DELETION CONFIRMATION MODAL --- */}
      {showDeletionConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e5e5e5]">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold text-[#111111] mb-2">Request Account Deletion?</h3>
            <p className="text-xs text-[#666666] mb-6 leading-relaxed">
              Are you sure you want to request deletion for your organizer account? This action will submit an official request to the system administrators.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeletionConfirmModal(false)}
                disabled={isSavingProfile}
                className="px-4 py-2.5 bg-gray-100 text-[#555555] text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletionRequestSubmit}
                disabled={isSavingProfile}
                className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSavingProfile ? "Submitting..." : "Confirm Deletion Request"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
