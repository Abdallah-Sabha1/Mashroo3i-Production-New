# 🔨 FRONTEND FIXES - PRIORITY ACTION PLAN

## 🚨 PHASE 1: CRITICAL FIXES (FIX TODAY - BLOCKS PRODUCTION)

### Fix #1: Silent Return in handleRecalculate
**File:** `frontend/src/components/wizard/FinancialProjectionsStep.jsx`
**Time:** 15 minutes
**Risk if skipped:** UI frozen forever, user can't interact

```diff
  const handleRecalculate = async () => {
    if (useBenchmark && investmentAdj === 0 && revenueAdj === 0 && marginAdj === 0 && growthAdj === 0) {
      // Reset to benchmark — no custom values
      setRecalculating(true)
      setError(null)
      try {
        const res = await financialProjectionService.updateProjection(ideaId, {
          initialInvestment: undefined,
          monthlyRevenue:    undefined,
          profitMargin:      undefined,
          growthRate:        undefined,
        })
        setProjection(res.data)
      } catch {
        setError(t('financialWizard.projections.recalcError'))
      } finally {
        setRecalculating(false)
      }
      return
    }

    // Calculate adjusted values from benchmark
    const bm = projection?.benchmark
-   if (!bm || !projection) return
+   if (!bm || !projection) {
+     setError(t('financialWizard.projections.errorMsg'))
+     return
+   }

    const benchInvest = projection.effectiveInitialInvestment || bm.startupCostMid || 0
    const benchRevenue = projection.effectiveMonthlyRevenue || 0
    const benchMargin = projection.effectiveGrossMargin || bm.grossMarginTypical || 0
    const benchGrowth = bm.monthlyGrowthRatePercent || 0

    const adjustedInvest = benchInvest * (1 + investmentAdj / 100)
    const adjustedRevenue = benchRevenue * (1 + revenueAdj / 100)
    const adjustedMargin = benchMargin + marginAdj
    const adjustedGrowth = benchGrowth + growthAdj

    setRecalculating(true)
    setError(null)
    try {
      const res = await financialProjectionService.updateProjection(ideaId, {
        initialInvestment: adjustedInvest,
        monthlyRevenue:    adjustedRevenue,
        profitMargin:      adjustedMargin,
        growthRate:        adjustedGrowth,
      })
      setProjection(res.data)
    } catch {
      setError(t('financialWizard.projections.recalcError'))
    } finally {
      setRecalculating(false)
    }
  }
```

---

### Fix #2: Undefined Props Crash in FinancialProjections
**File:** `frontend/src/pages/FinancialProjections.jsx`
**Time:** 20 minutes
**Risk if skipped:** Runtime crash when idea missing sector/businessModel

```diff
  if (error || !idea) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link
              to={`/evaluation/${ideaId}`}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('financialWizard.backToAnalysis')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

+ // Additional validation
+ if (!idea.sector || !idea.businessModel) {
+   return (
+     <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
+       <Navbar />
+       <div className="flex-1 flex items-center justify-center">
+         <div className="text-center">
+           <p className="text-sm text-red-600 dark:text-red-400 mb-4">
+             {t('common.errorLoadingData')}
+           </p>
+           <Link
+             to={`/evaluation/${ideaId}`}
+             className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
+           >
+             {t('financialWizard.backToAnalysis')}
+           </Link>
+         </div>
+       </div>
+     </div>
+   )
+ }

  const stepTitle = t('financialWizard.stepTitles.projections')
  const stepSubtitle = t('financialWizard.stepSubtitles.projections')
```

---

### Fix #3: Stale State in handleReset
**File:** `frontend/src/components/wizard/FinancialProjectionsStep.jsx`
**Time:** 20 minutes
**Risk if skipped:** Data inconsistency between UI and backend

```diff
  const handleReset = async () => {
-   setInvestmentAdj(0)
-   setRevenueAdj(0)
-   setMarginAdj(0)
-   setGrowthAdj(0)
-   setUseBenchmark(true)

    // Reset to benchmark by sending undefined values (don't use stale handleRecalculate)
    setRecalculating(true)
    setError(null)
    try {
      const res = await financialProjectionService.updateProjection(ideaId, {
        initialInvestment: undefined,
        monthlyRevenue:    undefined,
        profitMargin:      undefined,
        growthRate:        undefined,
      })
      setProjection(res.data)
+     // ✅ Only reset after successful API call
+     setInvestmentAdj(0)
+     setRevenueAdj(0)
+     setMarginAdj(0)
+     setGrowthAdj(0)
+     setUseBenchmark(true)
    } catch {
      setError(t('financialWizard.projections.recalcError'))
+     // ✅ Don't reset UI if API failed - keeps in sync
    } finally {
      setRecalculating(false)
    }
  }
```

---

### Fix #4: Infinite Loop Protection
**File:** `frontend/src/components/wizard/FinancialProjectionsStep.jsx`
**Time:** 30 minutes
**Risk if skipped:** Infinite retries on bad data

```diff
const FinancialProjectionsStep = ({ ideaId, industryType, businessModel }) => {
  const { t } = useTranslation()

  const SCENARIO_TABS = [
    { key: 'optimisticScenario',  label: t('financialWizard.projections.scenarios.optimistic'),  color: 'green'  },
    { key: 'realisticScenario',   label: t('financialWizard.projections.scenarios.realistic'),   color: 'indigo' },
    { key: 'pessimisticScenario', label: t('financialWizard.projections.scenarios.pessimistic'), color: 'red'    },
  ]

  const [projection, setProjection] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState('realisticScenario')
  const [showTable, setShowTable]   = useState(false)

+ // ✅ Add retry tracking
+ const [createRetries, setCreateRetries] = useState(0)
+ const MAX_RETRIES = 3

  // Adjustment percentages (instead of asking for raw numbers)
  const [investmentAdj, setInvestmentAdj] = useState(0)
  const [revenueAdj, setRevenueAdj]       = useState(0)
  const [marginAdj, setMarginAdj]         = useState(0)
  const [growthAdj, setGrowthAdj]         = useState(0)
  const [useBenchmark, setUseBenchmark]   = useState(true)

  // Initial load — create projection from benchmark
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

+   // ✅ Validate inputs first
+   if (!industryType || !businessModel) {
+     if (active) setError(t('common.errorLoadingData'))
+     if (active) setLoading(false)
+     return () => { active = false }
+   }

    financialProjectionService.getProjection(ideaId)
      .then(res => {
        if (!active) return
        setProjection(res.data)
+       setCreateRetries(0)  // ✅ Reset retries on success
      })
      .catch(() => {
+       // ✅ Check retry limit before creating
+       if (createRetries >= MAX_RETRIES) {
+         if (active) setError(t('financialWizard.projections.errorMsg'))
+         if (active) setLoading(false)
+         return
+       }

        financialProjectionService.createProjection(ideaId, { industryType, businessModel })
          .then(res => {
            if (!active) return
            setProjection(res.data)
+           setCreateRetries(0)  // ✅ Reset on success
          })
          .catch(() => {
-           if (active) setError(t('financialWizard.projections.errorMsg'))
+           if (active) {
+             setError(t('financialWizard.projections.errorMsg'))
+             setCreateRetries(prev => prev + 1)  // ✅ Increment retry count
+           }
          })
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [ideaId, industryType, businessModel])
```

---

## 🟠 PHASE 2: HIGH PRIORITY (FIX THIS WEEK)

### Fix #5: Timer Leak in Evaluation
**File:** `frontend/src/pages/Evaluation.jsx`
**Time:** 20 minutes

```diff
const Evaluation = () => {
  // ... other code ...

  const AI_MESSAGES = t('evaluation.aiMessages', { returnObjects: true })

+ // ✅ Memoize to prevent new array on every render
+ const memoizedAiMessages = useMemo(
+   () => t('evaluation.aiMessages', { returnObjects: true }),
+   [t]
+ )

  // Rotate AI loading messages
  useEffect(() => {
    if (generating) {
-     msgTimer.current = setInterval(() =>
-       setMsgIndex(i => (i + 1) % AI_MESSAGES.length), 1500)
+     msgTimer.current = setInterval(() =>
+       setMsgIndex(i => (i + 1) % memoizedAiMessages.length), 1500)
    } else {
      clearInterval(msgTimer.current)
      setMsgIndex(0)
    }
    return () => clearInterval(msgTimer.current)
- }, [generating])
+ }, [generating, memoizedAiMessages])  // ✅ Include dependency
```

---

### Fix #6: Stale Closure in Dashboard Delete
**File:** `frontend/src/pages/Dashboard.jsx`
**Time:** 15 minutes

```diff
  const handleDelete = async (ideaId) => {
    setDeletingId(ideaId)
    try {
      await ideasApi.delete(ideaId)
-     setIdeas(ideas.filter(i => i.ideaId !== ideaId))
+     // ✅ Use functional update to avoid stale state
+     setIdeas(prevIdeas => prevIdeas.filter(i => i.ideaId !== ideaId))
    } catch (err) {
-     console.error('Failed to delete idea:', err)
+     const { addToast } = useToast()  // ✅ Add this hook
+     addToast(getErrorMessage(err), 'error')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }
```

---

### Fix #7: Add AbortController to API Calls
**File:** `frontend/src/services/api.js`
**Time:** 45 minutes

```diff
export const ideas = {
  create: (data) => api.post('/ideas', data),
-  getAll: () => api.get('/ideas/user/me'),
-  getById: (id) => api.get(`/ideas/${id}`),
+  getAll: (options) => api.get('/ideas/user/me', options),
+  getById: (id, options) => api.get(`/ideas/${id}`, options),
  update: (id, data) => api.put(`/ideas/${id}`, data),
  delete: (id) => api.delete(`/ideas/${id}`),
}

export const evaluation = {
-  generate: (ideaId) => api.post(`/evaluation/${ideaId}`),
-  get: (ideaId) => api.get(`/evaluation/${ideaId}`),
+  generate: (ideaId, options) => api.post(`/evaluation/${ideaId}`, {}, options),
+  get: (ideaId, options) => api.get(`/evaluation/${ideaId}`, options),
  delete: (ideaId) => api.delete(`/evaluation/${ideaId}`),
}
```

**Update FinancialProjections.jsx:**
```diff
  useEffect(() => {
+   const abortCtrl = new AbortController()
    let active = true
    setLoading(true)
    setError(null)

-   ideasApi.getById(parseInt(ideaId))
+   ideasApi.getById(parseInt(ideaId), { signal: abortCtrl.signal })
      .then(res => {
        if (active) setIdea(res.data)
      })
+     .catch(err => {
+       if (err.name === 'AbortError') return  // ✅ Ignore aborts
+       if (active) setError(t('common.errorLoadingData'))
+     })
      .finally(() => { if (active) setLoading(false) })

+   return () => {
+     abortCtrl.abort()  // ✅ Cancel request
+     active = false
+   }
  }, [ideaId])
```

---

### Fix #8: Array Index as Key
**File:** `frontend/src/pages/SubmitIdea.jsx`
**Time:** 15 minutes

```diff
  const LOADING_MSGS = [
-   'Analyzing your idea...',
-   'Processing your vision...',
-   'Building your roadmap...',
+   { id: 'msg-analyze', text: 'Analyzing your idea...' },
+   { id: 'msg-process', text: 'Processing your vision...' },
+   { id: 'msg-roadmap', text: 'Building your roadmap...' },
  ]

  // In render:
-  {LOADING_MSGS.map((_, i) => (
-    <div key={i} className={...} />
+  {LOADING_MSGS.map(msg => (
+    <div key={msg.id} className={...} />
  ))}
```

---

## 🟡 PHASE 3: MEDIUM PRIORITY (NEXT SPRINT)

### Fix #9: Add Error Boundary
**File:** `frontend/src/App.jsx`
**Time:** 45 minutes

```diff
+import React from 'react'
+
+class ErrorBoundary extends React.Component {
+  constructor(props) {
+    super(props)
+    this.state = { hasError: false, error: null }
+  }
+
+  static getDerivedStateFromError(error) {
+    return { hasError: true, error }
+  }
+
+  componentDidCatch(error, errorInfo) {
+    console.error('Error boundary caught:', error, errorInfo)
+    // TODO: Send to error tracking service (Sentry, DataDog, etc)
+  }
+
+  render() {
+    if (this.state.hasError) {
+      return (
+        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
+          <div className="text-center">
+            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
+              Something went wrong
+            </h1>
+            <p className="text-slate-600 dark:text-gray-400 mb-6 max-w-md">
+              We're sorry for the inconvenience. Please try refreshing the page.
+            </p>
+            <button
+              onClick={() => window.location.reload()}
+              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
+            >
+              Reload Page
+            </button>
+          </div>
+        </div>
+      )
+    }
+    return this.props.children
+  }
+}
+
const App = () => {
  const { language, direction } = useLanguageStore()

  return (
+   <ErrorBoundary>
      <div key={language} dir={direction} className="min-h-screen">
        <ToastProvider>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* ... routes ... */}
            </Routes>
          </Suspense>
        </ToastProvider>
      </div>
+   </ErrorBoundary>
  )
}
```

---

### Fix #10: Input Validation on Financial Fields
**File:** `frontend/src/pages/Financial.jsx` (wherever products are input)
**Time:** 30 minutes

```diff
  const updateProduct = (idx, field, value) => {
+   // ✅ Validate before updating
    if (field === 'price' || field === 'cost') {
      const num = parseFloat(value)
-     if (!isNaN(num)) {
+     // ✅ Check it's a valid positive number
+     if (num >= 0 && Number.isFinite(num)) {
        setProducts(prev => {
          const next = [...prev]
          next[idx][field] = num
          return next
        })
      }
    } else {
      setProducts(prev => {
        const next = [...prev]
        next[idx][field] = value
        return next
      })
    }
  }

  // In input:
  <input
    type="number"
    min="0"
    step="0.01"
    value={products[i]?.price || ''}
    onChange={e => updateProduct(i, 'price', e.target.value)}
  />
```

---

## 📋 TESTING CHECKLIST

After each fix, test:

- [ ] **Fix #1:** Click recalculate with empty projection → Shows error
- [ ] **Fix #2:** Load idea with missing sector → Shows error page
- [ ] **Fix #3:** Click reset, check values sync → Values match backend
- [ ] **Fix #4:** Reload page 3+ times → Doesn't crash
- [ ] **Fix #5:** Wait for AI message animation → No memory leak
- [ ] **Fix #6:** Delete while loading → Correct data persists
- [ ] **Fix #7:** Close tab during API call → No hanging request
- [ ] **Fix #8:** Re-render list → Animation smooth
- [ ] **Fix #9:** Crash in component → Error page shows
- [ ] **Fix #10:** Enter negative price → Rejected

---

## ⏱️ ESTIMATED TIMELINE

| Phase | Fixes | Time | When |
|-------|-------|------|------|
| Phase 1 | #1-4 | 1.5h | Today |
| Phase 2 | #5-8 | 2h | This week |
| Phase 3 | #9-10 | 1.5h | Next sprint |
| **Total** | **10** | **5h** | **2 weeks** |

---

## ✅ SIGN-OFF CHECKLIST

- [ ] All Phase 1 fixes merged to main
- [ ] Tests pass locally
- [ ] No React warnings in console
- [ ] No network waterfall issues
- [ ] Accessibility audit passed
- [ ] Load tested with slow network
- [ ] Deployed to staging
- [ ] QA sign-off on fixes

