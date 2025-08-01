import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Trash2, Edit } from 'lucide-react';
import { useUserComments } from '@/hooks/useUserComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserCommentsProps {
  targetUserId: string;
}

export const UserComments = ({ targetUserId }: UserCommentsProps) => {
  const { user } = useAuth();
  const { comments, loading, submitting, addComment, deleteComment, getUserComment } = useUserComments(targetUserId);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const userComment = getUserComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    if (userComment) {
      setNewComment(userComment.content);
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    if (userComment && window.confirm('¿Estás seguro de que quieres eliminar tu comentario?')) {
      await deleteComment(userComment.id);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle size={20} />
            Comentarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle size={20} />
          Comentarios ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form to add/edit comment */}
        {user && user.id !== targetUserId && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={userComment ? "Editar tu comentario..." : "Escribe un comentario..."}
              className="min-h-[100px]"
              disabled={submitting}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || submitting}
                size="sm"
              >
                <Send size={16} className="mr-1" />
                {userComment ? 'Actualizar' : 'Comentar'}
              </Button>
              
              {userComment && !isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleEdit}
                  size="sm"
                >
                  <Edit size={16} className="mr-1" />
                  Editar
                </Button>
              )}
              
              {userComment && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  size="sm"
                >
                  <Trash2 size={16} className="mr-1" />
                  Eliminar
                </Button>
              )}
              
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setNewComment('');
                  }}
                  size="sm"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Comments list */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay comentarios aún
            </p>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className="border rounded-lg p-3 bg-muted/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-sm">
                      {comment.display_name || 'Usuario'}
                    </span>
                    {comment.username && (
                      <span className="text-muted-foreground text-xs ml-1">
                        @{comment.username}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};