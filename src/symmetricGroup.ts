export interface Permutation {
  name: string,
  cycleName: string,
  code: string,
  index: number
}

export const s4Permutations = [
  { cycleName: '(  )', code: '1234' },
  { cycleName: '(12)', code: '2134' },
  { cycleName: '(13)', code: '3214' },
  { cycleName: '(14)', code: '4231' },
  { cycleName: '(23)', code: '1324' },
  { cycleName: '(24)', code: '1432' },
  { cycleName: '(34)', code: '1243' },

  { cycleName: '(12)(34)', code: '2143' },
  { cycleName: '(13)(24)', code: '3412' },
  { cycleName: '(14)(23)', code: '4321' },

  { cycleName: '(123)', code: '2314' },
  { cycleName: '(124)', code: '2431' },
  { cycleName: '(132)', code: '3124' },
  { cycleName: '(134)', code: '3241' },
  { cycleName: '(142)', code: '4132' },
  { cycleName: '(143)', code: '4213' },
  { cycleName: '(234)', code: '1342' },
  { cycleName: '(243)', code: '1423' },

  { cycleName: '(1234)', code: '2341' },
  { cycleName: '(1243)', code: '2413' },
  { cycleName: '(1324)', code: '3421' },
  { cycleName: '(1342)', code: '3142' },
  { cycleName: '(1423)', code: '4312' },
  { cycleName: '(1432)', code: '4123' },
] as Permutation[]

export function permutationProduct (
    a: Permutation, b: Permutation): Permutation {
  return cayleyTable[a.index][b.index]
}

const cayleyTable = makeCayleyTable(s4Permutations)

for (const [i, p] of s4Permutations.entries()) {
  p.name = p.cycleName
  p.index = i
}

function makeCayleyTable (permutations: Permutation[]) {
  const codeToPermutation: Record<string, Permutation> = {}
  for (const p of permutations) {
    codeToPermutation[p.code] = p
  }

  function computeProduct (a: Permutation, b: Permutation): Permutation {
    let product = ''
    for (let i = 0; i < a.code.length; i++) {
      product += b.code[Number(a.code[i]) - 1]
    }
    return codeToPermutation[product]
  }

  const cayleyTable: Permutation[][] = []
  for (const perm of permutations) {
    const products: Permutation[] = []

    for (const operand of permutations) {
      products.push(computeProduct(perm, operand))
    }

    cayleyTable.push(products)
  }

  return cayleyTable
}
