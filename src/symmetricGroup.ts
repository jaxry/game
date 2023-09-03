export interface Permutation {
  name: string,
  code: string,
  index: number
}

export const s4Permutations = [
  { name: '()', code: '1234' },
  { name: '(12)', code: '2134' },
  { name: '(13)', code: '3214' },
  { name: '(14)', code: '4231' },
  { name: '(23)', code: '1324' },
  { name: '(24)', code: '1432' },
  { name: '(34)', code: '1243' },

  { name: '(12)(34)', code: '2143' },
  { name: '(13)(24)', code: '3412' },
  { name: '(14)(23)', code: '4321' },

  { name: '(123)', code: '2314' },
  { name: '(124)', code: '2431' },
  { name: '(132)', code: '3124' },
  { name: '(134)', code: '3241' },
  { name: '(142)', code: '4132' },
  { name: '(143)', code: '4213' },
  { name: '(234)', code: '1342' },
  { name: '(243)', code: '1423' },

  { name: '(1234)', code: '2341' },
  { name: '(1243)', code: '2413' },
  { name: '(1324)', code: '3421' },
  { name: '(1342)', code: '3142' },
  { name: '(1423)', code: '4312' },
  { name: '(1432)', code: '4123' },
] as Permutation[]

for (const [i, p] of s4Permutations.entries()) {
  p.index = i
}

export function permutationProduct (a: Permutation, b: Permutation) {
  return cayleyTable[a.index][b.index]
}

const cayleyTable = makeCayleyTable(s4Permutations)

function makeCayleyTable (permutations: Permutation[]) {
  const codeToPermutation = new Map<string, Permutation>()

  for (const p of permutations) {
    codeToPermutation.set(p.code, p)
  }

  function computeProduct (a: Permutation, b: Permutation): Permutation {
    let product = ''
    for (const digit of a.code) {
      product += b.code[Number(digit) - 1]
    }
    return codeToPermutation.get(product)!
  }

  return permutations.map(p => {
    return permutations.map(q => computeProduct(p, q))
  })
}