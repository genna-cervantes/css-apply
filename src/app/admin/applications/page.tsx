"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MobileSidebar from '@/components/AdminMobileSB';
import SidebarContent from '@/components/AdminSidebar';
import { committeeRoles, committeeRolesSubmitted } from '@/data/committeeRoles';
import { roles } from '@/data/ebRoles';
import { truncateToLast7 } from '@/lib/truncate-utils';
import { LucideChevronDown, LucideChevronUp } from "lucide-react";

// Helper function to get committee full name
const getCommitteeFullName = (committeeId: string): string => {
  const committee = committeeRolesSubmitted.find(c => c.id === committeeId);
  return committee ? committee.title : committeeId;
};

// Helper function to get EB role full name
const getEBRoleFullName = (roleId: string): string => {
  if (!roleId || roleId.trim() === '') return 'No choice';
  const role = roles.find(r => r.id === roleId);
  return role ? role.title : roleId;
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
  interviewBy?: string;
  cvUrl?: string;
  cvDownloadUrl?: string;
  portfolioDownloadUrl?: string;
  createdAt: string;
  type: 'committee' | 'ea' | 'member';
  cv?: string;
  paymentProof?: string;
}

// Cache for EB data to prevent unnecessary API calls
const ebDataCache = new Map<string, {position: string; timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Applications = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<{committee: Application[], ea: Application[], member: Application[]}>({committee: [], ea: [], member: []});
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [redirectTo, setRedirectTo] = useState('');
  const [ebData, setEbData] = useState<{position: string} | null>(null);
  const [showCommitteeApplications, setShowCommitteeApplications] = useState(false);
  const [showEaApplications, setShowEaApplications] = useState(false);
  const [showMemberApplications, setShowMemberApplications] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    committee: Application[];
    ea: Application[];
    member: Application[];
  }>({
    committee: [],
    ea: [],
    member: [],
  });

  // Clear EB data cache
  const clearEBCache = useCallback((id: string) => {
    ebDataCache.delete(id);
    console.log(`Cleared EB cache for user ${id}`);
  }, []);

  // Memoized EB data fetching with caching
  const getEBData = useCallback(async (id: string, forceRefresh = false) => {
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cached = ebDataCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setEbData(cached);
        return cached;
      }
    }

    try {
      // Add cache-busting timestamp
      const timestamp = Date.now();
      const response = await fetch(`/api/admin/eb-profiles/${id}?t=${timestamp}&force=${forceRefresh}`);
      const data = await response.json();
      const ebProfile = data.ebProfile;
      
      // Cache the result
      ebDataCache.set(id, { ...ebProfile, timestamp: Date.now() });
      setEbData(ebProfile);
      console.log(`Fetched fresh EB data for user ${id}: position=${ebProfile?.position}`);
      return ebProfile;
    } catch (error) {
      console.error('Error fetching EB data:', error);
      return null;
    }
  }, []);

  // Memoized applications fetching with caching
  const fetchApplications = useCallback(async (position: string) => {
    if (!position) return;
    
    try {
      setLoading(true);
      
      // Add cache-busting timestamp to ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(`/api/admin/applications/${position}?t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search applications function
  const searchApplications = useCallback(async (query: string, position: string) => {
    if (!query.trim() || !position) {
      setSearchResults({ committee: [], ea: [], member: [] });
      setIsSearching(false);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await fetch(`/api/admin/applications/search?q=${encodeURIComponent(query)}&position=${encodeURIComponent(position)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.applications);
        console.log('Search results:', data.applications);
      }
    } catch (error) {
      console.error('Error searching applications:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (ebData?.position) {
      // Debounce search by 300ms
      const timeoutId = setTimeout(() => {
        searchApplications(query, ebData.position);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [ebData?.position, searchApplications]);

  // Optimized initialization effect
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

    // Initialize only once
    if (!isInitialized && session?.user?.dbId) {
      setIsInitialized(true);
      console.log('Initializing applications page for user:', session.user.dbId);
      getEBData(session.user.dbId).then((ebProfile) => {
        console.log('Initial EB profile:', ebProfile);
        if (ebProfile?.position) {
          console.log('Fetching applications for position:', ebProfile.position);
          fetchApplications(ebProfile.position);
        }
      });
    }
  }, [status, session?.user?.role, session?.user?.dbId, isInitialized, getEBData, fetchApplications, router]);

  // Memoized application action handler
  const handleApplicationAction = useCallback(async (applicationId: string, type: 'committee' | 'ea' | 'member', action: 'accept' | 'reject' | 'redirect' | 'evaluate') => {
    if (type === 'member' && action === 'evaluate') {
      return;
    }
    
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
        // Only refetch if we have EB data
        if (ebData?.position) {
          await fetchApplications(ebData.position);
        }
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
  }, [redirectTo, ebData?.position, fetchApplications]);

  // Memoized status badge component
  const getStatusBadge = useCallback((application: Application) => {

    if (application.type === 'member') {
      if (application.hasAccepted === true) {
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Accepted</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
      }
    }
    
    // Check if application has no schedule yet (only for committee and EA applications)
    if ((application.type === 'committee' || application.type === 'ea') && 
        (!application.interviewSlotDay || !application.interviewSlotTimeStart)) {
      return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">No Schedule</span>;
    }
    
    // Priority 1: Check for redirection first (overrides hasAccepted)
    if (application.redirection) {
      return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Redirected</span>;
    }
    
    // Priority 2: Check status field
    if (application.status === 'redirected') {
      return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Redirected</span>;
    } else if (application.status === 'failed') {
      return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Rejected</span>;
    } else if (application.status === 'passed' || (application.hasAccepted === true && application.status !== null)) {
      return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Accepted</span>;
    } else if (application.status === 'evaluating') {
      return <span className="px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">Under Evaluation</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
    }
  }, []);


  const handleDownloadCV = async (application: Application) => {
    try {
      // Use the new download endpoint that forces download
      const downloadUrl = `/api/admin/download-pdf?applicationId=${application.id}&type=cv&applicationType=${application.type}`;
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${application.user.name}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Error downloading CV');
    }
  };

  const handleDownloadPortfolio = async (application: Application) => {
    try {
      // Use the new download endpoint that forces download
      const downloadUrl = `/api/admin/download-pdf?applicationId=${application.id}&type=portfolio&applicationType=${application.type}`;
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${application.user.name}_Portfolio.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading Portfolio:', error);
      alert('Error downloading Portfolio');
    }
  };

  // Memoized application counts
  const applicationCounts = useMemo(() => {
    const currentApplications = searchQuery.trim() ? searchResults : applications;
    return {
      member: currentApplications.member.length,
      committee: currentApplications.committee.length,
      ea: currentApplications.ea.length,
      total: currentApplications.member.length + currentApplications.committee.length + currentApplications.ea.length
    };
  }, [applications, searchResults, searchQuery]);

  // Show loading for initial load or when data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-repeat">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#044FAF]"></div>
          <p className="mt-4 text-[#134687]">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-repeat overflow-x-hidden">
      {/* Sidebar Navigation */}
      <MobileSidebar>
        <SidebarContent activePage="applications" />
      </MobileSidebar>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 pt-16 md:pt-12 overflow-y-auto h-screen">
        {/* PAGE HEADER */}
        <div className="mb-8 mt-12 md:mt-8 text-center md:text-left">
          <div className="flex justify-between items-center mb-4">
            <div className="rounded-[45px] text-white text-lg lg:text-4xl font-poppins font-medium px-6 py-2 lg:py-4 text-center [background:linear-gradient(90deg,_#2F7EE3_0%,_#0349A2_100%)] w-fit">
              All Applications
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (session?.user?.id) {
                    // Clear cache and force refresh
                    clearEBCache(session.user.id);
                    getEBData(session.user.id, true).then((freshEbData) => {
                      if (freshEbData?.position) {
                        fetchApplications(freshEbData.position);
                      }
                    });
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-sm rounded-md hover:from-[#04387B] hover:to-[#0f3a6b] transition-all duration-200"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  if (session?.user?.id) {
                    // Force refresh position data
                    clearEBCache(session.user.id);
                    getEBData(session.user.id, true).then((freshEbData) => {
                      console.log('Fresh EB data:', freshEbData);
                      if (freshEbData?.position) {
                        fetchApplications(freshEbData.position);
                      }
                    });
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white text-sm rounded-md hover:from-[#E55A2B] hover:to-[#CC4A1F] transition-all duration-200"
                title="Force refresh your position data (use if you recently changed positions)"
              >
                Refresh Position
              </button>
            </div>
          </div>
          <p className="text-black text-xs lg:text-lg font-Inter font-light leading-5 mb-2">
            Review and manage all applications from students for CSS Apply
          </p>
          {ebData?.position && (
            <p className="text-sm text-gray-600 mb-4">
              Current Position: <span className="font-semibold text-[#044FAF]">{ebData.position}</span>
            </p>
          )}
          
          {/* SEARCH BAR */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by name, student number, or email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044FAF] focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#044FAF]"></div>
                </div>
              )}
            </div>
            {searchQuery.trim() && (
              <p className="text-sm text-gray-600 mt-2">
                {isSearching ? 'Searching...' : `Found ${applicationCounts.total} result(s) for "${searchQuery}"`}
              </p>
            )}
          </div>
          
          <hr className="border-[#005FD9]" />
        </div>

        {/* APPLICATIONS LIST */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]">
          {(() => {
            const currentApplications = searchQuery.trim() ? searchResults : applications;
            const hasApplications = currentApplications.committee.length > 0 || currentApplications.ea.length > 0 || currentApplications.member.length > 0;
            
            if (!hasApplications) {
              return (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchQuery.trim() 
                      ? `No applications found for "${searchQuery}"` 
                      : "No applications under your position found"
                    }
                  </p>
                </div>
              );
            }
            
            return (
            <>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gradient-to-r from-[#044FAF] to-[#134687] text-white p-3 rounded-md">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold text-sm">Member Applications</h2>
                  <p className="text-xs">({applicationCounts.member})</p>
                </div>
                <button onClick={() => setShowMemberApplications(!showMemberApplications)}>
                  {!showMemberApplications ? <LucideChevronUp /> : <LucideChevronDown />}
                </button>
              </div>

              {showMemberApplications && currentApplications.member.map((application) => (
                <div key={application.id} className="border-2 border-[#005FD9] rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-800 truncate">{application.user.name}</h3>
                        {getStatusBadge(application)}
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <div>Student #: {application.studentNumber} | Section: {application.user.section}</div>
                        <div>Email: {application.user.email}</div>
                        <div>
                          {application.interviewSlotDay && application.interviewSlotTimeStart && application.interviewSlotTimeEnd ? (
                            <div>
                              <div>Interview: {new Date(application.interviewSlotDay).toLocaleDateString()}</div>
                              <div>Time: {application.interviewSlotTimeStart} - {application.interviewSlotTimeEnd}</div>
                            </div>
                          ) : (
                            <div>Applied: {new Date(application.createdAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                      {(!application.hasAccepted) && (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleApplicationAction(application.id, 'member', 'accept')}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] disabled:opacity-50 transition-all duration-200"
                          >
                            {processingId === application.id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'member', 'reject')}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#FFBC2B] to-[#CE9823] text-white text-xs rounded hover:from-[#CE9823] hover:to-[#B8860B] disabled:opacity-50 transition-all duration-200"
                          >
                            {processingId === application.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                      {application.hasAccepted && (
                        <div className="text-xs text-green-600 font-semibold text-left sm:text-right">
                          Member ID: {truncateToLast7(application.user.id).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center bg-gradient-to-r from-[#044FAF] to-[#134687] text-white p-3 rounded-md">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold text-sm">Committee Applications</h2>
                  <p className="text-xs">({applicationCounts.committee})</p>
                </div>
                <button onClick={() => setShowCommitteeApplications(!showCommitteeApplications)}>
                  {!showCommitteeApplications ? <LucideChevronUp /> : <LucideChevronDown />}
                </button>
              </div>

              {showCommitteeApplications && currentApplications.committee.map((application) => (
                <div key={application.id} className="border-2 border-[#005FD9] rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-800 truncate">{application.user.name}</h3>
                        {getStatusBadge(application)}
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5 mb-2">
                        <div>Student #: {application.studentNumber} | Section: {application.user.section}</div>
                        <div>Email: {application.user.email}</div>
                        {(() => {
                          // Check if this is a redirected EA application by checking if redirection exists
                          if (application.redirection) {
                            return (
                              <>
                                <div className="text-blue-600 font-semibold">EA Applicant Redirected to Staff</div>
                                <div className="text-blue-600 font-semibold">Redirected to: {application.redirection}</div>
                              </>
                            );
                          } else {
                            return (
                              <>
                                {application.firstOptionCommittee && (
                                  <div>First Choice: {getCommitteeFullName(application.firstOptionCommittee)}</div>
                                )}
                                {application.secondOptionCommittee && (
                                  <div>Second Choice: {getCommitteeFullName(application.secondOptionCommittee)}</div>
                                )}
                              </>
                            );
                          }
                        })()}
                        <div>
                          {application.interviewSlotDay && application.interviewSlotTimeStart && application.interviewSlotTimeEnd ? (
                            <div>
                              <div>Interview: {new Date(application.interviewSlotDay).toLocaleDateString()}</div>
                              <div>Time: {application.interviewSlotTimeStart} - {application.interviewSlotTimeEnd}</div>
                            </div>
                          ) : (
                            <div>Applied: {new Date(application.createdAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Meeting Details */}
                      <div className="text-xs text-gray-600 mb-2">
                        <div className="font-medium">Interview: {application.interviewSlotDay} at {application.interviewSlotTimeStart} - {application.interviewSlotTimeEnd}</div>
                        {application.interviewBy && (
                          <div>Interviewer: {application.interviewBy}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                      {/* Download Buttons */}
                      <div className="flex gap-1 flex-wrap">
                        <button 
                          onClick={() => handleDownloadCV(application)}
                          className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] transition-all duration-200"
                        >
                          CV
                        </button>
                        {application.portfolioDownloadUrl && (
                          <button 
                            onClick={() => handleDownloadPortfolio(application)}
                            className="px-2 py-1 bg-gradient-to-r from-[#FFBC2B] to-[#CE9823] text-white text-xs rounded hover:from-[#CE9823] hover:to-[#B8860B] transition-all duration-200"
                          >
                            Portfolio
                          </button>
                        )}
                      </div>

                      {/* Join Meeting Button */}
                      {application.interviewBy ? (
                        <a 
                          href={`/api/admin/eb-profiles/${application.interviewBy}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] inline-block text-center w-full sm:w-auto transition-all duration-200"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              const response = await fetch(`/api/admin/eb-profiles/by-position?position=${encodeURIComponent(application.interviewBy || '')}`);
                              const data = await response.json();
                              if (data.success && data.ebProfile?.meetingLink) {
                                window.open(data.ebProfile.meetingLink, '_blank', 'noopener,noreferrer');
                              } else {
                                alert('Meeting link not available');
                              }
                            } catch (error) {
                              console.error('Error fetching meeting link:', error);
                              alert('Failed to get meeting link');
                            }
                          }}
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <button className="px-2 py-1 bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] text-xs rounded cursor-not-allowed w-full sm:w-auto border-2 border-[#005FD9]" disabled>
                          No Interviewer
                        </button>
                      )}

                      {/* Action Buttons */}
                      {/* Step 1: Initial evaluation - only show Evaluate button */}
                      {(!application.status || application.status === 'pending') && (
                        <div className="flex gap-1 flex-wrap w-full sm:w-auto">
                          <button
                            onClick={() => handleApplicationAction(application.id, 'committee', 'evaluate')}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] disabled:opacity-50 transition-all duration-200"
                          >
                            {processingId === application.id ? 'Processing...' : 'Evaluate'}
                          </button>
                        </div>
                      )}
                      {/* Step 2: After evaluation - show Accept, Reject, Redirect buttons */}
                      {application.status === 'evaluating' && !application.hasAccepted && (
                        <div className="flex gap-1 flex-wrap w-full sm:w-auto">
                          <button
                            onClick={() => handleApplicationAction(application.id, 'committee', 'accept')}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] disabled:opacity-50 transition-all duration-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'committee', 'reject')}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#FFBC2B] to-[#CE9823] text-white text-xs rounded hover:from-[#CE9823] hover:to-[#B8860B] disabled:opacity-50 transition-all duration-200"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setShowRedirectModal(true)
                              setSelectedApplication(application)
                            }}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#FFBC2B] to-[#CE9823] text-white text-xs rounded hover:from-[#CE9823] hover:to-[#B8860B] disabled:opacity-50 transition-all duration-200"
                          >
                            Redirect
                          </button>
                        </div>
                      )}
                      {application.hasAccepted && (
                        <div className="text-xs text-green-600 font-semibold text-left sm:text-right">
                          Member ID: {truncateToLast7(application.user.id).toUpperCase()}
                          {application.redirection ? (
                            <div className="text-blue-600">
                              Redirected to: {application.redirection}
                            </div>
                          ) : (
                            <div className="text-green-600">
                              Accepted at: {getCommitteeFullName(application.firstOptionCommittee || '')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center bg-gradient-to-r from-[#044FAF] to-[#134687] text-white p-3 rounded-md">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold text-sm">Executive Assistant Applications</h2>
                  <p className="text-xs">({applicationCounts.ea})</p>
                </div>
                <button onClick={() => setShowEaApplications(!showEaApplications)}>
                  {!showEaApplications ? <LucideChevronUp /> : <LucideChevronDown />}
                </button>
              </div>

              {showEaApplications && currentApplications.ea.map((application) => (
                <div key={application.id} className="border-2 border-[#005FD9] rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-800 truncate">{application.user.name}</h3>
                        {getStatusBadge(application)}
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5 mb-2">
                        <div>Student #: {application.studentNumber} | Section: {application.user.section}</div>
                        <div>Email: {application.user.email}</div>
                        {(() => {
                          // Check if this is a redirected EA application by checking if redirection exists
                          if (application.redirection) {
                            return (
                              <>
                                <div className="text-blue-600 font-semibold">EA Applicant Redirected to Staff</div>
                                <div className="text-blue-600 font-semibold">Redirected to: {application.redirection}</div>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <div>First Choice: {capitalizeFirstLetter(application.firstOptionEb || '')}</div>
                                <div>Second Choice: {capitalizeFirstLetter(application.secondOptionEb || '')}</div>
                              </>
                            );
                          }
                        })()}
                        <div>
                          {application.interviewSlotDay && application.interviewSlotTimeStart && application.interviewSlotTimeEnd ? (
                            <div>
                              <div>Interview: {new Date(application.interviewSlotDay).toLocaleDateString()}</div>
                              <div>Time: {application.interviewSlotTimeStart} - {application.interviewSlotTimeEnd}</div>
                            </div>
                          ) : (
                            <div>Applied: {new Date(application.createdAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                      {/* Download Buttons */}
                      <div className="flex gap-1 flex-wrap">
                        <button 
                          onClick={() => handleDownloadCV(application)}
                          className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] transition-all duration-200"
                        >
                          CV
                        </button>
                        {application.portfolioDownloadUrl && (
                          <button 
                            onClick={() => handleDownloadPortfolio(application)}
                            className="px-2 py-1 bg-gradient-to-r from-[#FFBC2B] to-[#CE9823] text-white text-xs rounded hover:from-[#CE9823] hover:to-[#B8860B] transition-all duration-200"
                          >
                            Portfolio
                          </button>
                        )}
                      </div>

                      {/* Join Meeting Button */}
                      {application.interviewBy ? (
                        <a 
                          href={`/api/admin/eb-profiles/${application.interviewBy}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] inline-block text-center w-full sm:w-auto transition-all duration-200"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              const response = await fetch(`/api/admin/eb-profiles/by-position?position=${encodeURIComponent(application.interviewBy || '')}`);
                              const data = await response.json();
                              if (data.success && data.ebProfile?.meetingLink) {
                                window.open(data.ebProfile.meetingLink, '_blank', 'noopener,noreferrer');
                              } else {
                                alert('Meeting link not available');
                              }
                            } catch (error) {
                              console.error('Error fetching meeting link:', error);
                              alert('Failed to get meeting link');
                            }
                          }}
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <button className="px-2 py-1 bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] text-xs rounded cursor-not-allowed w-full sm:w-auto border-2 border-[#005FD9]" disabled>
                          No Interviewer
                        </button>
                      )}

                      {/* Action Buttons */}
                      {/* Step 1: Initial evaluation - only show Evaluate button */}
                      {(!application.status || application.status === 'pending') && (
                        <div className="flex gap-1 flex-wrap w-full sm:w-auto">
                          <button
                            onClick={() => handleApplicationAction(application.id, 'ea', 'evaluate')}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] disabled:opacity-50 transition-all duration-200"
                          >
                            {processingId === application.id ? 'Processing...' : 'Evaluate'}
                          </button>
                        </div>
                      )}
                      {/* Step 2: After evaluation - show Accept, Reject, Redirect buttons */}
                      {application.status === 'evaluating' && !application.hasAccepted && (
                        <div className="flex gap-1 flex-wrap w-full sm:w-auto">
                          <button
                            onClick={() => handleApplicationAction(application.id, 'ea', 'accept')}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white text-xs rounded hover:from-[#04387B] hover:to-[#0f3a6b] disabled:opacity-50 transition-all duration-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'ea', 'reject')}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#FFBC2B] to-[#CE9823] text-white text-xs rounded hover:from-[#CE9823] hover:to-[#B8860B] disabled:opacity-50 transition-all duration-200"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setShowRedirectModal(true)
                              setSelectedApplication(application)
                            }}
                            disabled={processingId === application.id}
                            className="px-2 py-1 bg-gradient-to-r from-[#FFBC2B] to-[#CE9823] text-white text-xs rounded hover:from-[#CE9823] hover:to-[#B8860B] disabled:opacity-50 transition-all duration-200"
                          >
                            Redirect
                          </button>
                        </div>
                      )}
                      {application.hasAccepted && (
                        <div className="text-xs text-green-600 font-semibold text-left sm:text-right">
                          Member ID: {truncateToLast7(application.user.id).toUpperCase()}
                          {application.redirection ? (
                            <div className="text-blue-600">
                              Redirected to: {application.redirection}
                            </div>
                          ) : (
                            <div className="text-green-600">
                              Accepted at: {getEBRoleFullName(application.firstOptionEb || '')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
            );
          })()}
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
                <>
                <optgroup label="Member">
                  <option value="member">Member</option>
                </optgroup>
                <optgroup label="Executive Assistant Roles">
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Committee Staff Roles">
                  {committeeRolesSubmitted.map(role => (
                    <option key={`committee-${role.id}`} value={`committee-${role.id}`}>{role.title} Staff</option>
                  ))}
                </optgroup>
              </>
              ) : selectedApplication.type === 'ea' ? (
                <>
                  <optgroup label="Member">
                    <option value="member">Member</option>
                  </optgroup>
                  <optgroup label="Executive Assistant Roles">
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Committee Staff Roles">
                    {committeeRolesSubmitted.map(role => (
                      <option key={`committee-${role.id}`} value={`committee-${role.id}`}>{role.title} Staff</option>
                    ))}
                  </optgroup>
                </>
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
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#044FAF] to-[#134687] text-white rounded-md hover:from-[#04387B] hover:to-[#0f3a6b] disabled:opacity-50 transition-all duration-200"
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