"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MobileSidebar from '@/components/AdminMobileSB';
import SidebarContent from '@/components/AdminSidebar';
import { committeeRoles } from '@/data/committeeRoles';

interface CommitteeStaff {
  id: string;
  studentNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentNumber: string;
    section: string;
  };
  firstOptionCommittee: string;
  secondOptionCommittee: string;
  hasAccepted: boolean;
  status?: string;
  redirection?: string;
  interviewSlotDay?: string;
  interviewSlotTimeStart?: string;
  interviewSlotTimeEnd?: string;
  createdAt: string;
}

const Staffs = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staffs, setStaffs] = useState<CommitteeStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'accepted' | 'pending' | 'rejected'>('all');

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

    fetchStaffs();
  }, [status, session, router, selectedStatus]);

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: 'committee',
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });

      const response = await fetch(`/api/admin/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStaffs(data.applications);
      }
    } catch (error) {
      console.error('Error fetching staffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (staff: CommitteeStaff) => {
    if (staff.hasAccepted) {
      return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Accepted</span>;
    } else if (staff.status === 'failed') {
      return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Rejected</span>;
    } else if (staff.status === 'redirected') {
      return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Redirected</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading committee staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-inter" style={{ backgroundColor: "#f6f6fe" }}>
      {/* Sidebar Navigation */}
      <MobileSidebar>
        <SidebarContent activePage="staffs" />
      </MobileSidebar>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 pt-16 md:pt-12">
        {/* PAGE HEADER */}
        <div className="mb-8 mt-12 md:mt-8 text-center md:text-left">
          <h1 
            className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-2 flex items-center justify-center md:justify-start"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            Committee Staff
          </h1>
          <p className="text-sm md:text-base text-gray-600 italic mb-6 md:mb-6">
            View and manage all committee staff applications and members.
          </p>
          <hr className="border-gray-300" />
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'accepted' | 'pending' | 'rejected')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Applications</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* STAFFS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]">
          {staffs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No committee staff applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {staffs.map((staff) => {
                const firstCommittee = committeeRoles.find(c => c.id === staff.firstOptionCommittee);
                const secondCommittee = committeeRoles.find(c => c.id === staff.secondOptionCommittee);
                
                return (
                  <div key={staff.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{staff.user.name}</h3>
                          {getStatusBadge(staff)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Student Number: {staff.studentNumber}</p>
                          <p>Section: {staff.user.section}</p>
                          <p>Email: {staff.user.email}</p>
                          <p>First Choice: {firstCommittee?.title}</p>
                          <p>Second Choice: {secondCommittee?.title}</p>
                          {staff.interviewSlotDay && (
                            <p>Interview: {staff.interviewSlotDay} at {staff.interviewSlotTimeStart}</p>
                          )}
                          {staff.redirection && (
                            <p>Redirected to: {staff.redirection}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Applied: {new Date(staff.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Staffs;