import type { Recipe } from '../types';

export const recipe: Recipe = {
    name: 'Torradas de Batata-doce com Abacate',
    imageUrl: '/images/sweetpotato.png',
    imageHint: 'torradas de batata-doce com pasta de abacate',
    portions: 2,
    temperature: 'Quente',
    totalTime: '30 min',
    ingredients: [
      { name: 'Batata-doce grande', quantity: '1 unidade' },
      { name: 'Abacate maduro', quantity: '1 unidade' },
      { name: 'Suco de limão', quantity: '1/2 unidade' },
      { name: 'Sal e pimenta', quantity: 'a gosto' },
      { name: 'Páprica doce ou flocos de pimenta', quantity: 'a gosto' },
      { name: 'Azeite de oliva extra virgem', quantity: '1 colher de sopa' },
      { name: 'Sementes de gergelim ou chia (opcional)', quantity: '1 colher de chá' },
    ],
    preparationSteps: [
      { step: 1, instruction: 'Corte a batata-doce em fatias longitudinais de 0,5 a 1 cm.' },
      { step: 2, instruction: 'Pincele as fatias com azeite e leve ao forno a 200ºC por 20 minutos (10 de cada lado), até dourar.' },
      { step: 3, instruction: 'Amasse o abacate e misture com suco de limão, sal e pimenta.' },
      { step: 4, instruction: 'Espalhe a pasta de abacate sobre as fatias assadas.' },
      { step: 5, instruction: 'Finalize com páprica ou pimenta e sementes, a gosto.' },
    ],
    benefits: [
      'Fonte de energia com boa saciedade.',
      'Abacate aporta gorduras boas e sabor cremoso.',
    ],
    recipeNumber: 1,
    tags: ['Snack', 'Sem glúten'],
    status: 'published',
  };
