
import React from "react";
import { Menu } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface FilterSidebarDrawerProps {
  filterTypes: Record<string, { label: string; file: string; path: string[]; type: string }[]>;
  onSelect: (filename: string) => void;
  selectedFile: string | null;
}

const FilterSidebarDrawer: React.FC<FilterSidebarDrawerProps> = ({
  filterTypes,
  onSelect,
  selectedFile,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open filters</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <FilterSidebar 
            filterTypes={filterTypes} 
            onSelect={(file) => {
              onSelect(file);
              setOpen(false);
            }} 
            selectedFile={selectedFile} 
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterSidebarDrawer;
