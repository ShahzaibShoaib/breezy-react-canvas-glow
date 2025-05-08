
import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  className?: string;
}

const PlaceholderImage = ({ className }: PlaceholderImageProps = {}) => (
  <div className={cn("w-full bg-gray-200 rounded flex items-center justify-center text-gray-400 text-3xl", className)}>
    <span>🛒</span>
  </div>
);

export default PlaceholderImage;
