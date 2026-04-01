import { useState, useMemo, useEffect } from 'react'
import { loadPearls } from '../utils/dataLoader'

/**
 * Hook principal do Museu das Pérolas.
 * Carrega os dados e gerencia todos os filtros.
 */
export function usePearls() {
  const [allPearls, setAllPearls] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // Filtros
  const [search, setSearch]       = useState('')
  const [filterPessoa, setFilterPessoa] = useState('Todos')
  const [filterAno, setFilterAno]       = useState('Todos')
  const [filterTipo, setFilterTipo]     = useState('Todos')
  const [sortOrder, setSortOrder]       = useState('desc') // 'asc' | 'desc'

  useEffect(() => {
    loadPearls()
      .then(data => {
        // Ordena por data mais recente por padrão
        const sorted = [...data].sort((a, b) => new Date(b.data) - new Date(a.data))
        setAllPearls(sorted)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Listas de opções únicas para os selects de filtro
  const pessoas = useMemo(() => {
    const set = new Set(allPearls.map(p => p.pessoa).filter(Boolean))
    return ['Todos', ...Array.from(set).sort()]
  }, [allPearls])

  const anos = useMemo(() => {
    const set = new Set(allPearls.map(p => p.ano).filter(Boolean))
    return ['Todos', ...Array.from(set).sort((a, b) => b - a)]
  }, [allPearls])

  const tipos = ['Todos', 'texto', 'imagem', 'audio', 'video']

  // Aplica filtros e busca
  const pearls = useMemo(() => {
    let result = [...allPearls]

    if (filterPessoa !== 'Todos') {
      result = result.filter(p => p.pessoa === filterPessoa)
    }

    if (filterAno !== 'Todos') {
      result = result.filter(p => p.ano === Number(filterAno))
    }

    if (filterTipo !== 'Todos') {
      result = result.filter(p => p.tipo === filterTipo)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.titulo?.toLowerCase().includes(q)    ||
        p.descricao?.toLowerCase().includes(q) ||
        p.conteudo?.toLowerCase().includes(q)  ||
        p.pessoa?.toLowerCase().includes(q)    ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }

    // Ordenação cronológica
    result.sort((a, b) => {
      const diff = new Date(a.data) - new Date(b.data)
      return sortOrder === 'asc' ? diff : -diff
    })

    return result
  }, [allPearls, filterPessoa, filterAno, filterTipo, search, sortOrder])

  function resetFilters() {
    setSearch('')
    setFilterPessoa('Todos')
    setFilterAno('Todos')
    setFilterTipo('Todos')
    setSortOrder('desc')
  }

  const hasActiveFilters =
    search !== '' ||
    filterPessoa !== 'Todos' ||
    filterAno !== 'Todos' ||
    filterTipo !== 'Todos'

  return {
    pearls,
    loading,
    error,
    pessoas,
    anos,
    tipos,
    search,        setSearch,
    filterPessoa,  setFilterPessoa,
    filterAno,     setFilterAno,
    filterTipo,    setFilterTipo,
    sortOrder,     setSortOrder,
    resetFilters,
    hasActiveFilters,
    totalCount: allPearls.length,
  }
}
