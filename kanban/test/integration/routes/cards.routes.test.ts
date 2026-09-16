import { describe, expect, it, test } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/server.js';
import { buildTestRepositories } from '../../helpers/fixtures.js';
import { Card } from '../../../src/cards/Card.js';


/**
 * Rotas que ainda não foram implementadas.
 */
describe('Rotas de cartões — ainda não implementadas', () => {

  it('GET /cards/:id responde 501 (Atividade 8, estica)', async () => {
    const app = createServer(buildTestRepositories());

    const response = await request(app)
      .get('/cards/qualquer-id');

    expect(response.status).toBe(501);
  });

  it('GET /cards/search responde 501 (Atividade 9, estica)', async () => {
    const app = createServer(buildTestRepositories());

    const response = await request(app)
      .get('/cards/search')
      .query({ query: 'termo' });

    expect(response.status).toBe(501);
  });
});

describe('Rotas de cartões — comportamento implementado', () => {
  test('POST /cards cria um cartão válido e redireciona para /', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);

    const response = await request(app)
      .post('/cards')
      .send({
        title: 'Novo cartão',
        columnId: 'col-1',
      });

    expect(response.status).toBe(303);
    expect(response.headers.location).toBe('/');

    const cards = repositories.cardRepository.findAll();

    expect(cards).toHaveLength(1);
    expect(cards[0].title).toBe('Novo cartão');
    expect(cards[0].columnId).toBe('col-1');
    expect(cards[0].priority).toBe('baixa');
    expect(cards[0].description).toBe('');
  });

  test('POST /cards rejeita título com menos de 3 caracteres com 400', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);

    const response = await request(app)
      .post('/cards')
      .send({
        title: 'ab',
        columnId: 'col-1',
      });

    expect(response.status).toBe(400);
  });

  test('POST /cards rejeita columnId de uma coluna que não existe com 404', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);

    const response = await request(app)
      .post('/cards')
      .send({
        title: 'Novo cartão',
        columnId: 'col-inexistente',
      });

    expect(response.status).toBe(404);
  });

  test('POST /cards/:id/move move o cartão para a coluna informada e redireciona para /', async () => {
    const repositories = buildTestRepositories();

    const card = Card.create('Cartão para mover', 'col-1');
    repositories.cardRepository.save(card);

    const app = createServer(repositories);

    const response = await request(app)
      .post(`/cards/${card.id}/move`)
      .send({
        columnId: 'col-2',
      });

    expect(response.status).toBe(303);
    expect(response.headers.location).toBe('/');

    const movedCard = repositories.cardRepository.findById(card.id);

    expect(movedCard).toBeDefined();
    expect(movedCard?.columnId).toBe('col-2');
  });

  test('POST /cards/:id/move responde 404 se o cartão não existe', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);

    const response = await request(app)
      .post('/cards/cartao-inexistente/move')
      .send({
        columnId: 'col-2',
      });

    expect(response.status).toBe(404);
  });

  test('POST /cards/:id/move responde 404 se a coluna destino não existe', async () => {
    const repositories = buildTestRepositories();

    const card = Card.create('Cartão para mover', 'col-1');
    repositories.cardRepository.save(card);

    const app = createServer(repositories);

    const response = await request(app)
      .post(`/cards/${card.id}/move`)
      .send({
        columnId: 'col-inexistente',
      });

    expect(response.status).toBe(404);
  });

  test('POST /cards/:id/update edita título, descrição e prioridade e redireciona para /', async () => {
    const repositories = buildTestRepositories();

    const card = Card.create(
      'Título antigo',
      'col-1',
      'baixa',
      'Descrição antiga',
    );

    repositories.cardRepository.save(card);

    const app = createServer(repositories);

    const response = await request(app)
      .post(`/cards/${card.id}/update`)
      .send({
        title: 'Título novo',
        description: 'Descrição nova',
        priority: 'alta',
      });

    expect(response.status).toBe(303);
    expect(response.headers.location).toBe('/');

    const updatedCard = repositories.cardRepository.findById(card.id);

    expect(updatedCard).toBeDefined();
    expect(updatedCard?.title).toBe('Título novo');
    expect(updatedCard?.description).toBe('Descrição nova');
    expect(updatedCard?.priority).toBe('alta');
  });

  test('POST /cards/:id/update responde 404 se o cartão não existe', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);

    const response = await request(app)
      .post('/cards/cartao-inexistente/update')
      .send({
        title: 'Editado',
      });

    expect(response.status).toBe(404);
  });
});

describe('Checklist de comportamento esperado — atividades futuras', () => {
  test.todo('POST /cards impede título duplicado na mesma coluna com 409 (Atividade 6)');

  test.todo('POST /cards/:id/move responde 409 se a coluna destino já atingiu o limite de WIP (Atividade 5)');

test('POST /cards/:id/delete remove o cartão e redireciona para /', async () => {
  const repositories = buildTestRepositories();

  const card = Card.create(
    'Cartão para excluir',
    'col-1',
  );

  repositories.cardRepository.save(card);

  const app = createServer(repositories);

  const response = await request(app)
    .post(`/cards/${card.id}/delete`);

  expect(response.status).toBe(303);
  expect(response.headers.location).toBe('/');

  const deletedCard = repositories.cardRepository.findById(card.id);

  expect(deletedCard).toBeUndefined();
});


test('POST /cards/:id/delete responde 404 se o cartão não existe', async () => {
  const repositories = buildTestRepositories();
  const app = createServer(repositories);

  const response = await request(app)
    .post('/cards/cartao-inexistente/delete');

  expect(response.status).toBe(404);
});

describe('Checklist de comportamento esperado — atividades futuras', () => {
  test.todo('POST /cards impede título duplicado na mesma coluna com 409 (Atividade 6)');

  test.todo('POST /cards/:id/move responde 409 se a coluna destino já atingiu o limite de WIP (Atividade 5)');

  test('POST /cards/:id/delete remove o cartão e redireciona para /', async () => {
    const repositories = buildTestRepositories();

    const card = Card.create(
      'Cartão para excluir',
      'col-1',
    );

    repositories.cardRepository.save(card);

    const app = createServer(repositories);

    const response = await request(app)
      .post(`/cards/${card.id}/delete`);

    expect(response.status).toBe(303);
    expect(response.headers.location).toBe('/');

    const deletedCard = repositories.cardRepository.findById(card.id);

    expect(deletedCard).toBeUndefined();
  });

  test('POST /cards/:id/delete responde 404 se o cartão não existe', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);

    const response = await request(app)
      .post('/cards/cartao-inexistente/delete');

    expect(response.status).toBe(404);
  });

  test.todo('GET /cards/:id renderiza a página de detalhe do cartão (Atividade 8)');
  test.todo('GET /cards/search?query=termo retorna só os cartões cujo título combina (Atividade 9)');
});


  test.todo('GET /cards/:id renderiza a página de detalhe do cartão (Atividade 8)');
  test.todo('GET /cards/search?query=termo retorna só os cartões cujo título combina (Atividade 9)');
});
