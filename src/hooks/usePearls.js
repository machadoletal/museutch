import { useState, useMemo, useEffect } from 'react'
import { fetchItems } from '../utils/dataLoader'
import { groupPearls } from '../utils/groupPearls'

/**
 * Hook principal do Museu TCH.
 * Busca os dados, agrupa por grupo_id e gerencia filtros + busca.
 */
export function usePearls() {
  const [allGroups, setAllGroups] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // Filtros
  const [search,        setSearch]        = useState('')
  const [filterPessoa,  setFilterPessoa]  = useState('Todos')
  const [filterAno,     setFilterAno]     = useState('Todos')
  const [filterTipo,    setFilterTipo]    = useState('Todos')

  // Carrega e agrupa na montagem
  useEffect(() => {
    fetchItems()
      .then(items => setAllGroups(groupPearls(items)))
      .catch(err  => setError(err.message))
      .finally(()  => setLoading(false))
  }, [])

  // Opções únicas para os selects
  const pessoas = useMemo(() => {
    const set = new Set()
    allGroups.forEach(g => g.pessoas.forEach(p => p && set.add(p)))
    return ['Todos', ...Array.from(set).sort()]
  }, [allGroups])

  const anos = useMemo(() => {
    const set = new Set(allGroups.map(g => g.ano).filter(Boolean))
    return ['Todos', ...Array.from(set).sort((a, b) => b - a)]
  }, [allGroups])

  const tipos = ['Todos', 'texto', 'imagem', 'audio', 'video']

  // Aplica filtros e busca
  const groups = useMemo(() => {
    let result = allGroups

    if (filterPessoa !== 'Todos') {
      result = result.filter(g => g.pessoas.includes(filterPessoa))
    }

    if (filterAno !== 'Todos') {
      result = result.filter(g => g.ano === Number(filterAno))
    }

    if (filterTipo !== 'Todos') {
      // Sequências que contenham pelo menos um item do tipo filtrado
      result = result.filter(g => g.tipos.includes(filterTipo))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(g =>
        // Busca em todos os itens do grupo
        g.items.some(item =>
          item.conteudo_texto?.toLowerCase().includes(q) ||
          item.titulo?.toLowerCase().includes(q)         ||
          item.pessoa?.toLowerCase().includes(q)         ||
          item.tags?.toLowerCase().includes(q)
        )
      )
    }

    return result
  }, [allGroups, filterPessoa, filterAno, filterTipo, search])

  function resetFilters() {
    setSearch('')
    setFilterPessoa('Todos')
    setFilterAno('Todos')
    setFilterTipo('Todos')
  }

  const hasActiveFilters =
    search !== '' || filterPessoa !== 'Todos' ||
    filterAno !== 'Todos' || filterTipo !== 'Todos'

  return {
    groups, loading, error,
    pessoas, anos, tipos,
    search,       setSearch,
    filterPessoa, setFilterPessoa,
    filterAno,    setFilterAno,
    filterTipo,   setFilterTipo,
    resetFilters, hasActiveFilters,
    totalCount: allGroups.length,
  }
}
