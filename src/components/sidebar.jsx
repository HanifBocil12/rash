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
  Menu, // Tambahkan ikon menu untuk mobile
  X // Tambahkan ikon X untuk close button
} from 'lucide-react';

export default function Sidebar() {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State untuk sidebar utama
  const [isMobile, setIsMobile] = useState(false); // State untuk mendeteksi mobile
  const submenuRef = useRef(null);
  const sidebarRef = useRef(null); // Ref untuk sidebar
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const encodedId = user?.ui_id || "";

  // Fungsi untuk mendeteksi ukuran layar
  const checkIsMobile = () => {
    return window.innerWidth < 768; // Misalnya, < 768px dianggap mobile
  };

  // useEffect untuk mendeteksi ukuran layar awal dan perubahan
  useEffect(() => {
    setIsMobile(checkIsMobile());

    const handleResize = () => {
      const mobile = checkIsMobile();
      setIsMobile(mobile);
      // Jika berpindah ke desktop, pastikan sidebar terbuka dan tidak collapsible
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        // Jika berpindah ke mobile, tutup sidebar
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // useEffect untuk submenu seperti sebelumnya
  useEffect(() => {
    if (location.pathname.includes('/gabung_pdf') || location.pathname.includes('/download_pdf')) {
      setSubmenuOpen(true);
    } else {
      // Optional: tutup submenu jika pindah ke halaman lain (kecuali submenu aktif)
      // Misalnya, tutup saat pindah dari submenu ke halaman lain
      if (!location.pathname.includes('/gabung_pdf') && !location.pathname.includes('/download_pdf')) {
         // Biarkan saja, jangan ubah state submenuOpen di sini kecuali kamu ingin menutupnya
         // Jika ingin menutup otomatis, uncomment baris berikut:
         // setSubmenuOpen(false);
      }
    }
  }, [location.pathname]);

  // useEffect untuk klik di luar sidebar (mobile) dan submenu (desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Tutup submenu jika klik di luar
      if (submenuRef.current && !submenuRef.current.contains(event.target) && !event.target.closest('.has-submenu')) {
        setSubmenuOpen(false);
      }
      // Tutup sidebar jika klik di luar sidebar (hanya di mobile)
      if (isMobile && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]); // Tambahkan isMobile sebagai dependency


  // Fungsi toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Overlay untuk mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar} // Klik overlay untuk menutup sidebar
        ></div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full bg-white shadow-md border-r border-gray-200 z-50 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64' // Gunakan w-64 atau lebar penuh untuk mobile
        } lg:w-64`} // Pastikan lg:w-64 untuk desktop
      >
        {/* Header Sidebar dengan tombol toggle untuk mobile */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">📁 Dashboard</h1>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="mobile-menu-button text-gray-500 hover:text-gray-700 lg:hidden" // Tambahkan class untuk deteksi klik
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem-1px)]"> {/* 4rem dari header, 1px border */}
          <MenuItem icon={Home} to={`/${encodedId}/home`} label="Home" sidebarOpen={sidebarOpen} />
          <MenuItem icon={FileText} to={`/${encodedId}/status_pensanan_ina`} label="Document Contract" sidebarOpen={sidebarOpen} />

          <div className="menu-item has-submenu relative" ref={submenuRef}>
            <button
              className="w-full flex items-center justify-between p-3 text-left font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setSubmenuOpen(!submenuOpen)}
            >
              <div className="flex items-center space-x-2">
                <Folder className={`w-4 h-4 ${sidebarOpen ? '' : 'mx-auto'}`} /> {/* Pusatkan ikon jika sidebar tertutup */}
                {sidebarOpen && <span>Daftar Project</span>} {/* Tampilkan teks hanya jika sidebar terbuka */}
              </div>
              {sidebarOpen && ( // Hanya tampilkan panah jika sidebar terbuka
                <ChevronRight
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    submenuOpen ? 'rotate-90' : ''
                  }`}
                />
              )}
            </button>

            {sidebarOpen && submenuOpen && ( // Tampilkan submenu hanya jika sidebar dan submenu terbuka
              <div className="ml-6 mt-1 space-y-1 py-2">
                <SubMenuItem
                  icon={Download}
                  to={`/${encodedId}/gabung_pdf`}
                  label="Gabung PDF"
                  isActive={location.pathname.includes('/gabung_pdf')}
                  sidebarOpen={sidebarOpen}
                />
                <SubMenuItem
                  icon={Download}
                  to={`/${encodedId}/download_pdf`}
                  label="Download PDF Selesai"
                  isActive={location.pathname.includes('/download_pdf')}
                  sidebarOpen={sidebarOpen}
                />
              </div>
            )}
          </div>

          <MenuItem icon={Package} to={`/${encodedId}/perlengkapan`} label="Download Zip" sidebarOpen={sidebarOpen} />
          <MenuItem icon={FileText} to={`/${encodedId}/document_batal`} label="PDF Batal" sidebarOpen={sidebarOpen} />
          <MenuItem icon={LogIn} to="/" label="Logout" sidebarOpen={sidebarOpen} />
        </nav>
      </div>

      {/* Tombol Toggle untuk Mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md text-gray-700 lg:hidden" // Tampilkan hanya di mobile
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {/* Konten Utama */}
      <div className={`flex-1 p-0 transition-all duration-300 ${isMobile ? 'pl-4 pr-4' : 'pl-6'}`}>
        {/* Tambahkan margin left hanya jika sidebar desktop terbuka, tidak berlaku untuk mobile karena sidebar overlay */}
        <div className={`pt-0 ${!isMobile && sidebarOpen ? 'ml-64' : ''} ${isMobile ? 'mt-16' : ''}`}> {/* Tambahkan margin top di mobile saat tombol toggle muncul */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// Modifikasi MenuItem untuk menerima sidebarOpen
function MenuItem({ icon: Icon, to, label, sidebarOpen }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 px-3 py-2.5 font-medium text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
    >
      <Icon className={`w-4 h-4 ${sidebarOpen ? '' : 'mx-auto'}`} /> {/* Pusatkan ikon jika sidebar tertutup */}
      {sidebarOpen && <span>{label}</span>} {/* Tampilkan teks hanya jika sidebar terbuka */}
    </Link>
  );
}

// Modifikasi SubMenuItem untuk menerima sidebarOpen
function SubMenuItem({ icon: Icon, to, label, isActive, sidebarOpen }) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-lg ${
        isActive
          ? 'bg-orange-100 text-orange-700 font-medium border-r-2 border-orange-500'
          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-600' : ''} ${sidebarOpen ? '' : 'mx-auto'}`} /> {/* Pusatkan ikon jika sidebar tertutup */}
      {sidebarOpen && <span>{label}</span>} {/* Tampilkan teks hanya jika sidebar terbuka */}
    </Link>
  );
}