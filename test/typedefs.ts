import * as R from 'ramda';
import * as moment from 'moment';
import * as L from '../src';

// optics

// On lens laws

() => {
    const elem = 2
    const data = {x: 1}
    const lens = "x"

    const test = (actual, expected) => R.equals(actual, expected) || actual

    // $ExpectType { GetSet: true, SetGet: true }
    R.identity({
        GetSet: test( L.set(lens, L.get(lens, data), data), data ),
        SetGet: test( L.get(lens, L.set(lens, elem, data)), elem )
    })
}

// Operations on optics

// modify
() => {
    // $ExpectType { elems: [ { x: 2, y: 2 }, { x: 3, y: 4 } ] }
    L.modify(["elems", 0, "x"], R.inc, {elems: [{x: 1, y: 2}, {x: 3, y: 4}]})
    // $ExpectType { elems: [ { x: 0, y: 2 }, { x: 2, y: 4 } ] }
    L.modify(["elems", L.elems, "x"],
         R.dec,
         {elems: [{x: 1, y: 2}, {x: 3, y: 4}]})
}

// remove
() => {
    // $ExpectType [ { x: 2 }, { x: 3 } ]
    L.remove([0, "x"], [{x: 1}, {x: 2}, {x: 3}])
    // $ExpectType [ { x: 1 }, { y: 1 } ]
    L.remove([L.elems, "x", L.when(x => x > 1)], [{x: 1}, {x: 2, y: 1}, {x: 3}])
}

// set
() => {
    // $ExpectType {a: [{x: 11}], id: 'z'}
    L.set(["a", 0, "x"], 11, {id: "z"})
    // $ExpectType [ { x: 1 }, { x: -1, y: 1 }, { x: -1 } ]
    L.set([L.elems, "x", L.when(x => x > 1)], -1, [{x: 1}, {x: 2, y: 1}, {x: 3}])
}

// compose
() => {
    L.compose() = L.identity
    L.compose(l) = l
    L.modify(L.compose(o, ...os)) = R.compose(L.modify(o), ...os.map(L.modify))
    L.get(L.compose(o, ...os)) = R.pipe(L.get(o), ...os.map(L.get))

    // $ExpectType { a: [ 'b', 'a' ] }
    L.set(["a", 1], "a", {a: ["b", "c"]})
    // $ExpectType 'c'
    L.get(["a", 1], {a: ["b", "c"]})

    // $ExpectType 2
    L.get(["x", x => x + 1], {x: 1})
    // $ExpectType { x: 1 }
    L.set(["x", x => x + 1], 3, {x: 1})
}

// chain
() => {
    L.compose(optic, L.choose((maybeValue, index) =>
    maybeValue === undefined
    ? L.zero
    : toOptic(maybeValue, index)))
}

// choice
() => {
    // $ExpectType [ { R: 1 }, { a: 2 }, { d: 3 } ]
    L.modify([L.elems, L.choice("a", "d")], R.inc, [{R: 1}, {a: 1}, {d: 2}])
}

// choose
() => {
    const majorAxis = L.choose(({x, y} = {}) => Math.abs(x) < Math.abs(y) ? "y" : "x")
    // $ExpectType 2
    L.get(majorAxis, {x: 1, y: 2})
    // $ExpectType -3
    L.get(majorAxis, {x: -3, y: 1})
    // $ExpectType { x: 2, y: 3 }
    L.modify(majorAxis, R.negate, {x: 2, y: -3})
}

// optional
() => {
    // $ExpectType [ { x: 3 }, { y: 2, x: 3 } ]
    L.set([L.elems, "x"], 3, [{x: 1}, {y: 2}])
    // $ExpectType [ { x: 3 }, { y: 2 } ]
    L.set([L.elems, "x", L.optional], 3, [{x: 1}, {y: 2}])
}

// when
() => {
    // $ExpectType [ 0, -1, -2, -3, -4 ]
    L.modify([L.elems, L.when(x => x > 0)], R.negate, [0, -1, 2, -3, 4])
}

// zero
() => {
    // $ExpectType [ 2, 3, 4 ]
    L.collect([L.elems,
        L.choose(x => (R.is(Array, x) ? L.elems :
                        R.is(Object, x) ? "x" :
                        L.zero))],
        [1, {x: 2}, [3,4]])
}

// lazy
() => {
    const flatten = [L.optional, L.lazy(rec => {
    const elems = [L.elems, rec]
    const values = [L.values, rec]
    return L.choose(x => (x instanceof Array ? elems :
        x instanceof Object ? values :
        L.identity))
    })]

    // $ExpectType [ 1, 2, 3, 4, 5, 6 ]
    L.collect(flatten, [[[1], 2], {y: 3}, [{l: 4, r: [5]}, {x: 6}]])
    // $ExpectType [ [ [ 2 ], 3 ], { y: 4 }, [ { l: 5, r: [ 6 ] }, { x: 7 } ] ]
    L.modify(flatten, x => x+1, [[[1], 2], {y: 3}, [{l: 4, r: [5]}, {x: 6}]])
    // $ExpectType [ [ [ 1 ], 2 ], [ { r: [ 5 ] }, { x: 6 } ] ]
    L.remove([flatten, L.when(x => 3 <= x && x <= 4)],
        [[[1], 2], {y: 3}, [{l: 4, r: [5]}, {x: 6}]])
}

// log
() => {
    // $ExpectType 10
    L.get(["x", L.log()], {x: 10})
    // get 10
    // $ExpectType { x: '11' }
    L.set(["x", L.log("x")], "11", {x: 10})
    // x get 10
    // x set 11
    // get x: 10
    // $ExpectType { x: '11' }
    L.set(["x", L.log("%s x: %j")], "11", {x: 10})
    // set x: "11"
}

// toFunction
() => {
    // ?
}

// seq
() => {
    // $ExpectType [ [ [ 1 ] ] ]
    L.modify(L.seq(L.identity, L.identity, L.identity), x => [x], 1)

    const everywhere = [L.optional, L.lazy(rec => {
    const elems = [L.elems, rec]
    const values = [L.values, rec]
    return L.seq(L.choose(x => (x instanceof Array ? elems :
            x instanceof Object ? values :
            L.zero)),
        L.identity)
    })]

    // $ExpectType [ {xs: [ [ [ { x: [ 1 ] } ], [ { x: [ 2 ] } ] ] ] } ]
    L.modify(everywhere, x => [x], {xs: [{x: 1}, {x: 2}]})
}

// concat
() => {
    const Sum = {empty: () => 0, concat: (x, y) => x + y}
    // $ExpectType 6
    L.concat(Sum, L.elems, [1, 2, 3])
}

// concatAs
() => {
    // $ExpectType 6
    L.concatAs(x => x, Sum, L.elems, [1, 2, 3])
    const Collect = {empty: R.always([]), concat: R.concat}
    const toCollect = x => x !== undefined ? [x] : []
    // $ExpectType [ -1, -2 ]
    L.concatAs(R.pipe(R.negate, toCollect),
        Collect,
        ["xs", L.elems, "x"],
        {xs: [{x: 1}, {x: 2}]})
}

// all
() => {
    // $ExpectType true
    L.all(x => 1 <= x && x <= 6,
      flatten,
      [[[1], 2], {y: 3}, [{l: 4, r: [5]}, {x: 6}]])
}

// and
() => {
    // $ExpectType true
    L.and(L.elems, [])
}

// any
() => {
    // $ExpectType true
    L.any(x => x > 5,
      flatten,
      [[[1], 2], {y: 3}, [{l: 4, r: [5]}, {x: 6}]])
}

// collect
() => {
    // $ExpectType [ 1, 2 ]
    L.collect(["xs", L.elems, "x"], {xs: [{x: 1}, {x: 2}]})
}

// collectAs
() => {
    // $ExpectType [ -1, -2 ]
    L.collectAs(R.negate, ["xs", L.elems, "x"], {xs: [{x: 1}, {x: 2}]})
}

// count
() => {
    // $ExpectType 1
    L.count([L.elems, "x"], [{x: 11}, {y: 12}])
}

// first
() => {
    // $ExpectType 2
    L.first([L.elems, "y"], [{x:1},{y:2},{z:3}])
}

// firstAs
() => {
    // $ExpectType -4
    L.firstAs(x => x > 3 ? -x : undefined, L.elems, [3,1,4,1,5])
    const all = R.curry((p, t, s) => !L.firstAs(x => p(x) ? undefined : true, t, s))
    // $ExpectType true
    all(x => x < 9,
        flatten,
        [[[1], 2], {y: 3}, [{l: 4, r: [5]}, {x: 6}]])
}

// foldl
() => {
    // $ExpectType 6
    L.foldl((x, y) => x + y, 0, L.elems, [1,2,3])
}

// foldr
() => {
    // $ExpectType 6
    L.foldr((x, y) => x * y, 1, L.elems, [1,2,3])
}

// maximum
() => {
    // $ExpectType 3
    L.maximum(L.elems, [1,2,3])
}

// minimum
() => {
    // $ExpectType 1
    L.minimum(L.elems, [1,2,3])
}

// or
() => {
    // $ExpectType false
    L.or(L.elems, [])
}

// product
() => {
    // $ExpectType 6
    L.product(L.elems, [1,2,3])
}

// sum
() => {
    // $ExpectType 6
    L.sum(L.elems, [1,2,3])
}

// branch
() => {
    // $ExpectType [ 'x', 'y' ]
    L.collect(L.branch({first: L.elems, second: L.identity}),
          {first: ["x"], second: "y"})
    // $ExpectType [ -1, 2, -3 ]
    L.modify([L.pick({x: 0, z: 2}),
          L.branch({x: L.identity, z: L.identity})],
         R.negate,
         [1, 2, 3])
}

// elems
() => {
    // $ExpectType { xs: [ { x: 2 }, { x: 3 } ] }
    L.modify(["xs", L.elems, "x"], R.inc, {xs: [{x: 1}, {x: 2}]})
}

// values
() => {
    // $ExpectType Int8Array [ 0, 5, 1, 3, 5 ]
    L.modify([L.rewrite(xs => Int8Array.from(xs)), L.elems],
         R.inc,
         Int8Array.from([-1,4,0,2,4]))
    // $ExpectType { a: -1, b: -2, c: -3 }
    L.modify(L.values, R.negate, {a: 1, b: 2, c: 3})

    function XYZ(x,y,z) {
        this.x = x
        this.y = y
        this.z = z
    }

    XYZ.prototype.norm = function () {
        return (this.x * this.x +
            this.y * this.y +
            this.z * this.z)
    }

    const objectTo = R.curry((C, o) => Object.assign(Object.create(C.prototype), o))

    // $ExpectType XYZ { x: -1, y: -2, z: -3 }
    L.modify([L.rewrite(objectTo(XYZ)), L.values],
        R.negate,
        new XYZ(1,2,3))
}

// get
() => {
    // $ExpectType 101
    L.get("y", {x: 112, y: 101})
}

// lens
() => {
    const timesAsDuration = L.lens(
        ({start, end} = {}) => {
            if (undefined === start)
            return undefined
            if (undefined === end)
            return "Infinity"
            return moment.duration(moment(end).diff(moment(start))).toJSON()
        },
        (duration, {start = moment().toJSON()} = {}) => {
            if (undefined === duration || "Infinity" === duration) {
            return {start}
            } else {
            return {
                start,
                end: moment(start).add(moment.duration(duration)).toJSON()
            }
            }
        }
    )

    // $ExpectType "PT10H"
    L.get(timesAsDuration,
        {start: "2016-12-07T09:39:02.451Z",
        end: moment("2016-12-07T09:39:02.451Z").add(10, "hours").toISOString()})
    // $ExpectType { end: '2016-12-07T19:39:02.451Z', start: '2016-12-07T09:39:02.451Z' }
    L.set(timesAsDuration,
        "PT10H",
        {start: "2016-12-07T09:39:02.451Z",
        end: "2016-12-07T09:39:02.451Z"})
}

// augment
() => {
    // $ExpectType { x: 3, z: -1 }
    L.modify(L.augment({y: r => r.x + 1}),
         r => ({x: r.x + r.y, y: 2, z: r.x - r.y}),
         {x: 1})
}

// defaults
() => {
    // $ExpectType []
    L.get(["items", L.defaults([])], {})
    // $ExpectType [ 1, 2, 3 ]
    L.get(["items", L.defaults([])], {items: [1, 2, 3]})
    // $ExpectType undefined
    L.set(["items", L.defaults([])], [], {items: [1, 2, 3]})
}

// define
() => {
    // $ExpectType null
    L.get(["x", L.define(null)], {y: 10})
    // $ExpectType { y: 10, x: null }
    L.set(["x", L.define(null)], undefined, {y: 10})
}

// normalize
() => {
    // ?
}

// required
() => {
    // $ExpectType undefined
    L.remove(["items", 0], {items: [1]})
    // $ExpectType {}
    L.remove([L.required({}), "items", 0], {items: [1]})
    // $ExpectType { items: [] }
    L.remove(["items", L.required([]), 0], {items: [1]})
}

// rewrite
() => {
    // $ExpectType [ 'L', 'a', 'L', 'a' ]
    L.set(1, "a", "LoLa")

    // $ExpectType 'LaLa'
    L.set([L.rewrite(R.join("")), 1], "a", "LoLa")
}

// append
() => {
    // $ExpectType undefined
    L.get(L.append, ["x"])
    // $ExpectType [ 'x' ]
    L.set(L.append, "x", undefined)
    // $ExpectType [ 'z', 'y', 'x' ]
    L.set(L.append, "x", ["z", "y"])
}

// filter
() => {
    // $ExpectType [ 'a', 'b', 'c', 'd', '3', '4', '5', '9' ]
    L.set(L.filter(x => x <= "2"), "abcd", "3141592")
}

// find
() => {
    // $ExpectType [ 3, 4, 1, 5, 9, 2 ]
    L.remove(L.find(x => x <= 2), [3,1,4,1,5,9,2])
}

// findWith
() => {
    // $ExpectType 9
    L.get(L.findWith("x"), [{z: 6}, {x: 9}, {y: 6}])
    // $ExpectType [ { z: 6 }, { x: 3 }, { y: 6 } ]
    L.set(L.findWith("x"), 3, [{z: 6}, {x: 9}, {y: 6}])
}

// index
() => {
    // $ExpectType [ 'x', 'y', 'z' ]
    L.set(2, "z", ["x", "y", "c"])

    // $ExpectType [ 'b' ]
    L.remove(0, ["a", "b"])
    // $ExpectType undefined
    L.remove(0, ["b"])
    // $ExpectType { some: 'thing' }
    L.remove(["elems", 0], {elems: ["b"], some: "thing"})

    // $ExpectType [ 'b' ]
    L.remove([L.required([]), 0], ["a", "b"])
    // $ExpectType []
    L.remove([L.required([]), 0], ["b"])
    // $ExpectType { elems: [], some: 'thing' }
    L.remove(["elems", L.required([]), 0], {elems: ["b"], some: "thing"})

    // $ExpectType []
    L.remove(L.required([]), [])
    // $ExpectType undefined
    L.get(L.required([]), [])
}

// slice
() => {
    // $ExpectType [ 2, 3 ]
    L.get(L.slice(1, -1), [1,2,3,4])
    // $ExpectType [ 1, 2, 0 ]
    L.set(L.slice(-2, undefined), [0], [1,2,3,4])
}

// prop
() => {
    // $ExpectType 2
    L.get("y", {x: 1, y: 2, z: 3})
    // $ExpectType { x: 1, y: -2, z: 3 }
    L.set("y", -2, {x: 1, y: 2, z: 3})

    // $ExpectType XYZ { x: 3, y: 1, z: 3 }
    L.set([L.rewrite(objectTo(XYZ)), "z"], 3, new XYZ(3,1,4))
}

// props
() => {
    // $ExpectType { x: 4, z: 3 }
    L.set(L.props("x", "y"), {x: 4}, {x: 1, y: 2, z: 3})
}

// removable
() => {
    // $ExpectType { y: 2 }
    L.remove("x", {x: 1, y: 2})
    // $ExpectType undefined
    L.remove([L.removable("x"), "x"], {x: 1, y: 2})
}

// valueOr
() => {
    // $ExpectType 0
    L.get(L.valueOr(0), null)
    // $ExpectType 0
    L.set(L.valueOr(0), 0, 1)
    // $ExpectType undefined
    L.remove(L.valueOr(0), 1)
}

// orElse
() => {
    // ?
}

// pick
() => {
    const sampleFlat = {px: 1, py: 2, vx: 1.0, vy: 0.0}

    const asVec = prefix => L.pick({x: prefix + "x", y: prefix + "y"})
    const sanitize = L.pick({pos: asVec("p"), vel: asVec("v")})

    // $ExpectType { pos: { x: 1, y: 2 }, vel: { x: 1, y: 0 } }
    L.get(sanitize, sampleFlat)

    // $ExpectType { px: 6, py: 2, vx: 1, vy: 0 }
    L.modify([sanitize, "pos", "x"], R.add(5), sampleFlat)
}

// replace
() => {
    // $ExpectType 2
    L.get(L.replace(1, 2), 1)
    // $ExpectType 1
    L.set(L.replace(1, 2), 2, 0)
}

// getInverse
() => {
    var expect = (p, f) => x => p(x) ? f(x) : undefined
    const offBy1 = L.iso(expect(R.is(Number), R.inc),
        expect(R.is(Number), R.dec))
    // $ExpectType 0
    L.getInverse(offBy1, 1)
    // $ExpectType { meaning: 42 }
    L.getInverse("meaning", 42)
}

// iso
() => {
    L.set(iso, L.get(iso, x), undefined) = x
    L.get(iso, L.set(iso, y, undefined)) = y
    var uriComponent = L.iso(expect(R.is(String), decodeURIComponent),
        expect(R.is(String), encodeURIComponent))
    var jsonString = L.iso(expect(R.is(String), JSON.parse),
        expect(R.is(Object), JSON.stringify))
    var reverseString = L.iso(expect(R.is(String), R.reverse),
        expect(R.is(String), R.reverse))
    // $ExpectType "%7B%22bottle%22%3A%22egasseM%22%7D"
    L.modify([uriComponent,
        jsonString,
        "bottle",
        0,
        reverseString,
        L.rewrite(R.join("")),
        0],
        R.toUpper,
        "%7B%22bottle%22%3A%5B%22egassem%22%5D%7D")
}

// complement
() => {
    // $ExpectType false
    L.set([L.complement, L.log()],
      "Could be anything truthy",
      "Also converted to bool")
    // get false
    // set "Could be anything truthy"
}

// identity
() => {
    L.get(L.identity, x) = x
    L.modify(L.identity, f, x) = f(x)
    L.compose(L.identity, l) = l
    L.compose(l, L.identity) = l
}

// inverse
() => {
    // $ExpectType 0
    L.get(L.inverse(offBy1), 1)
}
