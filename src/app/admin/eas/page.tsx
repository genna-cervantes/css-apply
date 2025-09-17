"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MobileSidebar from '@/components/AdminMobileSB';
import SidebarContent from '@/components/AdminSidebar';
import { roles } from '@/data/ebRoles';
import { Download } from "lucide-react";

interface EA {
  id: string;
  studentNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentNumber: string;
    section: string;
  };
  firstOptionEb: string;
  secondOptionEb: string;
  hasAccepted: boolean;
  status?: string;
  redirection?: string;
  interviewSlotDay?: string;
  interviewSlotTimeStart?: string;
  interviewSlotTimeEnd?: string;
  cvDownloadUrl?: string;
  createdAt: string;
}

const EAs = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [eas, setEAs] = useState<EA[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'accepted' | 'pending' | 'rejected' | 'no-schedule'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const fetchEAs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: 'ea',
        page: currentPage.toString(),
        limit: '10',
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });

      const response = await fetch(`/api/admin/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEAs(data.applications);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching EAs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, currentPage]);

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

    fetchEAs();
  }, [status, session?.user?.role, selectedStatus, fetchEAs, router]);

  // Reset to page 1 when status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (ea: EA) => {
    if (ea.hasAccepted) {
      return <span className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#044FAF] to-[#134687] rounded-full">Accepted</span>;
    } else if (ea.status === 'failed') {
      return <span className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#FFBC2B] to-[#CE9823] rounded-full">Rejected</span>;
    } else if (ea.status === 'redirected') {
      return <span className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#044FAF] to-[#134687] rounded-full">Redirected</span>;
    } else if (!ea.interviewSlotDay || !ea.interviewSlotTimeStart) {
      return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">No Schedule</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold text-[#5B4515] bg-gradient-to-r from-[#FFE7B4] to-[#FFF3D6] rounded-full">Pending</span>;
    }
  };

  const handleDownloadCV = async (ea: EA) => {
    if (!ea.cvDownloadUrl) {
      alert('CV not available for download');
      return;
    }

    try {
      const response = await fetch(ea.cvDownloadUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.downloadUrl) {
          // Create a temporary link to download the file
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          link.download = data.fileName || `${ea.user.name}_CV.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Failed to generate download link');
        }
      } else {
        const errorData = await response.json();
        if (response.status === 404) {
          alert('CV file not found in storage');
        } else {
          alert(errorData.error || 'Failed to download CV');
        }
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Error downloading CV');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-repeat">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#044FAF]"></div>
          <p className="mt-4 text-[#134687]">Loading executive assistants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-repeat overflow-x-hidden">
      {/* Sidebar Navigation */}
      <MobileSidebar>
        <SidebarContent activePage="eas" />
      </MobileSidebar>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 pt-16 md:pt-12">
        {/* PAGE HEADER */}
        <div className="mb-8 mt-12 md:mt-8 text-center md:text-left">
          <div className="rounded-[45px] text-white text-lg lg:text-4xl font-poppins font-medium px-6 py-2 lg:py-4 text-center [background:linear-gradient(90deg,_#2F7EE3_0%,_#0349A2_100%)] w-fit mb-4">
            Executive Assistants
          </div>
          <p className="text-black text-xs lg:text-lg font-Inter font-light leading-5 mb-4 md:mb-6">
            View and manage all executive assistant applications and members for CSS Apply.
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
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'accepted' | 'pending' | 'rejected' | 'no-schedule')}
                className="px-3 py-2 border-2 border-[#005FD9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#044FAF]"
              >
                <option value="all">All Applications</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="no-schedule">No Schedule</option>
              </select>
            </div>
          </div>
        </div>

        {/* EAS LIST */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]">
          {eas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No executive assistant applications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eas.map((ea) => {
                const firstEB = roles.find(r => r.id === ea.firstOptionEb);
                const secondEB = roles.find(r => r.id === ea.secondOptionEb);
                
                return (
                  <div key={ea.id} className="border-2 border-[#005FD9] rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-[#134687] truncate">{ea.user.name}</h3>
                          {getStatusBadge(ea)}
                        </div>
                        <div className="text-xs text-[#134687] space-y-0.5">
                          <div>Student #: {ea.studentNumber} | Section: {ea.user.section}</div>
                          <div>Email: {ea.user.email}</div>
                          <div>First Choice: {firstEB?.title}</div>
                          <div>Second Choice: {secondEB?.title}</div>
                          {ea.interviewSlotDay && (
                            <div>Interview: {ea.interviewSlotDay} at {ea.interviewSlotTimeStart}</div>
                          )}
                          {ea.redirection && (
                            <div>Redirected to: {ea.redirection}</div>
                          )}
                          <div>Applied: {new Date(ea.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-3">
                        {ea.cvDownloadUrl && (
                          <button
                            onClick={() => handleDownloadCV(ea)}
                            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] transition-all duration-200"
                          >
                            <Download size={12} />
                            CV
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {eas.length > 0 && pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} applications
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          currentPage === pageNum
                            ? 'bg-[#044FAF] text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EAs;