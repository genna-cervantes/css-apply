'use client'

import { useState, useEffect } from 'react'
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
  'Academics Committee',
  'Community Development Committee',
  'Creatives and Technical Committee',
  'Documentation Committee',
  'External Affairs Committee',
  'Finance Committee',
  'Logistics Committee',
  'Publicity Committee',
  'Sports & Talent Committee',
  'Technology Development Committee'
] as const;

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  // REF: search params instead of state so mag ppersist ung search/filter term
  const [searchTerm, setSearchTerm] = useState('')
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
  const { data: session, status } = useSession()
  const router = useRouter()

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
  }, [status, session, router])

  // REF: doesnt need a useEffect
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ebProfile?.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/all')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        console.error('Failed to fetch users:', response.status)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'eb':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'super_admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                EB Management Dashboard
              </h1>
              <p className="text-gray-600">
                Manage user roles and EB permissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Go to Admin Page
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 font-semibold">
                    {session.user?.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
          
          {pendingChanges.length > 0 && (
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You have <span className="font-medium">{pendingChanges.length} pending role change(s)</span>. 
                    Click "Confirm Changes" to save them.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {pendingChanges.length > 0 && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={confirmRoleChanges}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Confirm Changes ({pendingChanges.length})
            </button>
            <button
              onClick={cancelRoleChanges}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, student number, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EB Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Committees
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const pendingRole = getPendingRoleForUser(user.id)
                  const displayRole = pendingRole || user.role
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-800 font-semibold">
                                {user.name[0]?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            {user.studentNumber && (
                              <div className="text-sm text-gray-500">
                                {user.studentNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                        {pendingRole && (
                          <span className="ml-2 text-xs text-indigo-600">
                            (Changing...)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={displayRole}
                          onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.ebProfile?.position ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {user.ebProfile.position}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.ebProfile?.committees.length ? (
                          <div className="flex flex-wrap gap-1">
                            {user.ebProfile.committees.slice(0, 2).map(committee => (
                              <span key={committee} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {committee}
                              </span>
                            ))}
                            {user.ebProfile.committees.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{user.ebProfile.committees.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {user.ebProfile ? (
                          <>
                            <button
                              onClick={() => handleMakeEb(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit EB
                            </button>
                            <button
                              onClick={() => handleRemoveEb(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove EB
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleMakeEb(user)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Make EB
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mx-auto">
                <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Confirm Role Changes
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You are about to change roles for {pendingChanges.length} user(s). Please review the changes below:
                  </p>
                </div>
                
                <div className="mt-4 max-h-60 overflow-y-auto border-t border-b border-gray-200 py-4">
                  {pendingChanges.map((change, index) => {
                    const user = users.find(u => u.id === change.userId)
                    return (
                      <div key={index} className="mb-3 p-3 bg-gray-50 rounded-md">
                        <div className="font-medium text-gray-900">{user?.name}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(change.oldRole)}`}>
                            {change.oldRole}
                          </span>
                          <svg className="mx-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(change.newRole)}`}>
                            {change.newRole}
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  Confirm Changes
                </button>
                <button
                  type="button"
                  onClick={cancelRoleChanges}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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