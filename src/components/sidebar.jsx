import { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  FileText, 
  Folder, 
  Download, 
  Package, 
  LogIn,
  ChevronRight
} from 'lucide-react';

export default function App() {
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xs">
        {/* Sidebar murni — sesuai dengan sidebar.html */}
        <div className="custom-sidebar bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <MenuItem icon={Home} href="/" label="Home" />
          <MenuItem icon={FileText} href="/Document_Contract" label="Document Contract" />
          
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
                <MenuItem icon={Download} href="/Download_PDF" label="Download PDF Selesai" small active />
              </div>
            )}
          </div>
          
          <MenuItem icon={Package} href="/perlengkapan" label="Download Zip" />
          <MenuItem icon={FileText} href="/document_batal" label="PDF Batal" />
          <MenuItem icon={LogIn} href="/login" label="login Zip" />
        </div>
        
        {/* Penjelasan kecil (opsional, bisa dihapus) */}
        <p className="mt-4 text-sm text-gray-500">
          Ini adalah komponen <code>sidebar</code> terpisah, sesuai struktur dari <code>sidebar.html</code>.
        </p>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, href, label, small = false, active = false }) {
  return (
    <a
      href={href}
      target="_self"
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
    </a>
  );
}
