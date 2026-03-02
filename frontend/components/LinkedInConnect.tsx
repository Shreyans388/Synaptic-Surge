import { useState } from 'react';
import {useAuthStore} from '@/state/auth.store'; 
// Assuming you have a brand store to know which brand is active
import {useBrandStore} from '@/state/brand.store'; 

export default function LinkedInConnect() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore(); 
  const { activeBrand } = useBrandStore(); // Get the currently selected brand

  const handleConnect = async () => {
    if (!user?._id || !activeBrand?._id) {
      alert("Please select a brand first.");
      return;
    }

    try {
      setLoading(true);
      // Pass both IDs to your backend
      const response = await fetch(`/api/auth/linkedin/url?userId=${user._id}&brandId=${activeBrand._id}`);
      const data = await response.json();
      
      // Redirect to LinkedIn
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to initiate LinkedIn login', error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleConnect} 
      disabled={loading}
      className="flex items-center gap-2 bg-[#0A66C2] text-white px-4 py-2 rounded-md hover:bg-[#004182] transition-colors disabled:opacity-50"
    >
      {loading ? 'Connecting...' : 'Connect LinkedIn'}
    </button>
  );
}