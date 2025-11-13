import { useState, useRef, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Folder, 
  Download, 
  Package, 
  LogIn,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const submenuRef = useRef(null);

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
            <MenuItem icon={Home} to="/home" label="Home" />
            <MenuItem icon={FileText} to="/status_pensanan_ina" label="Document Contract" />
            
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
                <motion.div
                  animate={{ rotate: submenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </motion.div>
              </button>
              
              {submenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="ml-6 mt-1 space-y-1">
                    <SubMenuItem icon={Download} to="/gabung_pdf" label="Gabung PDF" />
                    <SubMenuItem icon={Download} to="/download_pdf" label="Download PDF Selesai" />
                  </div>
                </motion.div>
              )}
            </div>
            
            <MenuItem icon={Package} to="/perlengkapan" label="Download Zip" />
            <MenuItem icon={FileText} to="/document_batal" label="PDF Batal" />
            <MenuItem icon={LogIn} to="/login" label="login Zip" />
          </nav>
        </div>
      </div>

      {/* Konten Utama — isi ruang sisa */}
      <div className="ml-64 flex-1 p-0 pl-6">
        <Outlet />
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, to, label }) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "#f3f4f6" }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={to}
        className="flex items-center space-x-2 px-3 py-2.5 font-medium text-gray-700 transition-colors rounded-lg"
        style={{ display: 'block' }}
      >
        <Icon className="flex-shrink-0 w-4 h-4" />
        <span>{label}</span>
      </Link>
    </motion.div>
  );
}

function SubMenuItem({ icon: Icon, to, label }) {
  return (
    <motion.div
      initial={{ backgroundColor: "transparent" }}
      whileHover={{ backgroundColor: "#fef7ed" }}
      whileTap={{ scale: 0.98 }}
      className="rounded-lg"
    >
      <Link
        to={to}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 transition-colors"
        style={{ display: 'block' }}
      >
        <motion.div
          initial={{ backgroundColor: "#f3f4f6" }}
          whileHover={{ backgroundColor: "#ffedd5" }}
          whileTap={{ backgroundColor: "#fed7aa" }}
          className="p-1 rounded"
          transition={{ duration: 0.2 }}
        >
          <Icon className="flex-shrink-0 w-3.5 h-3.5" />
        </motion.div>
        <motion.span
          initial={{ color: "#374151" }}
          whileHover={{ color: "#ea580c" }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </Link>
    </motion.div>
  );
}