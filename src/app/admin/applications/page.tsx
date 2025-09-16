"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MobileSidebar from '@/components/AdminMobileSB';
import SidebarContent from '@/components/AdminSidebar';
import { committeeRoles } from '@/data/committeeRoles';
import { roles } from '@/data/ebRoles';
import { LucideChevronDown, LucideChevronUp } from "lucide-react";

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
  cvUrl?: string;
  createdAt: string;
  type: 'committee' | 'ea' | 'member';
  cv?: string;
  paymentProof?: string;
}

const Applications = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<{committee: Application[], ea: Application[], member: Application[]}>({committee: [], ea: [], member: []});
  const [loading, setLoading] = useState(false);
  const [selectedType] = useState<'member' | 'committee' | 'ea'>('member');
  const [selectedStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [redirectTo, setRedirectTo] = useState('');
  const [ebData, setEbData] = useState<{position: string} | null>(null);
  const [showCommitteeApplications, setShowCommitteeApplications] = useState(true);
  const [showEaApplications, setShowEaApplications] = useState(true);
  const [showMemberApplications, setShowMemberApplications] = useState(true);

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

    getEBData(session?.user?.dbId);
  }, [status, session, router]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/applications/${ebData?.position}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [ebData?.position]);

  // Separate useEffect for fetching applications when ebData is available
  useEffect(() => {
    if (ebData) {
      fetchApplications();
    }
  }, [ebData, selectedType, selectedStatus, fetchApplications]);

  const getEBData = async (id: string) => {
    const response = await fetch(`/api/admin/eb-profiles/${id}`);
    const data = await response.json();
    setEbData(data.ebProfile);
  };

  const handleApplicationAction = async (applicationId: string, type: 'committee' | 'ea' | 'member', action: 'accept' | 'reject' | 'redirect') => {
    try {
      setProcessingId(applicationId);
      
      const body: {applicationId: string; type: string; action: string; redirection?: string} = {
        applicationId,
        type,
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

  const getStatusBadge = (application: Application) => {
    if (application.type === 'member') {
      if (application.hasAccepted === true) {
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Accepted</span>;
      } else if (application.hasAccepted === false) {
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Rejected</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
      }
    }
    
    if (application.status === 'accepted') {
      return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Accepted</span>;
    } else if (application.status === 'failed') {
      return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Rejected</span>;
    } else if (application.status === 'redirected') {
      return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Redirected</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
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

  if (loading) {
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

        {/* APPLICATIONS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]">
          {applications.committee.length === 0 && applications.ea.length === 0 && applications.member.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No applications under your position found</p>
            </div>
          ) : (
            <>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-green-600 text-white p-4 rounded-md">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold">Member Applications</h2>
                  <p>({applications.member.length})</p>
                </div>
                <button onClick={() => setShowMemberApplications(!showMemberApplications)}>
                  {!showMemberApplications ? <LucideChevronUp /> : <LucideChevronDown />}
                </button>
              </div>

              {showMemberApplications && applications.member.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{application.user.name}</h3>
                        {getStatusBadge(application)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Student Number: {application.studentNumber}</p>
                        <p>Section: {application.user.section}</p>
                        <p>Email: {application.user.email}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {(!application.hasAccepted) && (
                        <>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'member', 'accept')}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingId === application.id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'member', 'reject')}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {processingId === application.id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-md">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold">Committee Applications</h2>
                  <p>({applications.committee.length})</p>
                </div>
                <button onClick={() => setShowCommitteeApplications(!showCommitteeApplications)}>
                  {!showCommitteeApplications ? <LucideChevronUp /> : <LucideChevronDown />}
                </button>
              </div>

              {showCommitteeApplications && applications.committee.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{application.user.name}</h3>
                        {getStatusBadge(application)}
                      </div>
                      {getApplicationDetails(application)}
                      <div className="mt-2">
                        <h2 className="text-sm font-semibold text-gray-800">Meeting Details: </h2>
                        <p className="text-xs text-gray-500">{application.interviewSlotDay} at {application.interviewSlotTimeStart} - {application.interviewSlotTimeEnd}</p>
                        <button className="px-3 py-1 mt-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50">Join Meeting</button>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-blue-200 p-2 rounded-md text-sm text-gray-500">
                          Second Option: {application.secondOptionCommittee}
                      </div>
                      <a target="_blank" href={application.cv} className="px-3 py-1 mt-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50">Open CV</a>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {(!application.status || application.status === 'pending') && (
                        <>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'committee', 'accept')}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingId === application.id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'committee', 'reject')}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {processingId === application.id ? 'Processing...' : 'Reject'}
                          </button>
                          <button
                            onClick={() => {
                              setShowRedirectModal(true)
                              setSelectedApplication(application)
                            }}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:opacity-50"
                          >
                            Redirect
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-md">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold">Executive Assistant Applications</h2>
                  <p>({applications.ea.length})</p>
                </div>
                <button onClick={() => setShowEaApplications(!showEaApplications)}>
                  {!showEaApplications ? <LucideChevronUp /> : <LucideChevronDown />}
                </button>
              </div>

              {showEaApplications && applications.ea.map((application) => (
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

                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-blue-200 p-2 rounded-md text-sm text-gray-500">
                          Second Option: {application.secondOptionEb}
                      </div>
                      <a target="_blank" href={application.cv} className="px-3 py-1 mt-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50">Open CV</a>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {(!application.status || application.status === 'pending') && (
                        <>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'ea', 'accept')}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingId === application.id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'ea', 'reject')}
                            disabled={processingId === application.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {processingId === application.id ? 'Processing...' : 'Reject'}
                          </button>
                          {selectedType !== 'member' && (
                            <button
                              onClick={() => {
                                setShowRedirectModal(true)
                                setSelectedApplication(application)
                              }}
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
            </>
          )}
        </div>
      </div>

      {/* REDIRECT MODAL */}
      {showRedirectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Redirect Application</h3>
            <p className="text-gray-600 mb-4">
              Redirect {selectedApplication.user.name}&apos;s application to:
            </p>
            <select
              value={redirectTo}
              onChange={(e) => setRedirectTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Select committee/role</option>
              {selectedApplication.type === 'committee' ? (
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
                onClick={() => handleApplicationAction(selectedApplication.id, selectedApplication.type, 'redirect')}
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