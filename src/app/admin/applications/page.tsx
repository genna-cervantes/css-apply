"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MobileSidebar from '@/components/AdminMobileSB';
import SidebarContent from '@/components/AdminSidebar';
import { committeeRoles } from '@/data/committeeRoles';
import { roles } from '@/data/ebRoles';

interface Application {
  id: string;
  studentNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentNumber: string;
    section: string;
  };
  hasAccepted?: boolean;
  status?: string;
  redirection?: string;
  firstOptionCommittee?: string;
  secondOptionCommittee?: string;
  firstOptionEb?: string;
  secondOptionEb?: string;
  interviewSlotDay?: string;
  interviewSlotTimeStart?: string;
  interviewSlotTimeEnd?: string;
  createdAt: string;
}

const Applications = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'member' | 'committee' | 'ea'>('member');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [redirectTo, setRedirectTo] = useState('');

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

    fetchApplications();
  }, [status, session, router, selectedType, selectedStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: selectedType,
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });

      const response = await fetch(`/api/admin/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject' | 'redirect') => {
    try {
      setProcessingId(applicationId);
      
      const body: any = {
        applicationId,
        type: selectedType,
        action
      };

      if (action === 'redirect') {
        body.redirection = redirectTo;
      }

      const response = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchApplications(); // Refresh the list
        setShowRedirectModal(false);
        setSelectedApplication(null);
        setRedirectTo('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    } finally {
      setProcessingId(null);
    }
  };

  const openRedirectModal = (application: Application) => {
    setSelectedApplication(application);
    setShowRedirectModal(true);
  };

  const getStatusBadge = (application: Application) => {
    if (selectedType === 'member') {
      return application.hasAccepted ? 
        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Accepted</span> :
        <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
    } else {
      if (application.hasAccepted) {
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Accepted</span>;
      } else if (application.status === 'failed') {
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Rejected</span>;
      } else if (application.status === 'redirected') {
        return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Redirected</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
      }
    }
  };

  const getApplicationDetails = (application: Application) => {
    if (selectedType === 'member') {
      return (
        <div className="text-sm text-gray-600">
          <p>Student Number: {application.studentNumber}</p>
          <p>Section: {application.user.section}</p>
        </div>
      );
    } else if (selectedType === 'committee') {
      const firstCommittee = committeeRoles.find(c => c.id === application.firstOptionCommittee);
      const secondCommittee = committeeRoles.find(c => c.id === application.secondOptionCommittee);
      return (
        <div className="text-sm text-gray-600">
          <p>Student Number: {application.studentNumber}</p>
          <p>Section: {application.user.section}</p>
          <p>First Choice: {firstCommittee?.title}</p>
          <p>Second Choice: {secondCommittee?.title}</p>
          {application.interviewSlotDay && (
            <p>Interview: {application.interviewSlotDay} at {application.interviewSlotTimeStart}</p>
          )}
        </div>
      );
    } else if (selectedType === 'ea') {
      const firstEB = roles.find(r => r.id === application.firstOptionEb);
      const secondEB = roles.find(r => r.id === application.secondOptionEb);
      return (
        <div className="text-sm text-gray-600">
          <p>Student Number: {application.studentNumber}</p>
          <p>Section: {application.user.section}</p>
          <p>First Choice: {firstEB?.title}</p>
          <p>Second Choice: {secondEB?.title}</p>
          {application.interviewSlotDay && (
            <p>Interview: {application.interviewSlotDay} at {application.interviewSlotTimeStart}</p>
          )}
        </div>
      );
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-inter" style={{ backgroundColor: "#f6f6fe" }}>
      {/* Sidebar Navigation */}
      <MobileSidebar>
        <SidebarContent activePage="applications" />
      </MobileSidebar>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 pt-16 md:pt-12">
        {/* PAGE HEADER */}
        <div className="mb-8 mt-12 md:mt-8 text-center md:text-left">
          <h1 
            className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-2 flex items-center justify-center md:justify-start"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            Application Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 italic mb-6 md:mb-6">
            Review and manage all applications from students.
          </p>
          <hr className="border-gray-300" />
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'member' | 'committee' | 'ea')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member Applications</option>
                <option value="committee">Committee Applications</option>
                <option value="ea">Executive Assistant Applications</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* APPLICATIONS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{application.user.name}</h3>
                        {getStatusBadge(application)}
                      </div>
                      {getApplicationDetails(application)}
                      <p className="text-xs text-gray-500 mt-2">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {!application.hasAccepted && application.status !== 'failed' && (
                        <>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'accept')}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingId === application.id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'reject')}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {processingId === application.id ? 'Processing...' : 'Reject'}
                          </button>
                          {selectedType !== 'member' && (
                            <button
                              onClick={() => openRedirectModal(application)}
                              disabled={processingId === application.id}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              Redirect
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* REDIRECT MODAL */}
      {showRedirectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Redirect Application</h3>
            <p className="text-gray-600 mb-4">
              Redirect {selectedApplication.user.name}'s application to:
            </p>
            <select
              value={redirectTo}
              onChange={(e) => setRedirectTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Select committee/role</option>
              {selectedType === 'committee' ? (
                committeeRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.title}</option>
                ))
              ) : (
                roles.map(role => (
                  <option key={role.id} value={role.id}>{role.title}</option>
                ))
              )}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRedirectModal(false);
                  setSelectedApplication(null);
                  setRedirectTo('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplicationAction(selectedApplication.id, 'redirect')}
                disabled={!redirectTo || processingId === selectedApplication.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {processingId === selectedApplication.id ? 'Processing...' : 'Redirect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;