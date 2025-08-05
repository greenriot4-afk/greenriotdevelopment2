import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  type: 'object' | 'market';
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const ShareButton = ({ 
  type, 
  id, 
  title, 
  description, 
  imageUrl,
  variant = 'outline',
  size = 'sm'
}: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/shared/${type}/${id}`;
  
  const shareText = description 
    ? `${title}\n\n${description}\n\n`
    : `${title}\n\n`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}${shareUrl}`);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const shareWhatsApp = () => {
    const encodedText = encodeURIComponent(`${shareText}${shareUrl}`);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareTelegram = () => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    window.open(telegramUrl, '_blank');
  };

  const shareTwitter = () => {
    const encodedText = encodeURIComponent(`${shareText}${shareUrl}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(twitterUrl, '_blank');
  };

  const shareFacebook = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(facebookUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="w-4 h-4 mr-1" />
          Compartir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Compartir</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Comparte este {type === 'object' ? 'objeto' : 'mercadillo'} con tus contactos
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview Card */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="space-y-2">
              <h4 className="font-medium text-sm leading-tight">{title}</h4>
              {description && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {description}
                </p>
              )}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-primary font-mono break-all">{shareUrl}</p>
              </div>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-md font-mono"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard();
                }}
                className="shrink-0 px-3"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-foreground">Compartir en redes sociales</h5>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  shareWhatsApp();
                }}
                className="justify-start h-12 px-4"
              >
                <div className="w-5 h-5 mr-3 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-medium">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  shareTelegram();
                }}
                className="justify-start h-12 px-4"
              >
                <div className="w-5 h-5 mr-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Telegram</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  shareTwitter();
                }}
                className="justify-start h-12 px-4"
              >
                <div className="w-5 h-5 mr-3 bg-blue-400 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  shareFacebook();
                }}
                className="justify-start h-12 px-4"
              >
                <div className="w-5 h-5 mr-3 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Facebook</span>
              </Button>
            </div>
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNativeShare();
                }}
                className="w-full h-11"
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span className="font-medium">Más opciones</span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareButton;