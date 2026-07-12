import { Trophy, Users, Shield, CheckCircle2 } from "lucide-react";

function OrganizerNotifications() {
  return (
    <div className="max-w-4xl mx-auto font-['Poppins']">
      
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Notifications</h1>
          <p className="text-[#666666] text-sm mt-1">Stay updated on your tournaments, teams, and system alerts.</p>
        </div>
        <button className="flex items-center gap-2 text-[#08733e] text-sm font-semibold hover:bg-[#08733e]/10 px-4 py-2 rounded-lg transition-colors">
          <CheckCircle2 size={16} /> Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        
        <div className="flex items-center gap-4 border-b border-[#e5e5e5] px-6 py-4">
           <button className="text-sm font-semibold text-[#111111] border-b-2 border-[#111111] pb-1">All Notifications</button>
           <button className="text-sm font-medium text-[#666666] hover:text-[#111111] pb-1 border-b-2 border-transparent transition-colors">Unread (2)</button>
        </div>

        <div className="divide-y divide-[#f0f0f0]">
          
          {/* Notification Item */}
          <div className="p-6 hover:bg-[#f8f7f4] transition-colors cursor-pointer flex gap-4 bg-blue-50/30">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Trophy size={18} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">
                <p className="text-[15px] text-[#333333] font-medium leading-relaxed">
                  Your tournament <span className="font-bold text-[#111111]">National Championship</span> was approved by the super admin.
                </p>
                <span className="text-xs font-semibold text-[#00382D] bg-[#00382D]/10 px-2 py-1 rounded-full shrink-0">New</span>
              </div>
              <p className="text-sm text-[#888888] mt-2">2 hours ago</p>
            </div>
          </div>

          {/* Notification Item */}
          <div className="p-6 hover:bg-[#f8f7f4] transition-colors cursor-pointer flex gap-4 bg-blue-50/30">
            <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">
                <p className="text-[15px] text-[#333333] font-medium leading-relaxed">
                  New team registration request from <span className="font-bold text-[#111111]">Lions Club</span> for National Championship.
                </p>
                <span className="text-xs font-semibold text-[#00382D] bg-[#00382D]/10 px-2 py-1 rounded-full shrink-0">New</span>
              </div>
              <p className="text-sm text-[#888888] mt-2">5 hours ago</p>
            </div>
          </div>

          {/* Notification Item */}
          <div className="p-6 hover:bg-[#f8f7f4] transition-colors cursor-pointer flex gap-4 opacity-70">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
              <Shield size={18} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">
                <p className="text-[15px] text-[#333333] font-medium leading-relaxed">
                  System maintenance completed successfully.
                </p>
              </div>
              <p className="text-sm text-[#888888] mt-2">1 day ago</p>
            </div>
          </div>
          
        </div>

        <div className="p-4 bg-gray-50 border-t border-[#e5e5e5] text-center">
          <p className="text-sm text-[#666666]">You have reached the end of your notifications.</p>
        </div>

      </div>

    </div>
  );
}

export default OrganizerNotifications;
