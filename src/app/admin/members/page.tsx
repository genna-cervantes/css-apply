import MobileSidebar from '@/components/AdminMobileSB'; 
import SidebarContent from '@/components/AdminSidebar'; 

const Members = () => {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f6f6fe" }}>

      {/* Sidebar Navigation */}
      <MobileSidebar>
        <SidebarContent activePage="members"/>
      </MobileSidebar>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 pt-16 md:pt-12">
        {/* PAGE HEADER */}
        <div className="mb-8 mt-12 md:mt-8 text-center md:text-left">
          <h1 
            className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-2 flex items-center justify-center md:justify-start"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            Members
          </h1>
          <p className="text-sm md:text-base text-gray-600 italic mb-6 md:mb-6">
            View and manage all members of your organization in one place.
          </p>
          <hr className="border-gray-300" />
        </div>

        {/* MAIN SHAPE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-280px)]">
          {/* MAIN LOGIC HERE */}
        </div>
      </div>
    </div>
  );
};

export default Members;