-- Create table for user likes/dislikes
CREATE TABLE public.user_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- quien da el like
  target_user_id UUID NOT NULL, -- quien recibe el like
  like_type TEXT NOT NULL CHECK (like_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Un usuario solo puede dar un like/dislike por semana a otro usuario
  CONSTRAINT unique_user_like_per_week UNIQUE (user_id, target_user_id, date_trunc('week', created_at))
);

-- Create table for user comments
CREATE TABLE public.user_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- quien hace el comentario
  target_user_id UUID NOT NULL, -- en cuyo perfil se hace el comentario
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Un usuario solo puede dejar un comentario a otro usuario
  CONSTRAINT unique_user_comment UNIQUE (user_id, target_user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_likes
CREATE POLICY "Everyone can view likes" 
ON public.user_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create likes" 
ON public.user_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own likes" 
ON public.user_likes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.user_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for user_comments
CREATE POLICY "Everyone can view comments" 
ON public.user_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.user_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.user_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.user_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_likes_updated_at
  BEFORE UPDATE ON public.user_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_comments_updated_at
  BEFORE UPDATE ON public.user_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_likes_target_user ON public.user_likes(target_user_id);
CREATE INDEX idx_user_likes_user_target ON public.user_likes(user_id, target_user_id);
CREATE INDEX idx_user_comments_target_user ON public.user_comments(target_user_id);
CREATE INDEX idx_user_comments_user_target ON public.user_comments(user_id, target_user_id);