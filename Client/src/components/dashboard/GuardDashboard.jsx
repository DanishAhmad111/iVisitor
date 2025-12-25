import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import { visitorService } from '../../services/api';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

export default function GuardDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [verifying, setVerifying] = useState(false);
  
  // Search, sort, filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'visitorName', direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);
  
  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const fetchVisitors = async () => {
    setRefreshing(true);
    try {
      const data = await visitorService.getAll();
      setVisitors(data);
    } catch (err) {
      toast.error('Error fetching visitors');
      console.error('Error fetching visitors:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerifyCode = async (visitorId) => {
    // Validate code format
    if (!verificationCode) {
      toast.error('Please enter verification code');
      return;
    }

    if (verificationCode.length !== 4) {
      toast.error('Verification code must be 4 digits');
      return;
    }

    if (!/^\d+$/.test(verificationCode)) {
      toast.error('Verification code must contain only numbers');
      return;
    }

    setVerifying(true);
    try {
      await visitorService.verifyVisitor(visitorId, verificationCode);
      toast.success('Visitor verified successfully!');
      setVerificationCode('');
      setSelectedVisitor(null);
      fetchVisitors();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Invalid verification code';
      toast.error(errorMessage);
      // Clear code on error for security
      setVerificationCode('');
    } finally {
      setVerifying(false);
    }
  };

  const handleVisitorExit = async (visitorId) => {
    try {
      await visitorService.markExit(visitorId);
      toast.success('Visitor exit recorded successfully!');
      fetchVisitors();
    } catch (err) {
      toast.error('Error recording visitor exit');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Sort function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Filter and search function
  const filteredAndSearchedVisitors = useMemo(() => {
    let result = [...visitors];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'inside') {
        result = result.filter(visitor => visitor.inTime && !visitor.outTime);
      } else if (statusFilter === 'completed') {
        result = result.filter(visitor => visitor.outTime);
      } else {
        result = result.filter(visitor => visitor.status === statusFilter);
      }
    }
    
    // Apply date filter
    if (dateFilter.from) {
      const fromDate = new Date(dateFilter.from);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(visitor => {
        const visitDate = visitor.inDate ? new Date(visitor.inDate) : null;
        return visitDate && visitDate >= fromDate;
      });
    }
    
    if (dateFilter.to) {
      const toDate = new Date(dateFilter.to);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(visitor => {
        const visitDate = visitor.inDate ? new Date(visitor.inDate) : null;
        return visitDate && visitDate <= toDate;
      });
    }
    
    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        visitor =>
          visitor.visitorName?.toLowerCase().includes(lowercasedSearch) ||
          visitor.visitorEmail?.toLowerCase().includes(lowercasedSearch) ||
          visitor.residentName?.toLowerCase().includes(lowercasedSearch) ||
          visitor.residentEmail?.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle special case for date sorting
        if (sortConfig.key === 'inDate' || sortConfig.key === 'outDate') {
          const aValue = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
          const bValue = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
          
          if (sortConfig.direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        }
        
        // Handle normal string/number sorting
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [visitors, searchTerm, sortConfig, statusFilter, dateFilter]);
  
  // Pagination
  const totalPages = Math.ceil(filteredAndSearchedVisitors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSearchedVisitors.slice(indexOfFirstItem, indexOfLastItem);
  
  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter({ from: '', to: '' });
    setSortConfig({ key: 'visitorName', direction: 'asc' });
    setCurrentPage(1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guard Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage visitor entries and exits</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <button 
              onClick={fetchVisitors} 
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={refreshing}
            >
              <ArrowPathIcon className={`-ml-0.5 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search visitors or residents..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            {/* Status Filter Dropdown */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="inside">Currently Inside</option>
                <option value="completed">Visit Completed</option>
              </select>
            </div>
            
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              {showFilters ? 'Hide Filters' : 'More Filters'}
            </button>
            
            {/* Reset Filters */}
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear All
            </button>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Date Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-from" className="block text-sm font-medium text-gray-700">From</label>
                  <input
                    type="date"
                    id="date-from"
                    value={dateFilter.from}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="block text-sm font-medium text-gray-700">To</label>
                  <input
                    type="date"
                    id="date-to"
                    value={dateFilter.to}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredAndSearchedVisitors.length)}
            </span>{' '}
            of <span className="font-medium">{filteredAndSearchedVisitors.length}</span> results
          </p>
          
          <div className="flex items-center">
            <label htmlFor="items-per-page" className="mr-2 text-sm text-gray-700">Show</label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="block w-20 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        <div className="mt-5">
          <div className="overflow-x-auto shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                    onClick={() => requestSort('visitorName')}
                  >
                    <div className="flex items-center">
                      Visitor
                      {sortConfig.key === 'visitorName' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUpIcon className="h-4 w-4 ml-1" /> 
                          : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => requestSort('residentName')}
                  >
                    <div className="flex items-center">
                      Resident
                      {sortConfig.key === 'residentName' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUpIcon className="h-4 w-4 ml-1" /> 
                          : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => requestSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === 'status' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUpIcon className="h-4 w-4 ml-1" /> 
                          : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => requestSort('inDate')}
                  >
                    <div className="flex items-center">
                      Visit Date
                      {sortConfig.key === 'inDate' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUpIcon className="h-4 w-4 ml-1" /> 
                          : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((visitor) => (
                    
                  <tr key={visitor.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">{visitor.visitorName}</div>
                      <div className="text-gray-500">{visitor.visitorEmail}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{visitor.residentName}</div>
                      <div className="text-gray-500">{visitor.residentEmail}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(visitor.status)}`}>
                        {visitor.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {visitor.inTime ? (
                        <div className="space-y-2">
                          <div className="flex flex-row items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">In</span>
                            <div>
                              <span className="font-medium">{moment(visitor.inDate).format('DD MMM YYYY')}</span>
                              {/* <span className="ml-2 text-sm text-gray-500">
                                
                                --
                              </span> */}
                            </div>
                          </div>
                          {visitor.outTime && (
                            <div className="flex flex-row items-center gap-2">
                              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Out</span>
                              <div>
                                <span className="font-medium">{moment(visitor.outDate).format('DD MMM YYYY')}</span>
                                {/* <span className="ml-2 text-sm text-gray-500">
                                  --
                                </span> */}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not arrived</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        {/* Show verify button for approved visitors who haven't arrived */}
                        {visitor.status === 'approved' && !visitor.inTime && (
                          <div className="flex items-center space-x-2">
                            {selectedVisitor === visitor.id ? (
                              <>
                                <input
                                  type="text"
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value.slice(0, 4))}
                                  placeholder="4 digits"
                                  maxLength={4}
                                  pattern="\d*"
                                  inputMode="numeric"
                                  autoFocus
                                  className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center font-mono text-lg"
                                />
                                <button
                                  onClick={() => handleVerifyCode(visitor.id)}
                                  disabled={verifying}
                                  className="inline-flex items-center rounded border border-transparent bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                  {verifying ? 'Verifying...' : 'Verify'}
                                </button>
                                <button
                                  onClick={() => setSelectedVisitor(null)}
                                  className="inline-flex items-center rounded border border-transparent bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setSelectedVisitor(visitor.id)}
                                className="inline-flex items-center rounded border border-transparent bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              >
                                Enter Code
                              </button>
                            )}
                          </div>
                        )}

                        {/* Show mark exit button for visitors who are inside */}
                        {visitor.inTime && !visitor.outTime && (
                          <button
                            onClick={() => handleVisitorExit(visitor.id)}
                            className="inline-flex items-center rounded border border-transparent bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Mark Exit
                          </button>
                        )}

                        {/* Show status for other cases */}
                        {(!visitor.status || visitor.status === 'pending') && (
                          <span className="text-yellow-600">Pending Approval</span>
                        )}
                        {visitor.status === 'rejected' && (
                          <span className="text-red-600">Rejected</span>
                        )}
                        {visitor.outTime && (
                          <span className="text-green-600">Visit Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                      {filteredAndSearchedVisitors.length === 0 ? (
                        searchTerm || statusFilter !== 'all' || dateFilter.from || dateFilter.to ? (
                          <div>
                            <p className="font-medium text-gray-900 mb-1">No visitors match your filters</p>
                            <p>Try adjusting your search or filter criteria</p>
                            <button
                              onClick={resetFilters}
                              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Clear all filters
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-gray-900 mb-1">No visitors found</p>
                            <p>There are no visitor records in the system</p>
                          </div>
                        )
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900 mb-1">No visitors found</p>
                          <p>There are no visitor records in the system</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredAndSearchedVisitors.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredAndSearchedVisitors.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredAndSearchedVisitors.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="sr-only">First page</span>
                      <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNumber;
                      
                      // Calculate which page numbers to show
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pageNumber
                              ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="sr-only">Last page</span>
                      <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
