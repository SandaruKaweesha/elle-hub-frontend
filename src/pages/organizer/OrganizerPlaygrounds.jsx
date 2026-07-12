import React, { useState } from 'react';
import { Search, MapPin, ChevronRight, Map, Users, CheckCircle2, Navigation2, Check } from 'lucide-react';

export default function OrganizerPlaygrounds() {
  const [locationSearch, setLocationSearch] = useState('');
  const [requestedVenueId, setRequestedVenueId] = useState(null);

  // Dummy available playgrounds
  const playgrounds = [
    { id: 1, name: 'Sugathadasa Stadium', initials: 'SS', capacity: '25,000', location: 'Colombo', facilities: ['Floodlights', 'Parking', 'VIP'] },
    { id: 2, name: 'Vincent Dias Stadium', initials: 'VD', capacity: '10,000', location: 'Badulla', facilities: ['Parking', 'Seating'] },
    { id: 3, name: 'Mahinda Rajapaksa Stadium', initials: 'MR', capacity: '35,000', location: 'Hambantota', facilities: ['Floodlights', 'Parking', 'VIP Lounge'] },
    { id: 4, name: 'Pallekele Stadium', initials: 'PS', capacity: '35,000', location: 'Kandy', facilities: ['Floodlights', 'Seating', 'Scoreboard'] },
    { id: 5, name: 'Dambulla Stadium', initials: 'DS', capacity: '16,800', location: 'Dambulla', facilities: ['Parking', 'Seating'] },
    { id: 6, name: 'Galle Stadium', initials: 'GS', capacity: '35,000', location: 'Galle', facilities: ['Scenic View', 'Seating', 'Pavilion'] },
    { id: 7, name: 'CR & FC Grounds', initials: 'CR', capacity: '5,000', location: 'Colombo', facilities: ['Parking', 'Club House'] },
  ];

  const filteredPlaygrounds = playgrounds.filter(p => 
    p.location.toLowerCase().includes(locationSearch.toLowerCase()) ||
    p.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleRequest = (id) => {
    setRequestedVenueId(id);
  };

  return (
    <div className="max-w-6xl mx-auto font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Find a Playground</h1>
          <p className="text-[#666666] text-sm mt-1">Search by location and request a venue for your tournament. (Max 1 venue)</p>
        </div>
      </div>

      {/* Active Request Alert */}
      {requestedVenueId && (
        <div className="mb-8 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in slide-in-from-top-4 fade-in">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#166534] rounded-full flex items-center justify-center text-white shrink-0">
              <Check size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#166534]">Booking Request Sent!</h3>
              <p className="text-sm text-[#166534]/80 mt-0.5">
                You have requested <strong>{playgrounds.find(p => p.id === requestedVenueId)?.name}</strong>. Waiting for owner approval.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setRequestedVenueId(null)}
            className="text-xs font-bold uppercase tracking-wider text-[#166534] hover:bg-[#bbf7d0] px-3 py-2 rounded-lg transition-colors border border-[#166534]/20"
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white p-6 rounded-2xl border border-[#e5e5e5] shadow-sm mb-8 flex flex-col gap-4">
        <label className="text-sm font-bold text-[#111111]">Where is your tournament located?</label>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full">
            <Navigation2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input 
              type="text" 
              placeholder="e.g. Colombo, Kandy, Galle..." 
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
            />
          </div>
          <button className="bg-[#00382D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#002a22] transition-colors whitespace-nowrap shadow-sm">
            Search Venues
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaygrounds.length === 0 ? (
           <div className="col-span-full py-16 text-center text-[#888888] bg-white rounded-2xl border border-dashed border-[#d6d8d4]">
             <MapPin size={48} className="mx-auto mb-4 opacity-30 text-[#00382D]" />
             <p className="font-semibold text-lg text-[#333333]">No playgrounds found</p>
             <p className="text-sm mt-1">Try searching for a different city or region.</p>
           </div>
        ) : (
          filteredPlaygrounds.map(venue => (
            <div key={venue.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${requestedVenueId === venue.id ? 'border-[#00382D] ring-1 ring-[#00382D]' : 'border-[#e5e5e5]'}`}>
              
              {/* Card Header */}
              <div className="h-24 bg-gradient-to-r from-[#00382D] to-[#08733e] relative">
                {requestedVenueId === venue.id && (
                   <div className="absolute top-3 right-3 bg-white text-[#00382D] px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide shadow-sm flex items-center gap-1 animate-in fade-in zoom-in">
                     <CheckCircle2 size={14} /> Requested
                   </div>
                )}
              </div>
              
              <div className="p-6 relative pt-0">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-white p-1 absolute -top-8 left-6 shadow-sm">
                  <div className="w-full h-full rounded-xl bg-[#f4f4f4] flex items-center justify-center text-[#00382D] border border-[#e5e5e5]">
                    <Map size={24} />
                  </div>
                </div>

                {/* Info */}
                <div className="mt-10">
                  <h3 className="text-lg font-bold text-[#111111] leading-tight mb-1 group-hover:text-[#00382D] transition-colors">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-[#888888] text-sm font-medium">
                    <MapPin size={14} /> {venue.location}
                  </div>
                </div>

                {/* Stats & Facilities */}
                <div className="mt-6 pt-5 border-t border-[#f4f4f4]">
                  <div className="mb-4">
                    <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Capacity</p>
                    <p className="font-bold text-[#333333] flex items-center gap-1.5">
                      <Users size={16} className="text-[#00382D]" /> {venue.capacity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-2">
                      {venue.facilities.map((fac, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1 border border-gray-200">
                          <CheckCircle2 size={10} className="text-[#08733e]" /> {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-6 flex flex-col gap-2">
                  <button className="w-full py-2 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-[#e5e5e5] shadow-sm">
                    View Venue Details
                    <ChevronRight size={16} className="text-[#888888]" />
                  </button>

                  {!requestedVenueId ? (
                    <button onClick={() => handleRequest(venue.id)} className="w-full py-2 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center shadow-sm">
                      Send Booking Request
                    </button>
                  ) : requestedVenueId === venue.id ? (
                    <button disabled className="w-full py-2 bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] cursor-not-allowed rounded-xl text-sm font-bold flex items-center justify-center">
                      Request Pending...
                    </button>
                  ) : (
                    <button disabled className="w-full py-2 bg-gray-50 text-gray-300 cursor-not-allowed rounded-xl text-sm font-bold flex items-center justify-center border border-gray-100">
                      Cannot Request Multiple
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
