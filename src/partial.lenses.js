import {
  acyclicEqualsU,
  always,
  applyU,
  arityN,
  assocPartialU,
  constructorOf,
  curry,
  curryN,
  dissocPartialU,
  hasU,
  id,
  isDefined,
  isFunction,
  isObject,
  isString,
  keys,
  object0,
  pipe2U,
  sndU
} from "infestines"

//

const sliceIndex = (m, l, d, i) =>
  void 0 !== i ? Math.min(Math.max(m, i < 0 ? l + i : i), l) : d

function pair(x0, x1) {return [x0, x1]}
const cpair = x => xs => [x, xs]

const unto = c => x => void 0 !== x ? x : c

const seemsArrayLike = x =>
  x instanceof Object && (x = x.length, x === (x >> 0) && 0 <= x) ||
  isString(x)

//

function mapPartialIndexU(xi2y, xs) {
  const n = xs.length, ys = Array(n)
  let j = 0
  for (let i=0, y; i<n; ++i)
    if (void 0 !== (y = xi2y(xs[i], i)))
      ys[j++] = y
  if (j) {
    if (j < n)
      ys.length = j
    return ys
  }
}

function copyToFrom(ys, k, xs, i, j) {
  while (i < j)
    ys[k++] = xs[i++]
  return ys
}

//

const Ident = {map: applyU, of: id, ap: applyU, chain: applyU}

const Const = {map: sndU}

function ConcatOf(ap, empty, delay) {
  const c = {map: sndU, ap, of: always(empty)}
  if (delay)
    c.delay = delay
  return c
}

const Monoid = (concat, empty) => ({concat, empty: () => empty})

const Mum = ord =>
  Monoid((y, x) => void 0 !== x && (void 0 === y || ord(x, y)) ? x : y)

//

const run = (o, C, xi2yC, s, i) => toFunction(o)(C, xi2yC, s, i)

//

const expectedOptic = "Expecting an optic"
const header = "partial.lenses: "

function warn(f, m) {
  if (!f.warned) {
    f.warned = 1
    console.warn(header + m)
  }
}

function errorGiven(m, o) {
  console.error(header + m + " - given:", o)
  throw new Error(m)
}

function reqFunction(o) {
  if (!(isFunction(o) && (o.length === 4 || o.length <= 2)))
    errorGiven(expectedOptic, o)
}

function reqArray(o) {
  if (!Array.isArray(o))
    errorGiven(expectedOptic, o)
}

//

function reqApplicative(f) {
  if (!f.of)
    errorGiven("Traversals require an applicative", f)
}

//

function Join(l, r) {this.l = l; this.r = r}

const isJoin = n => n.constructor === Join

const join = (l, r) => void 0 !== l ? void 0 !== r ? new Join(l, r) : l : r

const cjoin = h => t => join(h, t)

function pushTo(n, ys) {
  while (n && isJoin(n)) {
    const l = n.l
    n = n.r
    if (l && isJoin(l)) {
      pushTo(l.l, ys)
      pushTo(l.r, ys)
    } else {
      ys.push(l)
    }
  }
  ys.push(n)
}

function toArray(n) {
  if (void 0 !== n) {
    const ys = []
    pushTo(n, ys)
    return ys
  }
}

function foldRec(f, r, n) {
  while (isJoin(n)) {
    const l = n.l
    n = n.r
    r = isJoin(l)
      ? foldRec(f, foldRec(f, r, l.l), l.r)
      : f(r, l[0], l[1])
  }
  return f(r, n[0], n[1])
}

const fold = (f, r, n) => void 0 !== n ? foldRec(f, r, n) : r

const Collect = ConcatOf(join)

//

function the(v) {
  function result() {return result}
  result.v = v
  return result
}

const T = the(true)
const not = x => !x

const First = ConcatOf((l, r) => l && l() || r && r(), void 0, id)

const mkFirst = toM => (xi2yM, t, s) => {
  if (process.env.NODE_ENV !== "production")
    warn(mkFirst, "Lazy folds over traversals are experimental")
  return (s = run(t, First, pipe2U(xi2yM, toM), s),
          s && (s = s()) && s.v)
}

//

const traversePartialIndexLazy = (map, ap, z, delay, xi2yA, xs, i, n) =>
  i < n
  ? ap(map(cjoin, xi2yA(xs[i], i)), delay(() =>
       traversePartialIndexLazy(map, ap, z, delay, xi2yA, xs, i+1, n)))
  : z

function traversePartialIndex(A, xi2yA, xs) {
  if (process.env.NODE_ENV !== "production")
    reqApplicative(A)
  const {map, ap, of, delay} = A
  let xsA = of(void 0),
      i = xs.length
  if (delay)
    xsA = traversePartialIndexLazy(map, ap, xsA, delay, xi2yA, xs, 0, i)
  else
    while (i--)
      xsA = ap(map(cjoin, xi2yA(xs[i], i)), xsA)
  return map(toArray, xsA)
}

//

function object0ToUndefined(o) {
  if (!(o instanceof Object))
    return o
  for (const k in o)
    return o
}

//

const lensFrom = (get, set) => i => (F, xi2yF, x, _) =>
  (0,F.map)(v => set(i, v, x), xi2yF(get(i, x), i))

//

const getProp = (k, o) => o instanceof Object ? o[k] : void 0

const setProp = (k, v, o) =>
  void 0 !== v ? assocPartialU(k, v, o) : dissocPartialU(k, o)

const funProp = lensFrom(getProp, setProp)

//

const getIndex = (i, xs) => seemsArrayLike(xs) ? xs[i] : void 0

function setIndex(i, x, xs) {
  if (process.env.NODE_ENV !== "production" && i < 0)
    errorGiven("Negative indices are not supported by `index`", i)
  if (!seemsArrayLike(xs))
    xs = ""
  const n = xs.length
  if (void 0 !== x) {
    const m = Math.max(i+1, n), ys = Array(m)
    for (let j=0; j<m; ++j)
      ys[j] = xs[j]
    ys[i] = x
    return ys
  } else {
    if (0 < n) {
      if (n <= i)
        return copyToFrom(Array(n), 0, xs, 0, n)
      if (1 < n) {
        const ys = Array(n-1)
        for (let j=0; j<i; ++j)
          ys[j] = xs[j]
        for (let j=i+1; j<n; ++j)
          ys[j-1] = xs[j]
        return ys
      }
    }
  }
}

const funIndex = lensFrom(getIndex, setIndex)

//

const close = (o, F, xi2yF) => (x, i) => o(F, xi2yF, x, i)

function composed(oi0, os) {
  const n = os.length - oi0
  let fs
  if (n < 2) {
    return n ? toFunction(os[oi0]) : identity
  } else {
    fs = Array(n)
    for (let i=0;i<n;++i)
      fs[i] = toFunction(os[i+oi0])
    return (F, xi2yF, x, i) => {
      let k=n
      while (--k)
        xi2yF = close(fs[k], F, xi2yF)
      return fs[0](F, xi2yF, x, i)
    }
  }
}

function setU(o, x, s) {
  switch (typeof o) {
    case "string":
      return setProp(o, x, s)
    case "number":
      return setIndex(o, x, s)
    case "object":
      if (process.env.NODE_ENV !== "production")
        reqArray(o)
      return modifyComposed(o, 0, s, x)
    default:
      if (process.env.NODE_ENV !== "production")
        reqFunction(o)
      return o.length === 4 ? o(Ident, always(x), s, void 0) : s
  }
}

function getU(l, s) {
  switch (typeof l) {
    case "string":
      return getProp(l, s)
    case "number":
      return getIndex(l, s)
    case "object":
      if (process.env.NODE_ENV !== "production")
        reqArray(l)
      for (let i=0, n=l.length, o; i<n; ++i)
        switch (typeof (o = l[i])) {
          case "string": s = getProp(o, s); break
          case "number": s = getIndex(o, s); break
          default: return composed(i, l)(Const, id, s, l[i-1])
        }
      return s
    default:
      if (process.env.NODE_ENV !== "production")
        reqFunction(l)
      return l.length === 4 ? l(Const, id, s, void 0) : l(s, void 0)
  }
}

function modifyComposed(os, xi2y, x, y) {
  if (process.env.NODE_ENV !== "production")
    reqArray(os)
  let n = os.length
  const xs = Array(n)
  for (let i=0, o; i<n; ++i) {
    xs[i] = x
    switch (typeof (o = os[i])) {
      case "string":
        x = getProp(o, x)
        break
      case "number":
        x = getIndex(o, x)
        break
      default:
        x = composed(i, os)(Ident, xi2y || always(y), x, os[i-1])
        n = i
        break
    }
  }
  if (n === os.length)
    x = xi2y ? xi2y(x, os[n-1]) : y
  for (let o; 0 <= --n;)
    x = isString(o = os[n])
        ? setProp(o, x, xs[n])
        : setIndex(o, x, xs[n])
  return x
}

//

function getPick(template, x) {
  let r
  for (const k in template) {
    const v = getU(template[k], x)
    if (void 0 !== v) {
      if (!r)
        r = {}
      r[k] = v
    }
  }
  return r
}

const setPick = (template, x) => value => {
  if (process.env.NODE_ENV !== "production" &&
      !(void 0 === value || value instanceof Object))
    errorGiven("`pick` must be set with undefined or an object", value)
  for (const k in template)
    x = setU(template[k], value && value[k], x)
  return x
}

//

const toObject = x => constructorOf(x) !== Object ? Object.assign({}, x) : x

//

const branchOnMerge = (x, keys) => xs => {
  const o = {}, n = keys.length
  for (let i=0; i<n; ++i, xs=xs[1]) {
    const v = xs[0]
    o[keys[i]] = void 0 !== v ? v : o
  }
  let r
  x = toObject(x)
  for (const k in x) {
    const v = o[k]
    if (o !== v) {
      o[k] = o
      if (!r)
        r = {}
      r[k] = void 0 !== v ? v : x[k]
    }
  }
  for (let i=0; i<n; ++i) {
    const k = keys[i]
    const v = o[k]
    if (o !== v) {
      if (!r)
        r = {}
      r[k] = v
    }
  }
  return r
}

function branchOnLazy(keys, vals, map, ap, z, delay, A, xi2yA, x, i) {
  if (i < keys.length) {
    const k = keys[i], v = x[k]
    return ap(map(cpair,
                  vals ? vals[i](A, xi2yA, x[k], k) : xi2yA(v, k)), delay(() =>
              branchOnLazy(keys, vals, map, ap, z, delay, A, xi2yA, x, i+1)))
  } else {
    return z
  }
}

const branchOn = (keys, vals) => (A, xi2yA, x, _) => {
  if (process.env.NODE_ENV !== "production")
    reqApplicative(A)
  const {map, ap, of, delay} = A
  let i = keys.length
  if (!i)
    return of(object0ToUndefined(x))
  if (!(x instanceof Object))
    x = object0
  let xsA = of(0)
  if (delay) {
    xsA = branchOnLazy(keys, vals, map, ap, xsA, delay, A, xi2yA, x, 0)
  } else {
    while (i--) {
      const k = keys[i], v = x[k]
      xsA = ap(map(cpair, vals ? vals[i](A, xi2yA, v, k) : xi2yA(v, k)), xsA)
    }
  }
  return map(branchOnMerge(x, keys), xsA)
}

const normalizer = xi2x => (F, xi2yF, x, i) =>
  (0,F.map)(x => xi2x(x, i), xi2yF(xi2x(x, i), i))

const replaced = (inn, out, x) => acyclicEqualsU(x, inn) ? out : x

function findIndex(xi2b, xs) {
  for (let i=0, n=xs.length; i<n; ++i)
    if (xi2b(xs[i], i))
      return i
  return -1
}

function partitionIntoIndex(xi2b, xs, ts, fs) {
  for (let i=0, n=xs.length, x; i<n; ++i)
    (xi2b(x = xs[i], i) ? ts : fs).push(x)
}

const fromReader = wi2x => (F, xi2yF, w, i) =>
  (0,F.map)(always(w), xi2yF(wi2x(w, i), i))

//

export function toFunction(o) {
  switch (typeof o) {
    case "string":
      return funProp(o)
    case "number":
      return funIndex(o)
    case "object":
      if (process.env.NODE_ENV !== "production")
        reqArray(o)
      return composed(0, o)
    default:
      if (process.env.NODE_ENV !== "production")
        reqFunction(o)
      return o.length === 4 ? o : fromReader(o)
  }
}

// Operations on optics

export const modify = curry((o, xi2x, s) => {
  switch (typeof o) {
    case "string":
      return setProp(o, xi2x(getProp(o, s), o), s)
    case "number":
      return setIndex(o, xi2x(getIndex(o, s), o), s)
    case "object":
      return modifyComposed(o, xi2x, s)
    default:
      if (process.env.NODE_ENV !== "production")
        reqFunction(o)
      return o.length === 4
        ? o(Ident, xi2x, s, void 0)
        : (xi2x(o(s, void 0), void 0), s)
  }
})

export const remove = curry((o, s) => setU(o, void 0, s))

export const set = curry(setU)

// Sequencing

export function seq() {
  const n = arguments.length, xMs = Array(n)
  for (let i=0; i<n; ++i)
    xMs[i] = toFunction(arguments[i])
  const loop = (M, xi2xM, i, j) => j === n
    ? M.of
    : x => (0,M.chain)(loop(M, xi2xM, i, j+1), xMs[j](M, xi2xM, x, i))
  return (M, xi2xM, x, i) => {
    if (process.env.NODE_ENV !== "production" && !M.chain)
      errorGiven("`seq` requires a monad", M)
    return loop(M, xi2xM, i, 0)(x)
  }
}

// Nesting

export function compose() {
  let n = arguments.length
  if (n < 2) {
    return n ? arguments[0] : identity
  } else {
    const lenses = Array(n)
    while (n--)
      lenses[n] = arguments[n]
    return lenses
  }
}

// Querying

export const chain = curry((xi2yO, xO) =>
  [xO, choose((xM, i) => void 0 !== xM ? xi2yO(xM, i) : zero)])

export const choice = (...ls) => choose(x => {
  const i = findIndex(l => void 0 !== getU(l, x), ls)
  return i < 0 ? zero : ls[i]
})

export const choose = xiM2o => (C, xi2yC, x, i) =>
  run(xiM2o(x, i), C, xi2yC, x, i)

export const when = p => (C, xi2yC, x, i) =>
  p(x, i) ? xi2yC(x, i) : zero(C, xi2yC, x, i)

export const optional = when(isDefined)

export function zero(C, xi2yC, x, i) {
  const of = C.of
  return of ? of(x) : (0,C.map)(always(x), xi2yC(void 0, i))
}

// Recursing

export function lazy(o2o) {
  let memo = (C, xi2yC, x, i) => (memo = toFunction(o2o(rec)))(C, xi2yC, x, i)
  function rec(C, xi2yC, x, i) {return memo(C, xi2yC, x, i)}
  return rec
}

// Debugging

export function log() {
  const show = curry((dir, x) =>
    console.log.apply(console,
                      copyToFrom([], 0, arguments, 0, arguments.length)
                      .concat([dir, x])) || x)
  return iso(show("get"), show("set"))
}

// Operations on traversals

export const concatAs = curryN(4, (xMi2y, m) => {
  const C = ConcatOf(m.concat, (0,m.empty)(), m.delay)
  return (t, s) => run(t, C, xMi2y, s)
})

export const concat = concatAs(id)

export const mergeAs = process.env.NODE_ENV === "production" ? concatAs : (f, m, t, d) =>
  warn(mergeAs, "`mergeAs` is obsolete, just use `concatAs`") ||
  concatAs(f, m, t, d)

export const merge = process.env.NODE_ENV === "production" ? concat : (m, t, d) =>
  warn(merge, "`merge` is obsolete, just use `concat`") ||
  concat(m, t, d)

// Folds over traversals

export const all = pipe2U(mkFirst(x => x ? void 0 : T), not)

export const and = all(id)

export const any = pipe2U(mkFirst(x => x ? T : void 0), Boolean)

export const collectAs = curry((xi2y, t, s) =>
  toArray(run(t, Collect, xi2y, s)) || [])

export const collect = collectAs(id)

export const firstAs = curry(mkFirst(x => void 0 !== x ? the(x) : x))

export const first = firstAs(id)

export const foldl = curry((f, r, t, s) =>
  fold(f, r, run(t, Collect, pair, s)))

export const foldr = curry((f, r, t, s) => {
  const xs = collectAs(pair, t, s)
  for (let i=xs.length-1; 0<=i; --i) {
    const x = xs[i]
    r = f(r, x[0], x[1])
  }
  return r
})

export const maximum = concat(Mum((x, y) => x > y))

export const minimum = concat(Mum((x, y) => x < y))

export const or = any(id)

export const product = concatAs(unto(1), Monoid((y, x) => x * y, 1))

export const sum = concatAs(unto(0), Monoid((y, x) => x + y, 0))

// Creating new traversals

export function branch(template) {
  if (process.env.NODE_ENV !== "production" && !isObject(template))
    errorGiven("`branch` expects a plain Object template", template)
  const keys = [], vals = []
  for (const k in template) {
    keys.push(k)
    vals.push(toFunction(template[k]))
  }
  return branchOn(keys, vals)
}

// Traversals and combinators

export function elems(A, xi2yA, xs, _) {
  if (seemsArrayLike(xs)) {
    return A === Ident
      ? mapPartialIndexU(xi2yA, xs)
      : traversePartialIndex(A, xi2yA, xs)
  } else {
    if (process.env.NODE_ENV !== "production")
      reqApplicative(A)
    return (0,A.of)(xs)
  }
}

export function values(A, xi2yA, xs, _) {
  if (xs instanceof Object) {
    return branchOn(keys(xs))(A, xi2yA, xs)
  } else {
    if (process.env.NODE_ENV !== "production")
      reqApplicative(A)
    return (0,A.of)(xs)
  }
}

// Operations on lenses

export const get = curry(getU)

// Creating new lenses

export const lens = curry((get, set) => (F, xi2yF, x, i) =>
  (0,F.map)(y => set(y, x, i), xi2yF(get(x, i), i)))

// Computing derived props

export function augment(template) {
  if (process.env.NODE_ENV !== "production" && !isObject(template))
    errorGiven("`augment` expects a plain Object template", template)
  return lens(
    x => {
      x = dissocPartialU(0, x)
      if (x)
        for (const k in template)
          x[k] = template[k](x)
      return x
    },
    (y, x) => {
      if (process.env.NODE_ENV !== "production" &&
          !(void 0 === y || y instanceof Object))
        errorGiven("`augment` must be set with undefined or an object", y)
      y = toObject(y)
      if (!(x instanceof Object))
        x = void 0
      let z
      function set(k, v) {
        if (!z)
          z = {}
        z[k] = v
      }
      for (const k in y) {
        if (!hasU(k, template))
          set(k, y[k])
        else
          if (x && hasU(k, x))
            set(k, x[k])
      }
      return z
    })
}

// Enforcing invariants

export function defaults(out) {
  const o2u = x => replaced(out, void 0, x)
  return (F, xi2yF, x, i) => (0,F.map)(o2u, xi2yF(void 0 !== x ? x : out, i))
}

export const required = inn => replace(inn, void 0)

export const define = v => normalizer(unto(v))

export const normalize = xi2x =>
  normalizer((x, i) => void 0 !== x ? xi2x(x, i) : void 0)

export const rewrite = yi2y => (F, xi2yF, x, i) =>
  (0,F.map)(y => void 0 !== y ? yi2y(y, i) : void 0, xi2yF(x, i))

// Lensing arrays

export const append = (F, xi2yF, xs, i) =>
  (0,F.map)(x => setIndex(seemsArrayLike(xs) ? xs.length : 0, x, xs),
            xi2yF(void 0, i))

export const filter = xi2b => (F, xi2yF, xs, i) => {
  let ts, fs
  if (seemsArrayLike(xs))
    partitionIntoIndex(xi2b, xs, ts = [], fs = [])
  return (0,F.map)(
    ts => {
      if (process.env.NODE_ENV !== "production" &&
          !(void 0 === ts || seemsArrayLike(ts)))
        errorGiven("`filter` must be set with undefined or an array-like object", ts)
      const tsN = ts ? ts.length : 0,
            fsN = fs ? fs.length : 0,
            n = tsN + fsN
      if (n)
        return n === fsN
        ? fs
        : copyToFrom(copyToFrom(Array(n), 0, ts, 0, tsN), tsN, fs, 0, fsN)
    },
    xi2yF(ts, i))
}

export const find = xi2b => choose(xs => {
  if (!seemsArrayLike(xs))
    return 0
  const i = findIndex(xi2b, xs)
  return i < 0 ? append : i
})

export function findWith(...ls) {
  const lls = compose(...ls)
  return [find(x => void 0 !== getU(lls, x)), lls]
}

export const index = process.env.NODE_ENV === "production" ? id : x => {
  if (!Number.isInteger(x) || x < 0)
    errorGiven("`index` expects a non-negative integer", x)
  return x
}

export const slice = curry((begin, end) => (F, xsi2yF, xs, i) => {
  const seems = seemsArrayLike(xs),
        xsN = seems && xs.length,
        b = sliceIndex(0, xsN, 0, begin),
        e = sliceIndex(b, xsN, xsN, end)
  return (0,F.map)(
    zs => {
      if (process.env.NODE_ENV !== "production" &&
          !(void 0 === zs || seemsArrayLike(zs)))
        errorGiven("`slice` must be set with undefined or an array-like object", zs)
      const zsN = zs ? zs.length : 0, bPzsN = b + zsN, n = xsN - e + bPzsN
      return n
        ? copyToFrom(copyToFrom(copyToFrom(Array(n), 0, xs, 0, b),
                                b,
                                zs, 0, zsN),
                     bPzsN,
                     xs, e, xsN)
        : void 0
    },
    xsi2yF(seems ? copyToFrom(Array(Math.max(0, e - b)), 0, xs, b, e) :
           void 0,
           i))
})

// Lensing objects

export const prop = process.env.NODE_ENV === "production" ? id : x => {
  if (!isString(x))
    errorGiven("`prop` expects a string", x)
  return x
}

export function props() {
  const n = arguments.length, template = {}
  for (let i=0, k; i<n; ++i)
    template[k = arguments[i]] = k
  return pick(template)
}

export const removable = (...ps) => {
  function drop(y) {
    if (!(y instanceof Object))
      return y
    for (let i=0, n=ps.length; i<n; ++i)
      if (hasU(ps[i], y))
        return y
  }
  return (F, xi2yF, x, i) => (0,F.map)(drop, xi2yF(x, i))
}

// Providing defaults

export const valueOr = v => (_F, xi2yF, x, i) =>
  xi2yF(void 0 !== x && x !== null ? x : v, i)

// Adapting to data

export const orElse =
  curry((d, l) => choose(x => void 0 !== getU(l, x) ? l : d))

// Read-only mapping

export const to = process.env.NODE_ENV === "production" ? id : wi2x =>
  warn(to, "`to` is obsolete, you can directly `compose` plain functions with optics") ||
  wi2x

export const just = process.env.NODE_ENV === "production" ? always : x =>
  warn(just, "`just` is obsolete, just use e.g. `R.always`") ||
  always(x)

// Transforming data

export function pick(template) {
  if (process.env.NODE_ENV !== "production" && !isObject(template))
    errorGiven("`pick` expects a plain Object template", template)
  return (F, xi2yF, x, i) =>
    (0,F.map)(setPick(template, x), xi2yF(getPick(template, x), i))
}

export const replace = curry((inn, out) => {
  const o2i = x => replaced(out, inn, x)
  return (F, xi2yF, x, i) => (0,F.map)(o2i, xi2yF(replaced(inn, out, x), i))
})

// Operations on isomorphisms

export const getInverse = arityN(2, setU)

// Creating new isomorphisms

export const iso =
  curry((bwd, fwd) => (F, xi2yF, x, i) => (0,F.map)(fwd, xi2yF(bwd(x), i)))

// Isomorphisms and combinators

export const identity = (_F, xi2yF, x, i) => xi2yF(x, i)

export const inverse = iso => (F, xi2yF, x, i) =>
  (0,F.map)(x => getU(iso, x), xi2yF(setU(iso, x), i))
