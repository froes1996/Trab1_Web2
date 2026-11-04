import type { PrismaClient } from '@prisma/client';
import { PostNotFoundError, ValidationError } from '../shared/errors.js';

export class CommentController {
  constructor(private readonly prisma: PrismaClient) {}

  async create(authorId: number, postId: number, content: string) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new ValidationError('"content" é obrigatório');
    }
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new PostNotFoundError(postId);

    return this.prisma.comment.create({
      data: { content, authorId, postId },
      include: { author: true },
    });
  }

  async listByPost(postId: number) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: true,
        likes: true, 
        _count: { select: { likes: true } }
      },
      // Atende ao requisito 9: "Ordenar comentários por mais curtidos (em vez de só por data)"
      orderBy: [
        { likes: { _count: 'desc' } },
        { createdAt: 'asc' }
      ]
    });
  }

  async remove(id: number) {
    await this.prisma.comment.delete({ where: { id } });
  }

  // Atende ao requisito 7: "Edição de comentário próprio"
  async update(id: number, content: string) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new ValidationError('"content" é obrigatório');
    }
    return this.prisma.comment.update({
      where: { id },
      data: { content },
    });
  }
}