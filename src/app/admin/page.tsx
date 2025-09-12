import MobileSidebar from '@/components/AdminMobileSB'; 
import SidebarContent from '@/components/AdminSidebar'; 

const Schedule = () => {
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
            Welcome, {'{replace with name}'} 👋
          </h1>
          <p className="text-sm md:text-base text-gray-600 italic mb-6 md:mb-6">
            Stay organized and guide applicants through their journey.
          </p>
          <hr className="border-gray-300" />
        </div>

        {/* MAIN SHAPE */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]"
          // REF: why the style prop, pwede toh tailwind lng
          style={{ minHeight: 'calc(100vh - 280px)' }}
        >
          {/* schedule header */}
          <div className="flex items-center justify-center md:justify-start mb-6 space-x-2">
            {/* schedule icon */}
            {/* REF: not really readable, import nlng ng icon library instead */}
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="w-5 h-5 md:w-6 md:h-6 text-gray-700"
            >
              <path 
                fillRule="evenodd"
                d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
                clipRule="evenodd" 
              />
            </svg>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Your Schedule
            </h2>
          </div>

          {/* INNER SHAPE */}
          <div 
            className="bg-gray-50 rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center"
            style={{ minHeight: 'calc(100vh - 380px)' }}
          >
            {/* big calendar icon */}
            <div className="w-20 h-20 md:w-24 md:h-24 mb-6">
              <svg 
                viewBox="0 0 24 24" 
                fill="none"
                stroke="currentColor" 
                strokeWidth="2"
                className="w-full h-full text-gray-400"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <line x1="12" y1="14" x2="12" y2="18"></line>
                <line x1="10" y1="16" x2="14" y2="16"></line>
              </svg>
            </div>

            <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-3">
              No Schedule Found
            </h3>
            <p className="text-sm md:text-base text-gray-500 text-center mb-8 max-w-md">
              Click the button below to add your availability and start scheduling interviews.
            </p>

            <button className="text-xs md:text-sm font-medium py-2 md:py-3 px-8 md:px-10 rounded-full bg-[#134687] text-white hover:bg-[#0f3a6b] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md">
              Add Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;