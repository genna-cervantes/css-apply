'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  studentNumber?: string
  section?: string
  createdAt: string
  ebProfile?: {
    position: string
    committees: string[]
    isActive: boolean
  }
}

interface EBProfileForm {
  userId: string
  position: string
  committees: string[]
  isActive: boolean
}

interface PendingChange {
  userId: string
  oldRole: string
  newRole: string
}

// REF: put in separate data file
// EB Positions and Committees
const EB_POSITIONS = [
  'President',
  'Internal Vice President',
  'External Vice President',
  'Secretary',
  'Assistant Secretary',
  'Treasurer',
  'Auditor',
  'Public Relations Officer (PRO)',
  '4th Year Representative',
  '3rd Year Representative',
  '2nd Year Representative',
  '1st Year Representative',
  'Chief of Staff',
  'Director for Digital Productions',
  'Director for Community Development',
  'Thomasian Wellness Advocate (TWA)'
] as const;

const EB_COMMITTEES = [
  'academics',
  'community development',
  'creatives and technical',
  'documentation',
  'external affairs',
  'finance',
  'logistics',
  'publicity',
  'sports and talent',
  'technology development'
] as const;

type SortField = 'name' | 'email' | 'role' | 'position' | 'studentNumber' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  // REF: search params instead of state so mag ppersist ung search/filter term
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isGlobalSearch, setIsGlobalSearch] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEbForm, setShowEbForm] = useState(false)
  const [ebForm, setEbForm] = useState<EBProfileForm>({
    userId: '',
    position: '',
    committees: [],
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEbMembers: 0,
    totalAdmins: 0,
    totalApplicants: 0
  })
  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      const response = await fetch(`/api/admin/users/all?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
        if (data.stats) {
          setStats(data.stats)
        }
      } else {
        console.error('Failed to fetch users:', response.status)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  // Search users function
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsGlobalSearch(false);
      setIsSearching(false);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users);
        setIsGlobalSearch(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((query: string) => {
    setSearchTerm(query);
    if (query.trim()) {
      // Debounce search by 300ms
      const timeoutId = setTimeout(() => {
        searchUsers(query);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsGlobalSearch(false);
      setSearchResults([]);
    }
  }, [searchUsers]);

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.role !== 'super_admin') {
      router.push('/admin')
      return
    }

    fetchUsers()
  }, [status, session?.user?.role, router, fetchUsers])

  // Handle filtering and sorting
  useEffect(() => {
    // Use search results if we're doing a global search, otherwise use regular filtering
    const sourceUsers = isGlobalSearch ? searchResults : users;
    
    const filtered = sourceUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ebProfile?.position.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'role':
          aValue = a.role.toLowerCase()
          bValue = b.role.toLowerCase()
          break
        case 'position':
          aValue = a.ebProfile?.position?.toLowerCase() || ''
          bValue = b.ebProfile?.position?.toLowerCase() || ''
          break
        case 'studentNumber':
          aValue = a.studentNumber || ''
          bValue = b.studentNumber || ''
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredUsers(filtered)
  }, [searchTerm, users, searchResults, isGlobalSearch, sortField, sortDirection])

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMakeEb = (user: User) => {
    setSelectedUser(user)
    setEbForm({
      userId: user.id,
      position: user.ebProfile?.position || '',
      committees: user.ebProfile?.committees || [],
      isActive: user.ebProfile?.isActive ?? true
    })
    setShowEbForm(true)
  }

  const handleSubmitEbProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/eb-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ebForm),
      })

      if (response.ok) {
        setShowEbForm(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        console.error('Failed to create EB profile:', response.status)
      }
    } catch (error) {
      console.error('Error creating EB profile:', error)
    }
  }

  const handleRemoveEb = async (userId: string) => {
    if (!confirm('Are you sure you want to remove EB privileges from this user?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/eb-profiles', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        fetchUsers()
      } else {
        console.error('Failed to remove EB profile:', response.status)
      }
    } catch (error) {
      console.error('Error removing EB profile:', error)
    }
  }

  const handleRoleChange = (userId: string, oldRole: string, newRole: string) => {
    const existingChangeIndex = pendingChanges.findIndex(change => change.userId === userId)
    
    if (existingChangeIndex >= 0) {
      const updatedChanges = [...pendingChanges]
      updatedChanges[existingChangeIndex] = { userId, oldRole, newRole }
      setPendingChanges(updatedChanges)
    } else {
      setPendingChanges([...pendingChanges, { userId, oldRole, newRole }])
    }

    if (pendingChanges.length >= 0) {
      setShowConfirmDialog(true)
    }
  }

  const confirmRoleChanges = async () => {
    try {
      for (const change of pendingChanges) {
        const response = await fetch('/api/admin/users/role', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: change.userId, 
            role: change.newRole 
          }),
        })

        if (!response.ok) {
          console.error('Failed to update user role:', response.status)
        }
      }

      fetchUsers()
      setPendingChanges([])
      setShowConfirmDialog(false)
      
    } catch (error) {
      console.error('Error updating user roles:', error)
    }
  }

  const cancelRoleChanges = () => {
    setPendingChanges([])
    setShowConfirmDialog(false)
    fetchUsers()
  }

  const getPendingRoleForUser = (userId: string) => {
    const change = pendingChanges.find(change => change.userId === userId)
    return change ? change.newRole : null
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-[#134687]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-[#044FAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-[#044FAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-gradient-to-r from-[#044FAF] to-[#134687] text-white border-[#005FD9]'
      case 'admin':
        return 'bg-gradient-to-r from-[#044FAF] to-[#134687] text-white border-[#005FD9]'
      case 'eb':
        return 'bg-gradient-to-r from-[#044FAF] to-[#134687] text-white border-[#005FD9]'
      default:
        return 'bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] border-[#005FD9]'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-repeat">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#044FAF]"></div>
          <p className="mt-4 text-[#134687]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'super_admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-repeat overflow-x-hidden flex">
      <div className="max-w-7xl mx-auto w-full p-6 overflow-y-auto h-screen">
        {/* Header */}
        <div className="mb-8 mt-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="rounded-[45px] text-white text-lg lg:text-4xl font-poppins font-medium px-6 py-2 lg:py-4 text-center [background:linear-gradient(90deg,_#2F7EE3_0%,_#0349A2_100%)] w-fit mb-4">
                Super Admin Dashboard
              </div>
              <p className="text-black text-xs lg:text-lg font-Inter font-light leading-5">
                Manage user roles, EB permissions, and system administration for CSS Apply
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center px-6 py-3 border-2 border-[#005FD9] rounded-lg shadow-sm text-sm font-medium text-[#134687] bg-white hover:bg-[#F3F3FD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#044FAF] transition-all duration-200 w-full sm:w-auto"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-[#134687]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Go to Admin Page
              </button>
              <div className="flex items-center bg-white rounded-lg px-4 py-3 shadow-sm border-2 border-[#005FD9]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#044FAF] to-[#134687] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {session.user?.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-[#134687]">{session.user?.name}</p>
                  <p className="text-xs text-[#044FAF] font-medium">Super Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#044FAF] to-[#134687] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#134687]">Total Users</p>
                  <p className="text-2xl font-bold text-[#044FAF]">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#044FAF] to-[#134687] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#134687]">EB Members</p>
                  <p className="text-2xl font-bold text-[#044FAF]">{stats.totalEbMembers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#044FAF] to-[#134687] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#134687]">Admins</p>
                  <p className="text-2xl font-bold text-[#044FAF]">{stats.totalAdmins}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border-2 border-[#005FD9] p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#044FAF] to-[#134687] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#134687]">Total Applicants</p>
                  <p className="text-2xl font-bold text-[#044FAF]">{stats.totalApplicants}</p>
                </div>
              </div>
            </div>
          </div>
          
          {pendingChanges.length > 0 && (
            <div className="mt-6 bg-[#FFE7B4] border-l-4 border-[#FFBC2B] p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-[#CE9823]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-[#5B4515]">
                    You have <span className="font-medium">{pendingChanges.length} pending role change(s)</span>. 
                    Click &quot;Confirm Changes&quot; to save them.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {pendingChanges.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={confirmRoleChanges}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#044FAF] hover:bg-[#04387B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#044FAF] w-full sm:w-auto transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Confirm Changes ({pendingChanges.length})
            </button>
            <button
              onClick={cancelRoleChanges}
              className="inline-flex items-center justify-center px-4 py-2 border-2 border-[#005FD9] rounded-md shadow-sm text-sm font-medium text-[#134687] bg-white hover:bg-[#F3F3FD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#044FAF] w-full sm:w-auto transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel Changes
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[#134687]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, student number, or position..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-[#005FD9] rounded-md leading-5 bg-white placeholder-[#134687] focus:outline-none focus:placeholder-[#044FAF] focus:ring-1 focus:ring-[#044FAF] focus:border-[#044FAF]"
            />
          </div>
        </div>

        {/* Search Status */}
        {searchTerm.trim() && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {isSearching ? (
                'Searching...'
              ) : isGlobalSearch ? (
                `Found ${filteredUsers.length} result(s) for "${searchTerm}" across all users`
              ) : (
                `Showing ${filteredUsers.length} result(s) for "${searchTerm}" on current page`
              )}
            </p>
          </div>
        )}

        {/* Users List - Mobile Cards / Desktop Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg border-2 border-[#005FD9]">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto max-w-full">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gradient-to-r from-[#F3F3FD] to-[#E8F2FF]">
                <tr>
                  <th scope="col" className="w-1/5 px-3 py-4 text-left text-xs font-semibold text-[#134687] uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 hover:text-[#044FAF] transition-colors duration-200"
                    >
                      <span>User</span>
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-4 text-left text-xs font-semibold text-[#134687] uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center space-x-1 hover:text-[#044FAF] transition-colors duration-200"
                    >
                      <span>Current Role</span>
                      {getSortIcon('role')}
                    </button>
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-4 text-left text-xs font-semibold text-[#134687] uppercase tracking-wider">
                    New Role
                  </th>
                  <th scope="col" className="w-1/4 px-2 py-4 text-left text-xs font-semibold text-[#134687] uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('position')}
                      className="flex items-center space-x-1 hover:text-[#044FAF] transition-colors duration-200"
                    >
                      <span>EB Position</span>
                      {getSortIcon('position')}
                    </button>
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-4 text-left text-xs font-semibold text-[#134687] uppercase tracking-wider">
                    Committees
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-4 text-left text-xs font-semibold text-[#134687] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const pendingRole = getPendingRoleForUser(user.id)
                  const displayRole = pendingRole || user.role
                  
                  return (
                    <tr key={user.id} className="hover:bg-[#F3F3FD] transition-colors duration-200">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#044FAF] to-[#134687] flex items-center justify-center border-2 border-[#005FD9]">
                              <span className="text-white font-bold text-xs">
                                {user.name[0]?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-2 min-w-0 flex-1">
                            <div className="text-xs font-semibold text-[#134687] truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-[#134687] truncate">
                              {user.email}
                            </div>
                            {user.studentNumber && (
                              <div className="text-xs text-[#044FAF] font-medium">
                                {user.studentNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClass(user.role)}`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                        {pendingRole && (
                          <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-[#FFE7B4] text-[#5B4515] border border-[#FFBC2B]">
                            Changing...
                          </span>
                        )}
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <select
                          value={displayRole}
                          onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                          className="block w-full pl-1 pr-6 py-1 text-xs border-2 border-[#005FD9] focus:outline-none focus:ring-[#044FAF] focus:border-[#044FAF] rounded-md"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.ebProfile?.position ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#044FAF] to-[#134687] text-white border border-[#005FD9]">
                            {user.ebProfile.position}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] border border-[#005FD9]">
                            No Position
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-4 text-sm text-gray-900">
                        {user.ebProfile?.committees.length ? (
                          <div className="flex flex-wrap gap-1">
                            {user.ebProfile.committees.slice(0, 1).map(committee => (
                              <span key={committee} className="inline-flex items-center px-1 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-[#044FAF] to-[#134687] text-white border border-[#005FD9]">
                                {committee}
                              </span>
                            ))}
                            {user.ebProfile.committees.length > 1 && (
                              <span className="inline-flex items-center px-1 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] border border-[#005FD9]">
                                +{user.ebProfile.committees.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] border border-[#005FD9]">
                            No Committees
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          {user.ebProfile ? (
                            <>
                              <button
                                onClick={() => handleMakeEb(user)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#134687] bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] border border-[#005FD9] rounded hover:bg-gradient-to-r hover:from-[#044FAF] hover:to-[#134687] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#044FAF] transition-all duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveEb(user.id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#134687] bg-gradient-to-r from-[#FFE7B4] to-[#FFF3D6] border border-[#FFBC2B] rounded hover:bg-gradient-to-r hover:from-[#FFBC2B] hover:to-[#CE9823] hover:text-[#5B4515] focus:outline-none focus:ring-1 focus:ring-[#FFBC2B] transition-all duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleMakeEb(user)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-[#044FAF] to-[#134687] border border-[#005FD9] rounded hover:bg-gradient-to-r hover:from-[#04387B] hover:to-[#0f3a6b] focus:outline-none focus:ring-1 focus:ring-[#044FAF] transition-all duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Make EB
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const pendingRole = getPendingRoleForUser(user.id)
                const displayRole = pendingRole || user.role
                
                return (
                  <div key={user.id} className="p-4 hover:bg-[#F3F3FD] transition-colors duration-200">
                    <div className="flex flex-col space-y-3">
                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#044FAF] to-[#134687] flex items-center justify-center border-2 border-[#005FD9]">
                            <span className="text-white font-bold text-sm">
                              {user.name[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[#134687] truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-[#134687] truncate">
                            {user.email}
                          </div>
                          {user.studentNumber && (
                            <div className="text-xs text-[#044FAF] font-medium">
                              {user.studentNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Role Information */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#134687]">Current Role:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeClass(user.role)}`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                            {pendingRole && (
                              <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-[#FFE7B4] text-[#5B4515] border border-[#FFBC2B]">
                                Changing...
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#134687]">New Role:</span>
                          <select
                            value={displayRole}
                            onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                            className="block w-32 pl-1 pr-6 py-1 text-xs border-2 border-[#005FD9] focus:outline-none focus:ring-[#044FAF] focus:border-[#044FAF] rounded-md"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </div>
                      </div>

                      {/* EB Information */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#134687]">EB Position:</span>
                          {user.ebProfile?.position ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#044FAF] to-[#134687] text-white border border-[#005FD9]">
                              {user.ebProfile.position}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] border border-[#005FD9]">
                              No Position
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs font-medium text-[#134687]">Committees:</span>
                          {user.ebProfile?.committees.length ? (
                            <div className="flex flex-wrap gap-1">
                              {user.ebProfile.committees.slice(0, 3).map(committee => (
                                <span key={committee} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-[#044FAF] to-[#134687] text-white border border-[#005FD9]">
                                  {committee}
                                </span>
                              ))}
                              {user.ebProfile.committees.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] border border-[#005FD9]">
                                  +{user.ebProfile.committees.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] text-[#134687] border border-[#005FD9]">
                              No Committees
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 pt-2 border-t border-[#E8F2FF]">
                        <span className="text-xs font-medium text-[#134687]">Actions:</span>
                        <div className="flex flex-wrap gap-2">
                          {user.ebProfile ? (
                            <>
                              <button
                                onClick={() => handleMakeEb(user)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#134687] bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] border border-[#005FD9] rounded hover:bg-gradient-to-r hover:from-[#044FAF] hover:to-[#134687] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#044FAF] transition-all duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit EB
                              </button>
                              <button
                                onClick={() => handleRemoveEb(user.id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove EB
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleMakeEb(user)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#134687] bg-gradient-to-r from-[#E8F2FF] to-[#F3F3FD] border border-[#005FD9] rounded hover:bg-gradient-to-r hover:from-[#044FAF] hover:to-[#134687] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#044FAF] transition-all duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Make EB
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PAGINATION */}
          {filteredUsers.length > 0 && pagination.totalPages > 1 && !isGlobalSearch && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#FFFFFF] p-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} users
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

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border-2 border-[#005FD9]">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-[#044FAF] to-[#134687] mx-auto">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-[#134687]">
                  Confirm Role Changes
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-[#134687]">
                    You are about to change roles for {pendingChanges.length} user(s). Please review the changes below:
                  </p>
                </div>
                
                <div className="mt-4 max-h-60 overflow-y-auto border-t border-b border-[#E8F2FF] py-4">
                  {pendingChanges.map((change, index) => {
                    const user = users.find(u => u.id === change.userId)
                    return (
                      <div key={index} className="mb-3 p-3 bg-gradient-to-r from-[#F3F3FD] to-[#E8F2FF] rounded-md border border-[#005FD9]">
                        <div className="font-medium text-[#134687]">{user?.name}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeClass(change.oldRole)}`}>
                            {change.oldRole.replace('_', ' ').toUpperCase()}
                          </span>
                          <svg className="mx-2 h-4 w-4 text-[#134687]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeClass(change.newRole)}`}>
                            {change.newRole.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={confirmRoleChanges}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#044FAF] text-base font-medium text-white hover:bg-[#04387B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#044FAF] sm:col-start-2 sm:text-sm transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98"
                >
                  Confirm Changes
                </button>
                <button
                  type="button"
                  onClick={cancelRoleChanges}
                  className="mt-3 w-full inline-flex justify-center rounded-md border-2 border-[#005FD9] shadow-sm px-4 py-2 bg-white text-base font-medium text-[#134687] hover:bg-[#F3F3FD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#044FAF] sm:mt-0 sm:col-start-1 sm:text-sm transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EB Form Modal with Dropdowns */}
        {showEbForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedUser?.ebProfile ? 'Edit EB Profile' : 'Create EB Profile'}
              </h2>
              
              <form onSubmit={handleSubmitEbProfile} className="space-y-4">
                {/* Position Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                  <select
                    required
                    value={ebForm.position}
                    onChange={(e) => setEbForm({ ...ebForm, position: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select Position</option>
                    {EB_POSITIONS.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Committees Multi-Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Committees *</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                    {EB_COMMITTEES.map((committee) => (
                      <div key={committee} className="flex items-start mb-2">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id={`committee-${committee}`}
                            checked={ebForm.committees.includes(committee)}
                            onChange={(e) => {
                              const updatedCommittees = e.target.checked
                                ? [...ebForm.committees, committee]
                                : ebForm.committees.filter(c => c !== committee);
                              setEbForm({ ...ebForm, committees: updatedCommittees });
                            }}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`committee-${committee}`} className="font-medium text-gray-700">
                            {committee}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {ebForm.committees.length} committee(s)
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={ebForm.isActive}
                    onChange={(e) => setEbForm({ ...ebForm, isActive: e.target.checked })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active EB Member
                  </label>
                </div>

                {/* Selected Committees Preview */}
                {ebForm.committees.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Committees:</h4>
                    <div className="flex flex-wrap gap-1">
                      {ebForm.committees.map((committee) => (
                        <span
                          key={committee}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {committee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={!ebForm.position || ebForm.committees.length === 0}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedUser?.ebProfile ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEbForm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
