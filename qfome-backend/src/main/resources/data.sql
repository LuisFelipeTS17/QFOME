-- Seed: categorias
INSERT INTO categorias (nome, slug, descricao, ativo)
VALUES
  ('Caseira',     'caseira',     'Comida de panela e sabor de casa.',       true),
  ('Fit & Fresh', 'fit-fresh',   'Proteina limpa com vegetais frescos.',    true),
  ('Grelhados',   'grelhados',   'Carnes no ponto e acompanhamentos premium.', true),
  ('Peixes',      'peixes',      'Leve, fresco e temperado na medida.',     true),
  ('Sopas',       'sopas',       'Conforto quente para qualquer hora.',     true),
  ('Sobremesas',  'sobremesas',  'Doces artesanais para finalizar.',        true)
ON CONFLICT (slug) DO NOTHING;

-- Seed: produtos (caseira)
INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Bowl Nordestino',       'bowl-nordestino',       'Bowl completo com arroz cremoso da casa, carne de sol desfiada, queijo coalho dourado e vinagrete de feijao fradinho.', 39.90, true, id FROM categorias WHERE slug = 'caseira'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Strogonoff da Casa',    'strogonoff-da-casa',    'Frango ao molho cremoso, arroz soltinho e batata palha.',                                                              34.90, true, id FROM categorias WHERE slug = 'caseira'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Feijao Tropeiro Premium','feijao-tropeiro-premium','Feijao, linguica, couve salteada e ovo caipira.',                                                                    37.90, true, id FROM categorias WHERE slug = 'caseira'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Picadinho Rustico',     'picadinho-rustico',     'Carne macia ao molho, pure de mandioquinha e farofa.',                                                                 41.90, true, id FROM categorias WHERE slug = 'caseira'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Frango Crocante Supreme','frango-crocante-supreme','File de frango empanado ultra crocante, pure rustico de batata e molho cremoso de alho assado com ervas frescas.',   36.90, true, id FROM categorias WHERE slug = 'caseira'
ON CONFLICT (slug) DO NOTHING;

-- Seed: produtos (fit-fresh)
INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Bowl Proteico',         'bowl-proteico',         'Frango grelhado, quinoa, brocolis e tomate confit.',                                                                   35.90, true, id FROM categorias WHERE slug = 'fit-fresh'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Salada Mediterranea',   'salada-mediterranea',   'Folhas frescas, atum, ovo, azeitona e molho de iogurte.',                                                              32.90, true, id FROM categorias WHERE slug = 'fit-fresh'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Fit Wrap de Frango',    'fit-wrap-frango',       'Wrap integral com frango, cenoura e creme de ricota.',                                                                 29.90, true, id FROM categorias WHERE slug = 'fit-fresh'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Salmao Tropical',       'salmao-tropical',       'Posta de salmao grelhado no ponto, quinoa de ervas e mix de legumes com toque citrico.',                              47.90, true, id FROM categorias WHERE slug = 'fit-fresh'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Omelete Veg',           'omelete-veg',           'Ovos caipiras, espinafre, tomate seco e queijo branco.',                                                               27.90, true, id FROM categorias WHERE slug = 'fit-fresh'
ON CONFLICT (slug) DO NOTHING;

-- Seed: produtos (grelhados)
INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Picanha na Chapa',      'picanha-na-chapa',      'Picanha fatiada, arroz biro-biro e batata rustica.',                                                                   54.90, true, id FROM categorias WHERE slug = 'grelhados'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Fraldinha Bourbon',     'fraldinha-bourbon',     'Fraldinha grelhada com molho bourbon e legumes.',                                                                      49.90, true, id FROM categorias WHERE slug = 'grelhados'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'BBQ Chicken Plate',     'bbq-chicken-plate',     'Frango grelhado com barbecue artesanal e milho tostado.',                                                              38.90, true, id FROM categorias WHERE slug = 'grelhados'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Costela Smash',         'costela-smash',         'Costela bovina desfiada com pure e vinagrete.',                                                                        45.90, true, id FROM categorias WHERE slug = 'grelhados'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Combo Street Burguer',  'combo-street-burguer',  'Burger artesanal com pao brioche, blend da casa, queijo cheddar, batata chips crocante e refrigerante 350 ml.',       33.90, true, id FROM categorias WHERE slug = 'grelhados'
ON CONFLICT (slug) DO NOTHING;

-- Seed: produtos (peixes)
INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Tilapia Crisp',         'tilapia-crisp',         'Tilapia empanada com arroz de coco e salada verde.',                                                                   39.90, true, id FROM categorias WHERE slug = 'peixes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Moqueca da Baia',       'moqueca-da-baia',       'Peixe branco, leite de coco, azeite de dende e arroz.',                                                               44.90, true, id FROM categorias WHERE slug = 'peixes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Poke de Atum',          'poke-atum',             'Atum fresco, arroz japones, manga e crispy de cebola.',                                                                41.90, true, id FROM categorias WHERE slug = 'peixes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Camarao Cremoso',       'camarao-cremoso',       'Camaroes ao molho de limao siciliano com linguine.',                                                                   52.90, true, id FROM categorias WHERE slug = 'peixes'
ON CONFLICT (slug) DO NOTHING;

-- Seed: produtos (sopas)
INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Caldo Verde Artesanal', 'caldo-verde-artesanal', 'Caldo de batata com couve, linguica e pao torrado.',                                                                  24.90, true, id FROM categorias WHERE slug = 'sopas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Sopa de Legumes Fit',   'sopa-legumes-fit',      'Mix de legumes frescos com caldo leve e ervas.',                                                                       22.90, true, id FROM categorias WHERE slug = 'sopas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Creme de Abobora e Gengibre','creme-abobora-gengibre','Creme aveludado com toque de gengibre e croutons.',                                                              23.90, true, id FROM categorias WHERE slug = 'sopas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Ramen QFome',           'ramen-qfome',           'Lamen artesanal com caldo rico, ovo e legumes.',                                                                       31.90, true, id FROM categorias WHERE slug = 'sopas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Canja Premium',         'canja-premium',         'Canja cremosa de frango com arroz e cheiro-verde.',                                                                    26.90, true, id FROM categorias WHERE slug = 'sopas'
ON CONFLICT (slug) DO NOTHING;

-- Seed: produtos (sobremesas)
INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Mini Churros',          'mini-churros',          'Churros crocantes com doce de leite artesanal.',                                                                       19.90, true, id FROM categorias WHERE slug = 'sobremesas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Brownie com Calda',     'brownie-calda',         'Brownie de chocolate intenso com calda quente.',                                                                       21.90, true, id FROM categorias WHERE slug = 'sobremesas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Mousse de Maracuja',    'mousse-maracuja',       'Mousse aerado com crocante de castanhas.',                                                                             16.90, true, id FROM categorias WHERE slug = 'sobremesas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Cheesecake Frutas Vermelhas','cheesecake-frutas-vermelhas','Massa amanteigada e cobertura artesanal.',                                                                  23.90, true, id FROM categorias WHERE slug = 'sobremesas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produtos (nome, slug, descricao, preco, ativo, categoria_id)
SELECT 'Torta de Limao',        'torta-limao',           'Creme citrico com base crocante e merengue leve.',                                                                     18.90, true, id FROM categorias WHERE slug = 'sobremesas'
ON CONFLICT (slug) DO NOTHING;
