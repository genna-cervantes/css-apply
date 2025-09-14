"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MobileSidebar from '@/components/AdminMobileSB';
import SidebarContent from '@/components/AdminSidebar';
import { committeeRoles } from '@/data/committeeRoles';
import { roles } from '@/data/ebRoles';
import { unavailableSlots, addUnavailableSlot, removeUnavailableSlot, isSlotUnavailable } from '@/data/unavailableSlots';

interface InterviewSlot {
  id: string;
  eb: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  maxSlots: number;
  currentSlots: number;
  createdAt: string;
}

const Schedule = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEB, setSelectedEB] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: '',
    timeStart: '',
    timeEnd: '',
    maxSlots: 1
  });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [groupedSlots, setGroupedSlots] = useState<Record<string, InterviewSlot[]>>({});
  const [localUnavailableSlots, setLocalUnavailableSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'admin' && session?.user?.role !== 'super_admin') {
      router.push('/user');
      return;
    }

    fetchSlots();
  }, [status, session, router, selectedEB]);

  const generateHardcodedSlots = (currentUnavailableSlots?: Set<string>) => {
    const unavailable = currentUnavailableSlots || localUnavailableSlots;
    
    // Hardcoded dates: September 16-26, 2025
    const hardcodedDates = [
      new Date(2025, 8, 16), // September 16
      new Date(2025, 8, 17), // September 17
      new Date(2025, 8, 18), // September 18
      new Date(2025, 8, 19), // September 19
      new Date(2025, 8, 20), // September 20
      new Date(2025, 8, 21), // September 21
      new Date(2025, 8, 22), // September 22
      new Date(2025, 8, 23), // September 23
      new Date(2025, 8, 24), // September 24
      new Date(2025, 8, 25), // September 25
      new Date(2025, 8, 26), // September 26
    ];

    const generatedSlots: InterviewSlot[] = [];
    const grouped: Record<string, InterviewSlot[]> = {};

    hardcodedDates.forEach((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // Generate time slots from 7 AM to 9 PM in 30-minute increments
      for (let hour = 7; hour < 21; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          const endHour = minute === 30 ? hour + 1 : hour;
          const endMinute = minute === 30 ? 0 : 30;
          const endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

          const slotId = `${dateStr}-${timeStr}`;
          const isUnavailable = unavailable.has(slotId);

          const slot: InterviewSlot = {
            id: slotId,
            eb: selectedEB || 'general',
            day: dateStr,
            timeStart: timeStr,
            timeEnd: endTimeStr,
            maxSlots: isUnavailable ? 0 : 1,
            currentSlots: 0,
            createdAt: new Date().toISOString()
          };

          generatedSlots.push(slot);

          if (!grouped[dateStr]) {
            grouped[dateStr] = [];
          }
          grouped[dateStr].push(slot);
        }
      }
    });

    setSlots(generatedSlots);
    setGroupedSlots(grouped);
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      // Use hardcoded slots instead of API call
      generateHardcodedSlots();
    } catch (error) {
      console.error('Error generating slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async () => {
    if (!selectedEB || !newSlot.day || !newSlot.timeStart || !newSlot.timeEnd) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setProcessingId('create');
      const response = await fetch('/api/admin/interview-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eb: selectedEB,
          ...newSlot
        }),
      });

      if (response.ok) {
        await fetchSlots();
        setShowCreateModal(false);
        setNewSlot({ day: '', timeStart: '', timeEnd: '', maxSlots: 1 });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create slot');
      }
    } catch (error) {
      console.error('Error creating slot:', error);
      alert('Failed to create slot');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateSlot = async (slotId: string, maxSlots: number, isUnavailable: boolean) => {
    try {
      setProcessingId(slotId);
      const response = await fetch('/api/admin/interview-slots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId,
          maxSlots,
          isUnavailable
        }),
      });

      if (response.ok) {
        await fetchSlots();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update slot');
      }
    } catch (error) {
      console.error('Error updating slot:', error);
      alert('Failed to update slot');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      setProcessingId(slotId);
      const response = await fetch(`/api/admin/interview-slots?slotId=${slotId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSlots();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Failed to delete slot');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleUnavailable = (slotId: string) => {
    const newUnavailableSlots = new Set(localUnavailableSlots);
    if (newUnavailableSlots.has(slotId)) {
      newUnavailableSlots.delete(slotId);
      removeUnavailableSlot(slotId);
    } else {
      newUnavailableSlots.add(slotId);
      addUnavailableSlot(slotId);
    }
    setLocalUnavailableSlots(newUnavailableSlots);
    // Regenerate slots with updated unavailable status
    generateHardcodedSlots(newUnavailableSlots);
  };

  const getEBName = (ebId: string) => {
    const committee = committeeRoles.find(c => c.id === ebId);
    const role = roles.find(r => r.id === ebId);
    return committee?.title || role?.title || ebId;
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-inter" style={{ backgroundColor: "#f6f6fe" }}>
      {/* Sidebar Navigation */}
      <MobileSidebar>
        <SidebarContent activePage="schedule" />
      </MobileSidebar>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 pt-16 md:pt-12">
        {/* PAGE HEADER */}
        <div className="mb-8 mt-12 md:mt-8 text-center md:text-left">
          <h1 
            className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-2 flex items-center justify-center md:justify-start"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            Interview Schedule Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 italic mb-6 md:mb-6">
            Manage interview slots for committees and executive assistant roles.
          </p>
          <hr className="border-gray-300" />
        </div>

        {/* FILTERS AND ACTIONS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Committee/Role</label>
                <select
                  value={selectedEB}
                  onChange={(e) => setSelectedEB(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Committees/Roles</option>
                  <optgroup label="Committees">
                    {committeeRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Executive Assistant Roles">
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.title}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                      viewMode === 'calendar'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Slot
            </button>
          </div>
        </div>

        {/* SCHEDULE CONTENT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]">
          {slots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No interview slots found</p>
              <p className="text-gray-400 text-sm mt-2">Create your first slot to get started</p>
            </div>
          ) : viewMode === 'calendar' ? (
            /* CALENDAR VIEW */
            <div className="space-y-6">
              <p className="text-black text-sm font-bold text-center mb-4 font-inter">
                Click on any slot to mark it as unavailable/available. Green = Available, Red = Unavailable
              </p>
              
              {Object.keys(groupedSlots).length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-inter">
                  No available slots at the moment. Please check back later.
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-[#164E96] overflow-hidden">
                  {/* Calendar Grid Container */}
                  <div className="overflow-x-auto divide-y divide-[#164E96]">
                    {/* Header Row */}
                    <div className="flex min-w-fit">
                      {/* Time column header */}
                      <div className="sticky left-0 bg-white z-10 p-3 font-inter font-semibold text-sm text-gray-700 flex items-center justify-center text-center w-[60px] lg:w-[100px] flex-shrink-0 shadow-[8px_0_16px_-2px_rgba(0,0,0,0.40)]">
                        Time
                      </div>

                      {/* Day headers container */}
                      <div className="flex flex-1 divide-x divide-[#164E96] border-l border-[#164E96]">
                        {Object.entries(groupedSlots)
                          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                          .map(([date]) => {
                            const dayDate = new Date(date);
                            const dayName = dayDate.toLocaleDateString("en-US", { weekday: "short" });
                            const dayNumber = dayDate.getDate();

                            return (
                              <div
                                key={date}
                                className="bg-[#164E96] p-3 text-center flex-1 w-[60px] lg:w-[100px]"
                              >
                                <div className="font-inter font-semibold text-sm text-white p-1">
                                  {dayName}
                                </div>
                                <div className="font-inter text-xs text-white">
                                  {dayNumber}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Time slot rows */}
                    {(() => {
                      // Generate all possible time slots from 7 AM to 9 PM in 30-minute increments
                      const allTimeSlots = [];
                      for (let hour = 7; hour < 21; hour++) {
                        for (let minute = 0; minute < 60; minute += 30) {
                          const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                          const endHour = minute === 30 ? hour + 1 : hour;
                          const endMinute = minute === 30 ? 0 : 30;
                          const endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

                          allTimeSlots.push({
                            time: timeStr,
                            endTime: endTimeStr,
                            displayTime: `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${minute.toString().padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`,
                            endDisplayTime: `${endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour}:${endMinute.toString().padStart(2, "0")} ${endHour >= 12 ? "PM" : "AM"}`,
                          });
                        }
                      }

                      return allTimeSlots.map((timeSlot, timeIndex) => (
                        <div key={timeIndex} className="flex min-w-max">
                          {/* Time label */}
                          <div className="sticky left-0 bg-white z-10 p-3 text-center w-[60px] lg:w-[100px] flex-shrink-0 shadow-[10px_0_12px_-0px_rgba(0,0,0,0.4)]">
                            <div className="font-inter text-sm text-gray-700">
                              {timeSlot.displayTime} -
                            </div>
                            <div className="font-inter text-xs text-gray-500">
                              {timeSlot.endDisplayTime}
                            </div>
                          </div>

                          {/* Day columns container */}
                          <div className="flex flex-1 divide-x divide-[#164E96] border-l border-[#164E96]">
                            {Object.entries(groupedSlots)
                              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                              .map(([date, slots]) => {
                                const slotForThisTime = slots.find(
                                  (slot) => slot.timeStart === timeSlot.time
                                );
                                const isFull = slotForThisTime && slotForThisTime.currentSlots >= slotForThisTime.maxSlots;
                                const isUnavailable = slotForThisTime && slotForThisTime.maxSlots === 0;

                                return (
                                  <div
                                    key={date}
                                    className="min-h-[60px] flex-1 w-[60px] lg:w-[100px]"
                                  >
                                    {slotForThisTime ? (
                                      <button
                                        onClick={() => handleToggleUnavailable(slotForThisTime.id)}
                                        className={`w-full h-full transition-all duration-200 relative ${
                                          isUnavailable
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-green-500 hover:bg-green-600"
                                        } text-white text-xs font-semibold cursor-pointer`}
                                      >
                                        <div className="p-1">
                                          <div className="font-inter text-xs">
                                            {isUnavailable ? "Unavailable" : "Available"}
                                          </div>
                                          <div className="font-inter text-xs">
                                            {formatTime(slotForThisTime.timeStart)}
                                          </div>
                                        </div>
                                      </button>
                                    ) : (
                                      <div className="w-full h-full bg-gray-200"></div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-4">
              {slots.map((slot) => (
                <div key={slot.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{getEBName(slot.eb)}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          slot.maxSlots === 0 
                            ? 'text-red-800 bg-red-100' 
                            : slot.currentSlots >= slot.maxSlots 
                              ? 'text-orange-800 bg-orange-100'
                              : 'text-green-800 bg-green-100'
                        }`}>
                          {slot.maxSlots === 0 ? 'Unavailable' : `${slot.currentSlots}/${slot.maxSlots} slots`}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Date:</strong> {new Date(slot.day).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {formatTime(slot.timeStart)} - {formatTime(slot.timeEnd)}</p>
                        <p><strong>Created:</strong> {new Date(slot.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={slot.maxSlots}
                        onChange={(e) => handleUpdateSlot(slot.id, parseInt(e.target.value), false)}
                        disabled={processingId === slot.id}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => handleUpdateSlot(slot.id, 0, true)}
                        disabled={processingId === slot.id}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:opacity-50"
                      >
                        {processingId === slot.id ? '...' : 'Mark Unavailable'}
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        disabled={processingId === slot.id || slot.currentSlots > 0}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        {processingId === slot.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Interview Slot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Committee/Role</label>
                <select
                  value={selectedEB}
                  onChange={(e) => setSelectedEB(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select committee/role</option>
                  <optgroup label="Committees">
                    {committeeRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Executive Assistant Roles">
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.title}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.timeStart}
                    onChange={(e) => setNewSlot({ ...newSlot, timeStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSlot.timeEnd}
                    onChange={(e) => setNewSlot({ ...newSlot, timeEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Slots</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newSlot.maxSlots}
                  onChange={(e) => setNewSlot({ ...newSlot, maxSlots: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewSlot({ day: '', timeStart: '', timeEnd: '', maxSlots: 1 });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSlot}
                disabled={processingId === 'create'}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {processingId === 'create' ? 'Creating...' : 'Create Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;