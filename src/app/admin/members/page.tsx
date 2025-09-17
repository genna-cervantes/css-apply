"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MobileSidebar from '@/components/AdminMobileSB';
import SidebarContent from '@/components/AdminSidebar';

interface Member {
  id: string;
  studentNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentNumber: string;
    section: string;
  };
  hasAccepted: boolean | null;
  paymentProof: string;
  createdAt: string;
}

const Members = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'accepted' | 'pending' | 'rejected'>('all');

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: 'member',
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });

      const response = await fetch(`/api/admin/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.applications);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

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

    fetchMembers();
  }, [status, session?.user?.role, selectedStatus, fetchMembers, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-repeat">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#044FAF]"></div>
          <p className="mt-4 text-[#134687]">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-repeat overflow-x-hidden">
      {/* Sidebar Navigation */}
      <MobileSidebar>
        <SidebarContent activePage="members"/>
      </MobileSidebar>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 pt-16 md:pt-12">
        {/* PAGE HEADER */}
        <div className="mb-8 mt-12 md:mt-8 text-center md:text-left">
          <div className="rounded-[45px] text-white text-lg lg:text-4xl font-poppins font-medium px-6 py-2 lg:py-4 text-center [background:linear-gradient(90deg,_#2F7EE3_0%,_#0349A2_100%)] w-fit mb-4">
            Members
          </div>
          <p className="text-black text-xs lg:text-lg font-Inter font-light leading-5 mb-4 md:mb-6">
            View and manage all members of CSS Apply in one place.
          </p>
          <hr className="border-[#005FD9]" />
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-[#134687] mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'accepted' | 'pending' | 'rejected')}
                className="px-3 py-2 border-2 border-[#005FD9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#044FAF]"
              >
                <option value="all">All Members</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* MEMBERS LIST */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="border-2 border-[#005FD9] rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-[#134687] truncate">{member.user.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.hasAccepted === true
                            ? 'text-white bg-gradient-to-r from-[#044FAF] to-[#134687]' 
                            : 'text-[#5B4515] bg-gradient-to-r from-[#FFE7B4] to-[#FFF3D6]'
                        }`}>
                          {member.hasAccepted === true ? 'Accepted' : 'Pending'}
                        </span>
                      </div>
                      <div className="text-xs text-[#134687] space-y-0.5">
                        <div>Student #: {member.studentNumber} | Section: {member.user.section}</div>
                        <div>Email: {member.user.email}</div>
                        {member.paymentProof && (
                          <div>Payment Proof: {member.paymentProof}</div>
                        )}
                        <div>Applied: {new Date(member.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Members;