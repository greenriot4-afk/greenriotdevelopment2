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
        <Button variant={variant} size={size}>
          <Share2 className="w-4 h-4 mr-1" />
          Compartir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir</DialogTitle>
          <DialogDescription>
            Comparte este {type === 'object' ? 'objeto' : 'mercadillo'} con tus contactos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Preview */}
          <div className="border rounded-lg p-3 bg-muted/50">
            <div className="font-medium text-sm mb-1">{title}</div>
            {description && (
              <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {description}
              </div>
            )}
            <div className="text-xs text-primary truncate">{shareUrl}</div>
          </div>

          {/* Copy Link */}
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-muted rounded text-sm truncate">
              {shareUrl}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Social Media Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={shareWhatsApp}
              className="justify-start"
            >
              <div className="w-4 h-4 mr-2 bg-green-500 rounded-sm"></div>
              WhatsApp
            </Button>
            
            <Button
              variant="outline"
              onClick={shareTelegram}
              className="justify-start"
            >
              <div className="w-4 h-4 mr-2 bg-blue-500 rounded-sm"></div>
              Telegram
            </Button>
            
            <Button
              variant="outline"
              onClick={shareTwitter}
              className="justify-start"
            >
              <div className="w-4 h-4 mr-2 bg-blue-400 rounded-sm"></div>
              Twitter
            </Button>
            
            <Button
              variant="outline"
              onClick={shareFacebook}
              className="justify-start"
            >
              <div className="w-4 h-4 mr-2 bg-blue-600 rounded-sm"></div>
              Facebook
            </Button>
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <Button
              variant="outline"
              onClick={handleNativeShare}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Más opciones
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareButton;