import React from 'react';
import { AlertTriangle, Key, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface TokenErrorBannerProps {
  onSetToken?: (token: string) => void;
}

export const TokenErrorBanner: React.FC<TokenErrorBannerProps> = ({ onSetToken }) => {
  const [tokenInput, setTokenInput] = React.useState('');
  const [showInput, setShowInput] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim() && onSetToken) {
      onSetToken(tokenInput.trim());
    }
  };

  return (
    <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-amber-200 backdrop-blur-md mb-4 shadow-xl">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          <h4 className="font-semibold text-amber-300 text-sm">Mapbox Token Configuration Required</h4>
          <p className="mt-1 leading-relaxed text-amber-200/80">
            Mapbox GL JS requires a valid public access token (`VITE_MAPBOX_TOKEN`) to render satellite vector tiles and interactive polygon drawing controls.
          </p>

          {showInput ? (
            <form onSubmit={handleSubmit} className="mt-3 flex items-center space-x-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="pk.eyJ1Ijo..."
                className="bg-[#070C0A] border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-white w-72 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Button type="submit" size="sm" variant="primary" className="bg-amber-600 hover:bg-amber-500">
                Apply Token
              </Button>
            </form>
          ) : (
            <div className="mt-3 flex items-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowInput(true)}
                icon={<Key className="w-3.5 h-3.5" />}
                className="text-amber-300 border-amber-500/50 hover:bg-amber-950/40 text-xs"
              >
                Enter Token Manually
              </Button>
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
              >
                <span>Get Free Mapbox Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
