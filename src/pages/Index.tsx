
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { logout } from '@/store/authSlice';
import { getXlsxFileNames, parseFiltersFromFilenames } from "@/lib/getCsvFileNames";
import { parseXlsx } from "@/lib/parseXlsx";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { Cart } from "@/components/Cart";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username } = useSelector((state: RootState) => state.auth);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadFileNames = async () => {
      try {
        const names = await getXlsxFileNames();
        if (names.length === 0) {
          // If no files returned and we're still on this page, it means auth failed
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/auth');
            return;
          }
          throw new Error('Failed to load file list');
        }
        setFileNames(names);
        const { filterTypes: types } = parseFiltersFromFilenames(names);
        setFilterTypes(types);
      } catch (err) {
        console.error('Failed to load file names:', err);
        setError('Failed to load file list');
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load file list",
          variant: "destructive"
        });
      }
    };
    loadFileNames();
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  useEffect(() => {
    async function loadData() {
      if (!selectedFile) {
        setProducts([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await parseXlsx(selectedFile);
        if (data.length === 0) {
          setError('No products found in the selected file');
        }
        setProducts(data);
      } catch (error) {
        console.error('Failed to load product data:', error);
        setError('Failed to load product data');
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load product data",
          variant: "destructive"
        });
        setProducts([]);
        
        // Check if authentication error occurred
        if (error.message === 'Authentication required') {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedFile, navigate]);

  // Filter products by search query if present
  const filteredProducts = search ? products.filter((p) =>
    (p.Brand || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.ItemName || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.SKU || "").toLowerCase().includes(search.toLowerCase())
  ) : products;

  const renderFilterSidebar = () => (
    <FilterSidebar
      filterTypes={filterTypes}
      onSelect={(file) => {
        setSelectedFile(file);
        if (isMobile) {
          setSidebarOpen(false);
        }
      }}
      selectedFile={selectedFile}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <header className="w-full bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85%] sm:w-[350px] pt-10">
                    {renderFilterSidebar()}
                  </SheetContent>
                </Sheet>
              )}
              <img 
                src="https://alphacomm.com/wp-content/uploads/2021/05/alphacomm-logo.png" 
                alt="AlphaComm Logo" 
                className="h-10 sm:h-16 py-2"
              />
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
              <div className="hidden sm:block w-72">
                <input
                  className="rounded border border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Search by product, brand, or SKU"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Cart />
                <span className="hidden sm:inline text-sm text-gray-600">
                  Welcome, {username || "User"}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="sm:hidden py-2">
            <input
              className="rounded border border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        {!isMobile && (
          <div className="md:pt-8 pt-4 md:pr-8 md:pl-8 pl-2 pr-2 flex-none md:w-72 w-full">
            {renderFilterSidebar()}
          </div>
        )}
        <main className="flex-1 p-2 sm:p-4 md:pt-8 max-w-screen-xl mx-auto md:pr-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Marketplace</h1>
              <p className="text-gray-500 mt-2"></p>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>
          <ProductGrid products={filteredProducts} loading={loading} />
        </main>
      </div>
    </div>
  );
};

export default Index;
