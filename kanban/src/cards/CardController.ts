import type { CardRepository } from './CardRepository.js';
import type { BoardRepository } from '../boards/BoardRepository.js';
import type { ControllerResult } from '../shared/http.js';
import { Card, type CardPriority } from './Card.js';
import { NotImplementedError } from '../shared/errors.js';
import {
  CardNotFoundError,
  DuplicateCardTitleError,
  InvalidCardTitleError,
  InvalidPriorityError,
  WipLimitExceededError,
} from './errors.js';
import { toBoardViewModel } from '../boards/boardView.js';
import { ColumnNotFoundError } from '../boards/errors.js';



/**
 * CONTROLLER — nenhum método está implementado ainda. Isso é proposital:
 * cada método corresponde a uma atividade proposta na Aula 03 (ver
 * aula03.md). O construtor já recebe os dois repositórios que vocês vão
 * precisar — `cardRepository` para persistir cartões, `boardRepository`
 * para validar que uma coluna existe antes de criar/mover um cartão nela.
 */
export class CardController {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly boardRepository: BoardRepository,
  ) {}

  /**
   * TODO (Atividade 1): criar um cartão a partir do corpo da requisição
   * (`{ title, columnId, priority?, description? }`) e redirecionar de
   * volta para `/`. Regras a aplicar: título válido (`Card.create` já
   * valida), coluna precisa existir no quadro (`boardRepository`), e não
   * pode haver título duplicado na mesma coluna (Atividade 6 — podem
   * implementar já aqui ou depois, é a mesma regra).
   */
create(body: unknown): ControllerResult {
  const data =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const title =
    typeof data.title === 'string'
      ? data.title.trim()
      : '';

  const columnId =
    typeof data.columnId === 'string'
      ? data.columnId
      : '';

  const priority =
    typeof data.priority === 'string'
      ? data.priority
      : 'baixa';

  const description =
    typeof data.description === 'string'
      ? data.description
      : '';

  if (!title) {
    throw new Error('Informe um título para o cartão.');
  }

  if (!columnId) {
    throw new Error('O ID da coluna é obrigatório.');
  }

  const board = this.boardRepository.getDefault();

  const destinationColumn = board.columns.find(
    (column) => column.id === columnId,
  );

  if (!destinationColumn) {
    throw new ColumnNotFoundError(columnId);
  }

  if (
    this.cardRepository.existsWithTitleInColumn(
      title,
      columnId,
    )
  ) {
    throw new DuplicateCardTitleError(title);
  }

  const cardsInColumn =
    this.cardRepository.findByColumn(columnId);

  if (
    destinationColumn.wipLimit !== null &&
    cardsInColumn.length >= destinationColumn.wipLimit
  ) {
    throw new WipLimitExceededError();
  }

  const card = Card.create(
    title,
    columnId,
    priority as CardPriority,
    description,
  );

  this.cardRepository.save(card);

  return {
    status: 303,
    redirect: '/',
  };
}


  /**
   * TODO (Atividade 2): mover um cartão para outra coluna
   * (`{ columnId }` no corpo). Regras: coluna destino precisa existir;
   * respeitar o limite de WIP da coluna destino (Atividade 5).
   */
move(id: string, body: unknown): ControllerResult {
  const card = this.cardRepository.findById(id);

  if (!card) {
    throw new CardNotFoundError(id);
  }

  const data =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const columnId =
    typeof data.columnId === 'string'
      ? data.columnId
      : '';

  if (!columnId) {
    throw new Error('O ID da coluna é obrigatório.');
  }

  const board = this.boardRepository.getDefault();

  const destinationColumn = board.columns.find(
    (column) => column.id === columnId,
  );

  if (!destinationColumn) {
    throw new ColumnNotFoundError(columnId);
  }

  const cardsInDestination =
    this.cardRepository.findByColumn(columnId);

  if (
    card.columnId !== columnId &&
    destinationColumn.wipLimit !== null &&
    cardsInDestination.length >= destinationColumn.wipLimit
  ) {
    throw new WipLimitExceededError();
  }

  card.changeColumn(columnId);

  this.cardRepository.save(card);

  return {
    status: 303,
    redirect: '/',
  };
}

  /**
   * TODO (Atividade 3): editar título/descrição/prioridade de um cartão
   * existente (`{ title?, description?, priority? }`).
   */
update(id: string, body: unknown): ControllerResult {
  const card = this.cardRepository.findById(id);

  if (!card) {
    throw new CardNotFoundError(id);
  }

  const data =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};

  if (data.title !== undefined || data.description !== undefined) {
    const title =
      data.title !== undefined
        ? data.title
        : card.title;

    const description =
      data.description !== undefined
        ? data.description
        : card.description;

    if (typeof title !== 'string') {
      throw new InvalidCardTitleError('deve ser um texto');
    }

    if (typeof description !== 'string') {
      throw new Error('Descrição inválida: deve ser um texto');
    }

    card.rename(title, description);
  }

  if (data.priority !== undefined) {
    if (typeof data.priority !== 'string') {
      throw new InvalidPriorityError(data.priority);
    }

    card.changePriority(data.priority as CardPriority);
  }

  this.cardRepository.save(card);

  return {
    status: 303,
    redirect: '/',
  };
}


  /** TODO (Atividade 4): excluir um cartão existente. */
/** TODO (Atividade 4): excluir um cartão existente. */
remove(id: string): ControllerResult {
  const card = this.cardRepository.findById(id);

  if (!card) {
    throw new CardNotFoundError(id);
  }

  this.cardRepository.delete(id);

  return {
    status: 303,
    redirect: '/',
  };
}


  /** TODO (Atividade 8, estica): página de detalhe de um cartão. */
  showDetail(_id: string): ControllerResult {
    throw new NotImplementedError('CardController#showDetail');
  }

  /** TODO (Atividade 9, estica): buscar cartões por título (`?query=`). */
  search(_query: unknown): ControllerResult {
    throw new NotImplementedError('CardController#search');
  }
}
