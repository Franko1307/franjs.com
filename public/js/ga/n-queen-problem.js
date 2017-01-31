var position = {
  c2: 'bQ',
  c3: 'bQ',
  c4: 'bQ',
  c5: 'bQ',
  d5: 'bQ',
  e5: 'bQ',
  c6: 'bQ',
  c7: 'bQ',
  d7: 'bQ',
  e7: 'bQ',
  f7: 'bQ',
};

var board1 = ChessBoard('board1', position);

function ga_n_queen_problem() {
  const population_size = 10;
  const board_size = 8;
  var population = {};
  population.list_of_chromosomas = [];
  generate_first_generation(population,population_size,board_size);
  population.sort(function (a,b) {
    return get_fitness(a) - get_fitness(b);
  })

}

function get_fitness(chromosoma) {
  var fitness = 0;
  for (var i = 0; i < chromosoma.length; i++)
    for (var j = 0; j < chromosoma.length; j++)
      if (Math.abs(chromosoma[i] - chromosoma[j] === j - i))
        ++fitness;
  return fitness;
}

function generate_first_generation(population, population_size, board_size) {
  var chromosoma = {};
  chromosoma.genes = [];
  for (var i = 0; i < board_size; i++) chromosoma.genes[i] = i;

  for (var i = 0; i < population_size; i++) {
    shuffle(chromosoma);
    chromosoma.fitness = get_fitness(chromosoma);
    population.push(chromosoma.slice());
  }

}

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}
