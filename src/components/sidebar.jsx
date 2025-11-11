// src/components/Sidebar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Folder, 
  Download, 
  Package, 
  LogIn,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ children }) {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const submenuRef = useRef(null);

  // Tutup submenu saat klik di luar
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
      {/* Sidebar — full height & fixed */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-md border-r border-gray-200 z-50">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 mb-6">📁 Dashboard</h1>
          
          <nav className="space-y-1">
            <MenuItem icon={Home} href="/home" label="Home" />
            <MenuItem icon={FileText} href="/status_pensanan_ina" label="Document Contract" />
            
            {/* Submenu Daftar Project */}
            <div 
              className="menu-item has-submenu relative"
              ref={submenuRef}
            >
              <button
                className="w-full flex items-center justify-between p-3 text-left font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setSubmenuOpen(!submenuOpen)}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4" />
                  <span>Daftar Project</span>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    submenuOpen ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              {submenuOpen && (
                <div className="submenu ml-6 mt-1 space-y-1 bg-gray-50 py-2 border-l-2 border-gray-200">
                  <MenuItem icon={Download} href="/gabung_pdf" label="Gabung PDF" small />
                  <MenuItem icon={Download} href="/download_pdf" label="Download PDF Selesai" small active />
                </div>
              )}
            </div>
            
            <MenuItem icon={Package} href="/perlengkapan" label="Download Zip" />
            <MenuItem icon={FileText} href="/document_batal" label="PDF Batal" />
            <MenuItem icon={LogIn} href="/login" label="login Zip" />
          </nav>
        </div>
      </div>

      {/* Konten Utama — isi ruang sisa */}
      <div className="ml-64 flex-1 p-6">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, href, label, small = false, active = false }) {
  return (
    <Link
      to={href} // 👈 ganti href → to
      className={`flex items-center space-x-2 px-3 py-2.5 transition-colors ${
        small 
          ? 'text-sm pl-8' 
          : 'font-medium'
      } ${
        active
          ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className={`flex-shrink-0 ${small ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
      <span>{label}</span>
    </Link>
  );
}