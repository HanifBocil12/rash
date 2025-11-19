import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Folder, 
  Download, 
  Package, 
  LogIn,
  ChevronRight,
  Menu as MenuIcon,
  X as XIcon
} from 'lucide-react';

export default function Sidebar() {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const submenuRef = useRef(null);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const encodedId = user?.ui_id || "";

  useEffect(() => {
    if (location.pathname.includes('/gabung_pdf') || location.pathname.includes('/download_pdf')) {
      setSubmenuOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Hamburger button mobile */}
      <button 
        className={`
          sm:hidden fixed top-4 z-50 p-2 bg-white rounded-md shadow-md transition-all
          ${mobileOpen ? 'left-64 ml-[-2.5rem]' : 'left-4'}
        `}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-md border-r border-gray-200 z-50
        transform transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:translate-x-0 sm:block
      `}>
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 mb-6">📁 Dashboard</h1>
          
          <nav className="space-y-1">
            <MenuItem icon={Home} to={`/${encodedId}/home`} label="Home" />
            <MenuItem icon={FileText} to={`/${encodedId}/status_pensanan_ina`} label="Document Contract" />
            
            <div className="menu-item has-submenu relative" ref={submenuRef}>
              <button
                className="w-full flex items-center justify-between p-3 text-left font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setSubmenuOpen(!submenuOpen)}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4" />
                  <span>Daftar Project</span>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${submenuOpen ? 'rotate-90' : ''}`} 
                />
              </button>
              
              {submenuOpen && (
                <div className="ml-6 mt-1 space-y-1 py-2">
                  <SubMenuItem 
                    icon={Download} 
                    to={`/${encodedId}/gabung_pdf`} 
                    label="Gabung PDF" 
                    isActive={location.pathname.includes('/gabung_pdf')}
                  />
                  <SubMenuItem 
                    icon={Download} 
                    to={`/${encodedId}/download_pdf`} 
                    label="Download PDF Selesai" 
                    isActive={location.pathname.includes('/download_pdf')}
                  />
                </div>
              )}
            </div>
            
            <MenuItem icon={Package} to={`/${encodedId}/perlengkapan`} label="Download Zip" />
            <MenuItem icon={FileText} to={`/${encodedId}/document_batal`} label="PDF Batal" />
            <MenuItem icon={LogIn} to="/" label="Logout" />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-0 pl-0 sm:pl-64">
        <Outlet />
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, to, label }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 px-3 py-2.5 font-medium text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}

function SubMenuItem({ icon: Icon, to, label, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-lg ${
        isActive 
          ? 'bg-orange-100 text-orange-700 font-medium border-r-2 border-orange-500' 
          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-600' : ''}`} />
      <span>{label}</span>
    </Link>
  );
}
